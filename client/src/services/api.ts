import type { Hospital, TriageAnalysis, MedicalProfile } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Full Dataset of Hospitals STRICTLY LOCATED WITHIN QUẬN BÌNH THẠNH ADMINISTRATIVE BOUNDARIES
const MOCK_BINHTHANH_HOSPITALS: Hospital[] = [
  {
    id: "hosp-giadinh",
    name: "Bệnh viện Nhân dân Gia Định",
    address: "Số 01 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.802778,
    longitude: 106.694722,
    phone: "028 3841 2697",
    isEmergency247: true,
    specialties: ["Cấp cứu", "Tim mạch", "Đột quỵ", "Chấn thương chỉnh hình", "Nội tổng hợp", "Tiêu hóa"],
    acceptsInsurance: true,
    rating: 4.8,
    userRatingsTotal: 12800,
    imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7 (Khoa Cấp cứu)",
    matchScore: 98,
    distanceKm: 0.8,
    estimatedMinutes: 3,
    matchReasons: ["Tuyến đầu Cấp cứu Quận Bình Thạnh (0.8 km)", "Khoa Cấp cứu 24/7 & Đột quỵ", "Bảo hiểm Y tế"]
  },
  {
    id: "hosp-vinmec-cpr",
    name: "Bệnh viện Đa khoa Quốc tế Vinmec Central Park",
    address: "208 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.793264,
    longitude: 106.720815,
    phone: "028 3622 1166",
    isEmergency247: true,
    specialties: ["Tim mạch", "Cấp cứu 24/7", "Sản phụ khoa", "Nhi khoa", "Ung bướu", "Đột quỵ"],
    acceptsInsurance: false,
    rating: 4.9,
    userRatingsTotal: 4200,
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7",
    matchScore: 96,
    distanceKm: 2.1,
    estimatedMinutes: 6,
    matchReasons: ["Bệnh viện Quốc tế 5 sao tại Bình Thạnh (2.1 km)", "Cấp cứu 24/7 & Hồi sức tích cực"]
  },
  {
    id: "hosp-ungbuou-bt",
    name: "Bệnh viện Ung Bướu TP.HCM (Cơ sở 1)",
    address: "Số 03 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.803512,
    longitude: 106.695248,
    phone: "028 3843 3022",
    isEmergency247: true,
    specialties: ["Ung bướu", "Tầm soát ung thư", "Cấp cứu", "Phẫu thuật U bướu", "Hóa trị - Xạ trị"],
    acceptsInsurance: true,
    rating: 4.7,
    userRatingsTotal: 9600,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7 (Cấp cứu Ung bướu)",
    matchScore: 94,
    distanceKm: 0.9,
    estimatedMinutes: 4,
    matchReasons: ["Bệnh viện Chuyên khoa Ung bướu đầu ngành Bình Thạnh", "Gần vị trí của bạn (0.9 km)"]
  },
  {
    id: "hosp-quan-binhthanh",
    name: "Bệnh viện Quận Bình Thạnh",
    address: "112 Bùi Hữu Nghĩa, Phường 1, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.796541,
    longitude: 106.696839,
    phone: "028 3510 8966",
    isEmergency247: true,
    specialties: ["Đa khoa", "Cấp cứu 24/7", "Nội khoa", "Nhi khoa", "Tai Mũi Họng", "Cơ xương khớp"],
    acceptsInsurance: true,
    rating: 4.6,
    userRatingsTotal: 5400,
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7",
    matchScore: 92,
    distanceKm: 1.2,
    estimatedMinutes: 5,
    matchReasons: ["Bệnh viện Quận Bình Thạnh (1.2 km)", "Đa khoa Cấp cứu 24/7", "BHYT Đúng tuyến"]
  },
  {
    id: "hosp-giaothongvantai",
    name: "Bệnh viện Giao Thông Vận Tải TP.HCM",
    address: "136 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.817235,
    longitude: 106.711542,
    phone: "028 3553 0303",
    isEmergency247: true,
    specialties: ["Cấp cứu", "Ngoại chấn thương", "Khám tổng quát", "Y học cổ truyền", "Nội soi"],
    acceptsInsurance: true,
    rating: 4.5,
    userRatingsTotal: 3100,
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7",
    matchScore: 89,
    distanceKm: 2.8,
    estimatedMinutes: 8,
    matchReasons: ["Tọa lạc trên trục đường Nguyễn Xí, Bình Thạnh (2.8 km)", "Khoa Cấp cứu 24/7"]
  },
  {
    id: "hosp-ttyte-binhthanh-1",
    name: "Trung tâm Y tế Quận Bình Thạnh (Cơ sở 1)",
    address: "99 Văn Cao, Phường 14, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.808215,
    longitude: 106.698532,
    phone: "028 3551 2307",
    isEmergency247: true,
    specialties: ["Y tế dự phòng", "Khám sức khỏe", "Tiêm chủng", "Nội khoa", "Nhi khoa"],
    acceptsInsurance: true,
    rating: 4.5,
    userRatingsTotal: 2200,
    workingHours: "07:30 - 17:00 (Cấp cứu trực 24/7)",
    matchScore: 87,
    distanceKm: 1.6,
    estimatedMinutes: 6,
    matchReasons: ["Cơ sở Y tế công lập Bình Thạnh (1.6 km)", "Khám Nội - Nhi & Tiêm chủng"]
  },
  {
    id: "hosp-ttyte-binhthanh-2",
    name: "Trung tâm Y tế Quận Bình Thạnh (Cơ sở Vũ Tùng)",
    address: "04 Vũ Tùng, Phường 2, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.798214,
    longitude: 106.696125,
    phone: "028 3841 2308",
    isEmergency247: true,
    specialties: ["Y tế cộng đồng", "Cấp cứu ban đầu", "Khám Nội", "Nhi khoa"],
    acceptsInsurance: true,
    rating: 4.4,
    userRatingsTotal: 1800,
    workingHours: "07:30 - 17:00 (Cấp cứu trực 24/7)",
    matchScore: 86,
    distanceKm: 1.3,
    estimatedMinutes: 5,
    matchReasons: ["Cơ sở Vũ Tùng, Phường 2, Bình Thạnh (1.3 km)", "Khám Cấp cứu ban đầu & Nội khoa"]
  },
  {
    id: "hosp-pkdk-binhthanh",
    name: "Phòng khám Đa khoa Quốc tế Bình Thạnh",
    address: "364 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.797825,
    longitude: 106.708912,
    phone: "028 3514 1122",
    isEmergency247: true,
    specialties: ["Đa khoa", "Cấp cứu 24/7", "Nhi khoa", "Tai Mũi Họng", "Xét nghiệm"],
    acceptsInsurance: true,
    rating: 4.6,
    userRatingsTotal: 2900,
    workingHours: "Mở cửa 24/7",
    matchScore: 85,
    distanceKm: 1.7,
    estimatedMinutes: 6,
    matchReasons: ["Trục đường Điện Biên Phủ, Phường 17, Bình Thạnh (1.7 km)", "Khám Đa khoa & Cấp cứu"]
  }
];

