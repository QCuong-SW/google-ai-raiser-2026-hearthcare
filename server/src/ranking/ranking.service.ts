import { Injectable } from '@nestjs/common';
import { Hospital } from '../hospital/hospital.data';

export interface RankedHospital extends Hospital {
  matchScore: number; // 0 - 100
  distanceKm: number;
  estimatedMinutes: number;
  matchReasons: string[];
}

@Injectable()
export class RankingService {
  /**
   * Calculates distance between two lat/lng coordinates in km (Haversine formula)
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Ranks hospitals based on 5 weighted factors:
   * 35% Specialty Match
   * 25% Proximity (Distance)
   * 15% 24/7 Open Status
   * 15% Rating Score
   * 10% Travel ETA
   */
  rankHospitals(
    hospitals: Hospital[],
    userLat: number,
    userLng: number,
    targetSpecialties: string[] = [],
    isEmergency: boolean = false
  ): RankedHospital[] {
    const ranked = hospitals.map((hosp) => {
      const distance = this.calculateDistanceKm(userLat, userLng, hosp.latitude, hosp.longitude);
      
      // Estimated travel time in city traffic (~25 km/h)
      const estimatedMinutes = Math.max(2, Math.round((distance / 25) * 60));

      // 1. Specialty Score (35%)
      let specialtyScore = 50;
      const matchedSpecialties: string[] = [];
      
      if (targetSpecialties.length > 0) {
        const matches = hosp.specialties.filter((s) =>
          targetSpecialties.some((target) =>
            s.toLowerCase().includes(target.toLowerCase()) ||
            target.toLowerCase().includes(s.toLowerCase())
          )
        );
        if (matches.length > 0) {
          specialtyScore = 100;
          matchedSpecialties.push(...matches);
        } else {
          specialtyScore = 40;
        }
      } else if (isEmergency) {
        if (hosp.specialties.includes('Cấp cứu')) {
          specialtyScore = 100;
          matchedSpecialties.push('Cấp cứu 24/7');
        }
      }

      // 2. Distance Score (25%)
      // 0 km = 100, 10 km = 50, 20 km+ = 0
      const distanceScore = Math.max(0, Math.min(100, 100 - distance * 5));

      // 3. 24/7 Open Hours Score (15%)
      const hoursScore = hosp.isEmergency247 ? 100 : (isEmergency ? 20 : 70);

      // 4. Rating Score (15%)
      const ratingScore = (hosp.rating / 5.0) * 100;

      // 5. Travel Time ETA Score (10%)
      const etaScore = Math.max(0, Math.min(100, 100 - estimatedMinutes * 2));

      // Total Weighted Score
      const totalScore = Math.round(
        specialtyScore * 0.35 +
        distanceScore * 0.25 +
        hoursScore * 0.15 +
        ratingScore * 0.15 +
        etaScore * 0.10
      );

      // Build explainability reasons
      const matchReasons: string[] = [];
      if (distance <= 3) matchReasons.push(`Gần vị trí của bạn (${distance} km)`);
      if (hosp.isEmergency247) matchReasons.push('Có khoa Cấp cứu 24/7');
      if (matchedSpecialties.length > 0) {
        matchReasons.push(`Phù hợp chuyên khoa: ${matchedSpecialties.join(', ')}`);
      }
      if (hosp.rating >= 4.7) matchReasons.push(`Đánh giá rất cao (${hosp.rating}★)`);

      return {
        ...hosp,
        matchScore: totalScore,
        distanceKm: distance,
        estimatedMinutes,
        matchReasons,
      };
    });

    // Sort by highest match score
    return ranked.sort((a, b) => b.matchScore - a.matchScore);
  }
}
