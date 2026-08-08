import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MedicalProfile } from './medical-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MedicalProfile)
    private readonly profileRepository: Repository<MedicalProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: { medicalProfile: true },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { medicalProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfile(userId: string): Promise<MedicalProfile> {
    let profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      const user = await this.findById(userId);
      profile = this.profileRepository.create({
        user,
        bloodType: 'O+',
        allergies: ['Penicillin', 'Hải sản cá biển'],
        preExistingConditions: ['Huyết áp cao nhẹ', 'Tiểu đường type 2'],
        currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
        emergencyContactName: 'Nguyễn Văn B (Anh ruột)',
        emergencyContactPhone: '0908 123 456',
        insuranceNumber: 'DN4791234567890',
      });
      await this.profileRepository.save(profile);
    }
    return profile;
  }

  async updateProfile(userId: string, updateData: Partial<MedicalProfile>): Promise<MedicalProfile> {
    const profile = await this.getProfile(userId);
    Object.assign(profile, updateData);
    return this.profileRepository.save(profile);
  }
}
