import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('medical_profiles')
export class MedicalProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'blood_type', default: 'O+' })
  bloodType: string;

  @Column('simple-array', { nullable: true })
  allergies: string[];

  @Column('simple-array', { name: 'pre_existing_conditions', nullable: true })
  preExistingConditions: string[];

  @Column('simple-array', { name: 'current_medications', nullable: true })
  currentMedications: string[];

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Column({ name: 'insurance_number', nullable: true })
  insuranceNumber: string;

  @OneToOne(() => User, (user) => user.medicalProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
