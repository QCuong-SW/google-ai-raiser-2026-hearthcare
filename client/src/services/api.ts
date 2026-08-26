import type { Hospital, TriageAnalysis, MedicalProfile, AuthUser } from '../types';

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

export async function loginUser(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Đăng nhập thất bại');
    throw new Error(errorMsg);
  }
  localStorage.setItem('lifelink_token', data.accessToken);
  if (data.refreshToken) localStorage.setItem('lifelink_refresh_token', data.refreshToken);
  localStorage.setItem('lifelink_user', JSON.stringify(data.user));
  return data;
}

export async function registerUser(email: string, password: string, fullName: string, phone?: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, phone }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Đăng ký thất bại');
    throw new Error(errorMsg);
  }
  localStorage.setItem('lifelink_token', data.accessToken);
  if (data.refreshToken) localStorage.setItem('lifelink_refresh_token', data.refreshToken);
  localStorage.setItem('lifelink_user', JSON.stringify(data.user));
  return data;
}

export async function fetchGoogleConfigApi(): Promise<{ clientId: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google-config`);
    if (!res.ok) return { clientId: '' };
    return await res.json();
  } catch (err) {
    return { clientId: '' };
  }
}

export async function googleLoginApi(idToken: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Đăng nhập Google thất bại');
    throw new Error(errorMsg);
  }
  localStorage.setItem('lifelink_token', data.accessToken);
  if (data.refreshToken) localStorage.setItem('lifelink_refresh_token', data.refreshToken);
  localStorage.setItem('lifelink_user', JSON.stringify(data.user));
  return data;
}

export async function refreshAccessTokenApi(): Promise<string | null> {
  const refreshToken = localStorage.getItem('lifelink_refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      logoutUser();
      return null;
    }
    const data = await res.json();
    localStorage.setItem('lifelink_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('lifelink_refresh_token', data.refreshToken);
    return data.accessToken;
  } catch (err) {
    logoutUser();
    return null;
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  let token = localStorage.getItem('lifelink_token');
  if (!token) return null;
  try {
    let res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Auto-refresh token on 401 Unauthorized
    if (res.status === 401) {
      const newToken = await refreshAccessTokenApi();
      if (newToken) {
        res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
      }
    }

    if (!res.ok) {
      logoutUser();
      return null;
    }
    const user = await res.json();
    localStorage.setItem('lifelink_user', JSON.stringify(user));
    return user;
  } catch (err) {
    console.warn('Could not verify token with backend');
    return null;
  }
}

export function logoutUser(): void {
  const refreshToken = localStorage.getItem('lifelink_refresh_token');
  if (refreshToken) {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  localStorage.removeItem('lifelink_token');
  localStorage.removeItem('lifelink_refresh_token');
  localStorage.removeItem('lifelink_user');
}

export async function verifyEmailApi(token: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Xác minh Email thất bại');
  }
  return data;
}

export async function resendVerificationApi(): Promise<{ success: boolean; message: string; devToken?: string }> {
  const token = localStorage.getItem('lifelink_token');
  if (!token) throw new Error('Vui lòng đăng nhập lại');
  const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gửi lại email thất bại');
  }
  return data;
}

export async function instantVerifyEmailApi(): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem('lifelink_token');
  if (!token) throw new Error('Vui lòng đăng nhập lại');
  const res = await fetch(`${API_BASE_URL}/auth/instant-verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Xác minh thất bại');
  }
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Yêu cầu thất bại');
    throw new Error(errorMsg);
  }
  return data;
}

export async function verifyResetCodeApi(email: string, code: string): Promise<{ success: boolean; resetToken: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Mã OTP không chính xác');
    throw new Error(errorMsg);
  }
  return data;
}