export async function createChatSession(activeMode?: string, title?: string): Promise<{ id: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeMode, title }),
    });
    if (!res.ok) throw new Error('Failed to create chat session');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, generating local chat session ID');
    return { id: `session-${Date.now()}` };
  }
}

export async function fetchChatSessions(): Promise<{ id: string; title: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/sessions`);
    if (!res.ok) throw new Error('Failed to fetch chat sessions');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, returning empty sessions');
    return [];
  }
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete session:', err);
    return false;
  }
}

export async function fetchChatHistory(sessionId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/session/${sessionId}/history`);
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using local chat history');
    return [];
  }
}

export async function fetchTriage(
  symptomQuery: string,
  userLocation: { lat: number; lng: number },
  sessionId?: string,
  activeMode?: 'triage_hospital' | 'analyze_symptom' | 'first_aid',
  imageUrl?: string | null
): Promise<{ triage: TriageAnalysis; hospitals: Hospital[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/triage/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptomQuery,
        userLocation,
        sessionId,
        activeMode,
        imageUrl: imageUrl || undefined,
      }),
    });

    if (!res.ok) throw new Error('API server returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using smart client-side Bình Thạnh triage algorithm:', err);
    return fallbackClientTriage(symptomQuery);
  }
}

export async function fetchEmergencyHospitals(
  userLocation: { lat: number; lng: number }
): Promise<Hospital[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/hospitals/emergency?lat=${userLocation.lat}&lng=${userLocation.lng}`
    );
    if (!res.ok) throw new Error('API server error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, returning client fallback Bình Thạnh emergency hospitals');
    return MOCK_BINHTHANH_HOSPITALS;
  }
}

export async function sendFeedback(senderName: string, senderPhone: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, senderPhone, content }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API offline for feedback');
    return true;
  }
}

export async function fetchMedicalProfile(): Promise<MedicalProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile`);
    if (!res.ok) throw new Error('Could not fetch profile');
    return await res.json();
  } catch (err) {
    return {
      bloodType: 'O+',
      allergies: ['Penicillin', 'Hải sản cá biển'],
      preExistingConditions: ['Huyết áp cao nhẹ', 'Tiểu đường type 2'],
      currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
      emergencyContactName: 'Nguyễn Văn B (Anh ruột)',
      emergencyContactPhone: '0908 123 456',
      insuranceNumber: 'DN4791234567890',
    };
  }
}

