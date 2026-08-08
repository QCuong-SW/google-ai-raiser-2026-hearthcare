import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { HospitalService } from '../hospital/hospital.service';
import { ChatService } from '../chat/chat.service';

@Controller('api/triage')
export class TriageController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly hospitalService: HospitalService,
    private readonly chatService: ChatService,
  ) {}

  @Post('analyze')
  async analyzeTriage(
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

    // 1. Run Google Gemini Multimodal Vision AI Triage tailored to active AI Mode
    const triage = await this.geminiService.triageSymptoms(
      body.symptomQuery,
      history,
      body.imageUrl,
      mode,
    );

    if (body.imageUrl && !triage.medical_advice_disclaimer.includes('📸')) {
      triage.medical_advice_disclaimer = `📸 [Phân tích hình ảnh Gemini Vision AI]: ${triage.medical_advice_disclaimer}`;
    }

    // 2. Rank Bình Thạnh Hospitals based on specialties & emergency urgency
    const hospitals = await this.hospitalService.searchAndRankHospitals(
      lat,
      lng,
      triage.specialty_needed,
      triage.is_emergency,
    );

    // 3. Save message turn to database if session exists
    if (body.sessionId) {
      await this.chatService.saveMessage(
        body.sessionId,
        'user',
        body.symptomQuery,
        body.imageUrl,
      );
      await this.chatService.saveMessage(
        body.sessionId,
        'ai',
        triage.medical_advice_disclaimer,
        undefined,
        triage,
        mode === 'triage_hospital' ? hospitals : undefined,
      );
    }

    return {
      triage,
      hospitals: mode === 'triage_hospital' ? hospitals : [],
    };
  }
}