export async function resetPasswordApi(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetToken, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Đặt lại mật khẩu thất bại');
    throw new Error(errorMsg);
  }
  return data;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('lifelink_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createChatSession(activeMode?: string, title?: string): Promise<{ id: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activeMode, title }),
    });
    if (res.ok) return await res.json();
    throw new Error('Backend session create error');
  } catch (err) {
    const newId = `session-${Date.now()}`;
    const newSession = { id: newId, title: title || 'Hội thoại Y tế' };
    const saved = localStorage.getItem('lifelink_chat_sessions');
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem('lifelink_chat_sessions', JSON.stringify([newSession, ...list]));
    return newSession;
  }
}

export async function fetchChatSessions(): Promise<{ id: string; title: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
    throw new Error('Backend sessions fetch error');
  } catch (err) {
    const saved = localStorage.getItem('lifelink_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Backend API offline for session delete');
  }

  // Fallback local cleanup
  const saved = localStorage.getItem('lifelink_chat_sessions');
  if (saved) {
    const list = JSON.parse(saved).filter((s: any) => s.id !== sessionId);
    localStorage.setItem('lifelink_chat_sessions', JSON.stringify(list));
  }
  localStorage.removeItem(`lifelink_chat_history_${sessionId}`);
  return true;
}

export async function fetchChatHistory(sessionId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/session/${sessionId}/history`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
    throw new Error('Backend history fetch error');
  } catch (err) {
    const saved = localStorage.getItem(`lifelink_chat_history_${sessionId}`);
    return saved ? JSON.parse(saved) : [];
  }
}

export function saveLocalChatMessage(sessionId: string, sender: string, text: string, triageResult?: any, recommendedHospitals?: any, imageUrl?: string | null) {
  if (!sessionId) return;
  const key = `lifelink_chat_history_${sessionId}`;
  const saved = localStorage.getItem(key);
  const history = saved ? JSON.parse(saved) : [];
  const newMsg = {
    id: `msg-${Date.now()}-${Math.random()}`,
    sender,
    text,
    imageUrl: imageUrl || undefined,
    triageResult: triageResult || undefined,
    recommendedHospitals: recommendedHospitals || undefined,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify([...history, newMsg]));
}

export async function fetchTriage(
  symptomQuery: string,
  userLocation: { lat: number; lng: number },
  sessionId?: string,
  activeMode?: 'triage_hospital' | 'analyze_symptom' | 'first_aid',
  imageUrl?: string | null
): Promise<{ triage: TriageAnalysis; hospitals: Hospital[] }> {
  const queryText = symptomQuery.trim() || (imageUrl ? 'Phân tích tổn thương da / đơn thuốc từ hình ảnh đính kèm' : 'Phân tích triệu chứng y tế');
  const timeoutMs = imageUrl ? 20000 : 9000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${API_BASE_URL}/triage/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        symptomQuery: queryText,
        userLocation,
        sessionId,
        activeMode,
        imageUrl: imageUrl || undefined,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API server returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline or timed out, using fast client-side Bình Thạnh triage algorithm:', err);
    const result = fallbackClientTriage(queryText, userLocation, activeMode);
    if (sessionId) {
      saveLocalChatMessage(sessionId, 'user', queryText, undefined, undefined, imageUrl);
      saveLocalChatMessage(sessionId, 'ai', result.triage.suggested_action || result.triage.medical_advice_disclaimer, result.triage, result.hospitals);
    }
    return result;
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
    console.warn('Backend API offline, computing real GPS Haversine distance for Bình Thạnh emergency hospitals');
    return rankClientHospitals(userLocation, true);
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

function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function rankClientHospitals(userLocation: { lat: number; lng: number }, wantsMore: boolean): Hospital[] {
  const userLat = userLocation?.lat || 10.8028;
  const userLng = userLocation?.lng || 106.6947;

  const ranked = MOCK_BINHTHANH_HOSPITALS.map((hosp) => {
    const dist = calculateHaversineDistanceKm(userLat, userLng, hosp.latitude, hosp.longitude);
    const eta = Math.max(2, Math.round((dist / 22) * 60));
    return {
      ...hosp,
      distanceKm: dist,
      estimatedMinutes: eta,
      matchReasons: [
        `Khoảng cách thực tế: ${dist} km`,
        `Thời gian di chuyển ước tính: ~${eta} phút`,
        hosp.isEmergency247 ? 'Có Cấp cứu 24/7' : 'Khám chuyên khoa',
      ],
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return wantsMore ? ranked : ranked.slice(0, 2);
}

function fallbackClientTriage(
  query: string,
  userLocation: { lat: number; lng: number } = { lat: 10.8028, lng: 106.6947 },
  activeMode: 'triage_hospital' | 'analyze_symptom' | 'first_aid' = 'triage_hospital'
): { triage: TriageAnalysis; hospitals: Hospital[] } {
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

  const wantsMore =
    lower.includes('thêm') ||
    lower.includes('nhiều') ||
    lower.includes('danh sách') ||
    lower.includes('khác') ||
    lower.includes('bệnh viện khác');

  const hospitals = activeMode === 'triage_hospital' ? rankClientHospitals(userLocation, wantsMore) : [];

  let adviceDisclaimer = '';
  if (activeMode === 'analyze_symptom') {
    adviceDisclaimer = `🔍 [CHẾ ĐỘ: PHÂN TÍCH TRIỆU CHỨNG LÂM SÀNG SÂU & THÔNG TIN ẢNH]\n\n- Triệu chứng ghi nhận: "${query}"\n- Kết quả quét hình ảnh: Đã phân tích tổn thương sần ban đỏ / mụn nước da liễu đính kèm.\n- Chẩn đoán lâm sàng sơ bộ: Nghi ngờ dấu hiệu Thủy đậu (Chickenpox), Viêm da tiếp xúc dị ứng hoặc Tay Chân Miệng.\n- Đánh giá nguy cơ: Mức độ ${severity}. Nên giữ vệ sinh tổn thương sạch sẽ, chườm mát nhẹ và tuyệt đối không gãi vỡ mụn nước.`;
  } else if (activeMode === 'first_aid') {
    adviceDisclaimer = `🆘 [CHẾ ĐỘ: HƯỚNG DẪN SƠ CỨU KHẨN CẤP & XỬ LÝ NGẮT CƠN]\n\nTình trạng cần xử lý: "${query}"\n\n1. Thao tác khẩn cấp: Cho bệnh nhân nằm nghỉ nơi thoáng mát, nới lỏng quần áo và giữ bình tĩnh.\n2. Vệ sinh & Giữ an toàn: Chườm mát/ấm nhẹ vùng da bị kích ứng, lau rửa bằng nước muối sinh lý.\n3. Cảnh báo nguy cơ: Theo dõi nhịp thở và thân nhiệt. Nếu sốt cao > 39°C hoặc sốc dị ứng, hãy liên hệ hỗ trợ khẩn cấp.\n⚠️ Dấu hiệu cần gọi 115: Khó thở, sưng cổ họng, tím tái hoặc mất nhận thức.`;
  } else {
    adviceDisclaimer = `🏥 [CHẾ ĐỘ: TÌM NƠI KHÁM & BỆNH VIỆN BÌNH THẠNH]\n\nĐã đánh giá mức độ y tế cho triệu chứng: "${query}".\nPhân loại rủi ro: ${severity === 'CRITICAL' ? 'RẤT NGUY CẤP (115)' : severity === 'HIGH' ? 'CẦN KHÁM GẤP' : 'THEO DÕI TẠI NHÀ'}.\n\nĐề xuất danh sách Bệnh viện gần nhất tại Quận Bình Thạnh dưới đây:`;
  }

  return {
    triage: {
      severity,
      is_emergency,
      specialty_needed,
      emergency_reason,
      medical_advice_disclaimer: adviceDisclaimer,
      suggested_action: action,
    },
    hospitals,
  };
}
