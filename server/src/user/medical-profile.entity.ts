import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('medical_profiles')
export class MedicalProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'blood_type', default: 'O+' })
  bloodType!: string;

  @Column('simple-array', { nullable: true })
  allergies!: string[] | null;

  @Column('simple-array', {
    name: 'pre_existing_conditions',
    nullable: true,
  })
  preExistingConditions!: string[] | null;

  @Column('simple-array', {
    name: 'current_medications',
    nullable: true,
  })
  currentMedications!: string[] | null;

  @Column({ type: 'text', name: 'emergency_contact_name', nullable: true })
  emergencyContactName!: string | null;

  @Column({ type: 'text', name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: 'text', name: 'insurance_number', nullable: true })
  insuranceNumber!: string | null;

  @OneToOne(() => User, (user) => user.medicalProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}