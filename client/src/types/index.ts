export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  isEmergency247: boolean;
  specialties: string[];
  acceptsInsurance: boolean;
  rating: number;
  userRatingsTotal: number;
  imageUrl?: string;
  workingHours: string;
  matchScore?: number;
  distanceKm?: number;
  estimatedMinutes?: number;
  matchReasons?: string[];
}

export interface TriageAnalysis {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_emergency: boolean;
  specialty_needed: string[];
  emergency_reason?: string;
  medical_advice_disclaimer: string;
  suggested_action: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  triageResult?: TriageAnalysis;
  recommendedHospitals?: Hospital[];
  imageUrl?: string;
}

export interface MedicalProfile {
  bloodType: string;
  allergies: string[];
  preExistingConditions: string[];
  currentMedications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceNumber?: string;
}
