import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('hospitals')
export class HospitalEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  address!: string;

  @Column('float')
  latitude!: number;

  @Column('float')
  longitude!: number;

  @Column()
  phone!: string;

  @Column({ name: 'is_emergency_247', default: true })
  isEmergency247!: boolean;

  @Column('simple-array')
  specialties!: string[];

  @Column({ name: 'accepts_insurance', default: true })
  acceptsInsurance!: boolean;

  @Column('float', { default: 4.8 })
  rating!: number;

  @Column({ name: 'user_ratings_total', default: 1000 })
  userRatingsTotal!: number;

  @Column({ type: 'text', name: 'image_url', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'working_hours', default: 'Mở cửa 24/7' })
  workingHours!: string;
}