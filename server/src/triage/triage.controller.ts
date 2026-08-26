import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { HospitalService } from '../hospital/hospital.service';
import { ChatService } from '../chat/chat.service';
import { UserService } from '../user/user.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/triage')
export class TriageController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly hospitalService: HospitalService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('analyze')
  async analyzeTriage(
    @CurrentUser('id') userId: string | undefined,
    @Body()
    body: {
      symptomQuery: string;
      sessionId?: string;
      activeMode?: 'triage_hospital' | 'analyze_symptom' | 'first_aid';
      imageUrl?: string;
      userLocation?: { lat: number; lng: number };
    },
  ) {
    const lat = body.userLocation?.lat || 10.8028;
    const lng = body.userLocation?.lng || 106.6947;
    const mode = body.activeMode || 'triage_hospital';

    let history: { sender: string; text: string }[] = [];
    if (body.sessionId) {
      const last5 = await this.chatService.getLast5Messages(body.sessionId);
      history = last5.map((m) => ({ sender: m.sender, text: m.text }));
    }

    let medicalProfileContext = undefined;
    if (userId) {
      try {
        const userProfile = await this.userService.getProfile(userId);
        if (userProfile) {
          medicalProfileContext = {
            bloodType: userProfile.bloodType || undefined,
            allergies: userProfile.allergies || undefined,
            preExistingConditions: userProfile.preExistingConditions || undefined,
            currentMedications: userProfile.currentMedications || undefined,
            emergencyContactName: userProfile.emergencyContactName || undefined,
            emergencyContactPhone: userProfile.emergencyContactPhone || undefined,
          };
        }
      } catch (err) {
        // Fallback if no profile is saved
      }
    }

    // 1. Run Google Gemini Multimodal Vision AI Triage tailored to active AI Mode & Medical Profile
    const triage = await this.geminiService.triageSymptoms(
      body.symptomQuery,
      history,
      body.imageUrl,
      mode,
      medicalProfileContext,
    );

    if (body.imageUrl && !triage.medical_advice_disclaimer.includes('📸')) {
      triage.medical_advice_disclaimer = `📸 [Phân tích hình ảnh Gemini Vision AI]: ${triage.medical_advice_disclaimer}`;
    }

    // 2. Rank Bình Thạnh Hospitals based on specialties & emergency urgency
    const allHospitals = await this.hospitalService.searchAndRankHospitals(
      lat,
      lng,
      triage.specialty_needed,
      triage.is_emergency,
    );

    // Limit to TOP 2 most relevant hospitals by default unless user asks for more
    const lowerQuery = (body.symptomQuery || '').toLowerCase();
    const wantsMoreHospitals =
      lowerQuery.includes('thêm') ||
      lowerQuery.includes('nhiều') ||
      lowerQuery.includes('danh sách') ||
      lowerQuery.includes('khác') ||
      lowerQuery.includes('bệnh viện khác');

    const hospitals = wantsMoreHospitals ? allHospitals.slice(0, 6) : allHospitals.slice(0, 2);

    // 3. Save message turn to database if session exists (linked to logged-in user if available)
    if (body.sessionId) {
      await this.chatService.saveMessage(
        body.sessionId,
        'user',
        body.symptomQuery,
        body.imageUrl,
        undefined,
        undefined,
        userId,
      );
      await this.chatService.saveMessage(
        body.sessionId,
        'ai',
        triage.medical_advice_disclaimer,
        undefined,
        triage,
        mode === 'triage_hospital' ? hospitals : undefined,
        userId,
      );
    }

    return {
      triage,
      hospitals: mode === 'triage_hospital' ? hospitals : [],
    };
  }
}