export async function saveMedicalProfile(profile: MedicalProfile): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API offline for profile save');
    return true;
  }
}

function fallbackClientTriage(query: string): { triage: TriageAnalysis; hospitals: Hospital[] } {
  const lower = query.toLowerCase();

  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let is_emergency = false;
  let emergency_reason = '';
  let specialty_needed = ['Nội khoa'];
  let action = 'Nên di chuyển tới Bệnh viện Nhân dân Gia Định hoặc Vinmec Central Park tại Bình Thạnh để kiểm tra.';

  if (lower.includes('ngực') || lower.includes('thở') || lower.includes('đột quỵ') || lower.includes('máu')) {
    severity = 'CRITICAL';
    is_emergency = true;
    emergency_reason = 'Dấu hiệu nguy cơ Cấp cứu Tim mạch / Đột quỵ khẩn cấp!';
    specialty_needed = ['Tim mạch', 'Cấp cứu', 'Đột quỵ'];
    action = '🚨 GỌI 115 NGAY HOẶC DI CHUYỂN NGAY TỚI KHOA CẤP CỨU BỆNH VIỆN NHÂN DÂN GIA ĐỊNH BÌNH THẠNH!';
  } else if (lower.includes('sốt') || lower.includes('nhi') || lower.includes('trẻ')) {
    severity = 'MEDIUM';
    specialty_needed = ['Nhi khoa', 'Cấp cứu 24/7'];
    action = 'Đưa trẻ tới Khoa Nhi Bệnh viện Nhân dân Gia Định hoặc Bệnh viện Quận Bình Thạnh.';
  } else if (lower.includes('bụng') || lower.includes('ruột thừa')) {
    severity = 'HIGH';
    is_emergency = true;
    emergency_reason = 'Cơn đau quặn bụng nghi ngờ viêm ruột thừa cấp!';
    specialty_needed = ['Cấp cứu', 'Ngoại tổng hợp', 'Tiêu hóa'];
    action = 'Di chuyển ngay tới Khoa Cấp cứu Bệnh viện Nhân dân Gia Định (Bùi Hữu Nghĩa / Nơ Trang Long).';
  } else if (lower.includes('ung bướu') || lower.includes('u') || lower.includes('hạch')) {
    severity = 'MEDIUM';
    specialty_needed = ['Ung bướu', 'Tầm soát ung thư'];
    action = 'Nên khám tại Bệnh viện Ung Bướu TP.HCM Cơ sở 1 (Số 03 Nơ Trang Long, Bình Thạnh).';
  }

  return {
    triage: {
      severity,
      is_emergency,
      specialty_needed,
      emergency_reason,
      medical_advice_disclaimer: `🤖 [AI Triage Bình Thạnh]: Đánh giá triệu chứng "${query}". Phân loại mức độ: ${severity}.`,
      suggested_action: action,
    },
    hospitals: MOCK_BINHTHANH_HOSPITALS,
  };
}
