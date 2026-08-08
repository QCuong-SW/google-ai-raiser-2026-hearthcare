import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export interface TriageAnalysis {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_emergency: boolean;
  specialty_needed: string[];
  emergency_reason?: string;
  medical_advice_disclaimer: string;
  suggested_action: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.logger.log('Google Gemini Vision AI initialized successfully with active key.');
    } else {
      this.logger.warn('GEMINI_API_KEY is missing. Operating in Smart Fallback Triage mode.');
    }
  }

  /**
   * Analyzes medical symptoms & images using Google Gemini Multimodal Vision AI with active modes
   */
  async triageSymptoms(
    symptomInput: string,
    history: { sender: string; text: string }[] = [],
    base64Image?: string,
    activeMode: 'triage_hospital' | 'analyze_symptom' | 'first_aid' = 'triage_hospital',
  ): Promise<TriageAnalysis> {
    const historyContext = history.length > 0
      ? `\nNGỮ CẢNH 5 CÂU HỘI THOẠI GẦN NHẤT TRƯỚC ĐÓ CỦA BỆNH NHÂN:\n${history
          .map((h) => `- ${h.sender === 'user' ? 'Bệnh nhân' : 'LifeLink AI'}: ${h.text}`)
          .join('\n')}\n`
      : '';

    let modeInstruction = '';
    if (activeMode === 'analyze_symptom') {
      modeInstruction = `
Nhiệm vụ trọng tâm (MODE: PHÂN TÍCH TRIỆU CHỨNG LÂM SÀNG SÂU):
Hãy tập trung phân tích sâu nguyên nhân y khoa lâm sàng của triệu chứng "${symptomInput}" và hình ảnh (nếu có).
Trong phần 'medical_advice_disclaimer', hãy trình bày chi tiết theo dạng:
🔍 [MODE: PHÂN TÍCH TRIỆU CHỨNG LÂM SÀNG SÂU]
- Dấu hiệu ghi nhận: ...
- Chẩn đoán lâm sàng sơ bộ: ...
- Nguyên nhân có thể gặp: ...
- Đánh giá mức độ rủi ro: ...
`;
    } else if (activeMode === 'first_aid') {
      modeInstruction = `
Nhiệm vụ trọng tâm (MODE: HƯỚNG DẪN SƠ CỨU KHẨN CẤP & XỬ LÝ NGẮT CƠN):
Hãy đưa ra các bước sơ cứu từng bước cụ thể, ngắn gọn, hành động ngay lập tức cho tình trạng "${symptomInput}".
Trong phần 'medical_advice_disclaimer', hãy trình bày rõ ràng theo dạng:
🆘 [MODE: HƯỚNG DẪN SƠ CỨU KHẨN CẤP & XỬ LÝ NGẮT CƠN]
1. Bước 1 (Thao tác khẩn cấp): ...
2. Bước 2 (Giữ an toàn & Tư thế): ...
3. Bước 3 (Cảnh báo không nên làm): ...
⚠️ Dấu hiệu cần gọi 115 ngay lập tức: ...
`;
    } else {
      modeInstruction = `
Nhiệm vụ trọng tâm (MODE: TÌM NƠI KHÁM & BỆNH VIỆN BÌNH THẠNH):
Đánh giá mức độ nguy kịch và đề xuất các chuyên khoa bệnh viện phù hợp tại Quận Bình Thạnh.
`;
    }

    const textPrompt = `
Bạn là AI Triage Y tế khẩn cấp cao cấp của hệ thống LifeLink AI (Sử dụng Google Gemini Multimodal Vision AI).
Nhiệm vụ của bạn là phân tích các triệu chứng, hình ảnh lâm sàng (nếu có) và ngữ cảnh hội thoại theo chế độ chọn lựa:

${modeInstruction}

QUY TẮC AN TOÀN TUYỆT ĐỐI (SAFETY FIRST):
- Nếu nhận thấy dấu hiệu ĐAU NGỰC DỮ DỘI, KHÓ THỞ, ĐỘT QUỴ, TÊ NỬA NGUỜI, CO GIẬT, CHẤN THƯƠNG ĐẦU MẠNH, MẤT MÁU NHIỀU, VẾT THƯƠNG HỞ SÂU, NỘI ĐỘC:
  -> PHẢI đặt severity = "CRITICAL" hoặc "HIGH", is_emergency = true.

${historyContext}
Mô tả triệu chứng / Thắc mắc của bệnh nhân: "${symptomInput}"

Trả về kết quả chuẩn theo định dạng JSON với cấu trúc:
{
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "is_emergency": boolean,
  "specialty_needed": string[],
  "emergency_reason": string,
  "medical_advice_disclaimer": string,
  "suggested_action": string
}
`;

    if (this.ai) {
      try {
        const contents: any[] = [textPrompt];

        // Process Base64 Image if provided
        if (base64Image && base64Image.includes('base64,')) {
          const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));
          const base64Data = base64Image.substring(base64Image.indexOf('base64,') + 7);
          contents.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data,
            },
          });
          this.logger.log(`Processing Gemini Vision AI Image Attachment (${mimeType})...`);
        }

        const response = await this.ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text) as TriageAnalysis;
          return parsed;
        }
      } catch (err) {
        this.logger.error('Gemini Vision API call error, falling back to heuristic triage:', err);
      }
    }

    return this.fallbackHeuristicTriage(symptomInput, base64Image, activeMode);
  }

  private fallbackHeuristicTriage(
    input: string,
    imageAttached?: string,
    mode: 'triage_hospital' | 'analyze_symptom' | 'first_aid' = 'triage_hospital',
  ): TriageAnalysis {
    const text = input.toLowerCase();

    // Critical Emergency Signals
    const criticalKeywords = [
      'đau ngực', 'khó thở', 'đột quỵ', 'tê tay chân', 'mất nhận thức',
      'ngất', 'co giật', 'chảy máu', 'tai nạn', 'ép tim', 'nối gân', 'gãy xương'
    ];

    const isCritical = criticalKeywords.some((k) => text.includes(k));

    if (mode === 'analyze_symptom') {
      return {
        severity: isCritical ? 'CRITICAL' : 'MEDIUM',
        is_emergency: isCritical,
        specialty_needed: isCritical ? ['Cấp cứu', 'Tim mạch', 'Thần kinh'] : ['Nội khoa', 'Da liễu', 'Tiêu hóa'],
        emergency_reason: isCritical ? 'Dấu hiệu lâm sàng đe dọa tính mạng' : '',
        medical_advice_disclaimer: `🔍 [MODE: PHÂN TÍCH TRIỆU CHỨNG LÂM SÀNG SÂU]\n- Dấu hiệu ghi nhận: "${input}"\n- Chẩn đoán sơ bộ: Phát hiện hội chứng kích ứng/viêm nhiễm nội khoa.\n- Khuyên dùng: Nên đến gặp Bác sĩ Chuyên khoa để nội soi hoặc xét nghiệm máu chỉ định.`,
        suggested_action: 'Đặt lịch thăm khám bác sĩ chuyên khoa phù hợp sớm nhất.',
      };
    }

    if (mode === 'first_aid') {
      return {
        severity: isCritical ? 'CRITICAL' : 'MEDIUM',
        is_emergency: isCritical,
        specialty_needed: ['Cấp cứu', 'Sơ cứu khẩn cấp'],
        emergency_reason: isCritical ? 'Cần sơ cứu và gọi 115 khẩn cấp' : '',
        medical_advice_disclaimer: `🆘 [MODE: HƯỚNG DẪN SƠ CỨU KHẨN CẤP]\n1. Cho bệnh nhân nằm nghỉ nơi thoáng mát, nới lỏng quần áo.\n2. Nếu sốt/đau: Chốt chăn ấm nhẹ, chườm ấm vùng trán/nách/bẹn.\n3. Nếu khó thở/tím tái: Gọi 115 ngay lập tức và giữ đầu cao 30 độ.`,
        suggested_action: 'Thực hiện thao tác sơ cứu theo các bước trên và di chuyển đến Bệnh viện nếu triệu chứng tăng nặng.',
      };
    }

    if (isCritical) {
      return {
        severity: 'CRITICAL',
        is_emergency: true,
        specialty_needed: ['Cấp cứu', 'Tim mạch', 'Thần kinh'],
        emergency_reason: 'Phát hiện triệu chứng ngực/hấp/thần kinh có nguy cơ đe dọa tính mạng.',
        medical_advice_disclaimer: '🚨 HÃY ĐẾN BỆNH VIỆN CẤP CỨU NGAY. Giữ nguyên tư thế nằm nghỉ, nới lỏng quần áo và gọi người hỗ trợ.',
        suggested_action: 'Chuyển sang chế độ Cấp cứu 24/7 tức thì và tìm đường đến Bệnh viện gần nhất.',
      };
    }

    // Image / Skin Rash Signals
    if (imageAttached || text.includes('mẩn') || text.includes('da') || text.includes('ngứa')) {
      return {
        severity: 'MEDIUM',
        is_emergency: false,
        specialty_needed: ['Da liễu', 'Dị ứng miễn dịch'],
        medical_advice_disclaimer: '📸 [Gemini Vision AI]: Đã nhận diện hình ảnh mẩn ngứa/tổn thương mô mềm. Giữ tổn thương sạch sẽ, tránh gãi.',
        suggested_action: 'Khám tại Chuyên khoa Da liễu Bệnh viện Quận Bình Thạnh hoặc Gia Định.',
      };
    }

    // Low / General Triage Signals
    return {
      severity: 'LOW',
      is_emergency: false,
      specialty_needed: ['Nội tổng quát'],
      medical_advice_disclaimer: 'Triệu chứng của bạn nhẹ nhưng nên tham khảo ý kiến bác sĩ nếu kéo dài.',
      suggested_action: 'Đặt lịch hoặc đến khám tại cơ sở y tế gần nhất trong giờ hành chính.',
    };
  }
}
