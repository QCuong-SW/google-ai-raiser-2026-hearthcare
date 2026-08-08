import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HospitalEntity } from './hospital.entity';
import { VIETNAM_HOSPITALS } from './hospital.data';
import { RankingService, RankedHospital } from '../ranking/ranking.service';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(HospitalEntity)
    private readonly hospitalRepository: Repository<HospitalEntity>,
    private readonly rankingService: RankingService,
  ) {}

  async getAllHospitals(): Promise<HospitalEntity[]> {
    const dbHospitals = await this.hospitalRepository.find();
    if (dbHospitals && dbHospitals.length > 0) {
      return dbHospitals;
    }
    return VIETNAM_HOSPITALS as any;
  }

  async getHospitalById(id: string): Promise<HospitalEntity> {
    const hosp = await this.hospitalRepository.findOne({ where: { id } });
    if (hosp) return hosp;
    const seedHosp = VIETNAM_HOSPITALS.find((h) => h.id === id);
    if (!seedHosp) throw new NotFoundException(`Hospital with ID ${id} not found`);
    return seedHosp as any;
  }

  async searchAndRankHospitals(
    lat: number = 10.8028, // Default Bình Thạnh lat
    lng: number = 106.6947, // Default Bình Thạnh lng
    specialties: string[] = [],
    isEmergency: boolean = false,
  ): Promise<RankedHospital[]> {
    const all = await this.getAllHospitals();
    return this.rankingService.rankHospitals(all as any, lat, lng, specialties, isEmergency);
  }

  async getImmediateEmergencyHospitals(
    lat: number = 10.8028,
    lng: number = 106.6947,
  ): Promise<RankedHospital[]> {
    const all = await this.getAllHospitals();
    const emergencyHospitals = all.filter((h) => h.isEmergency247);
    return this.rankingService.rankHospitals(emergencyHospitals as any, lat, lng, ['Cấp cứu'], true);
  }

  // ADMIN ONLY: Create or edit hospital
  async createHospital(data: Partial<HospitalEntity>): Promise<HospitalEntity> {
    const hosp = this.hospitalRepository.create(data);
    return this.hospitalRepository.save(hosp);
  }
}
