import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { MedicalProfile } from './medical-profile.entity';
import { ChatSession } from '../chat/chat-session.entity';
import { Feedback } from '../feedback/feedback.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  BOTH = 'BOTH',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'text', name: 'password_hash', nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({ type: 'text', default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'text', default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'text', default: AuthProvider.LOCAL })
  provider!: AuthProvider;

  @Column({ type: 'text', name: 'google_id', nullable: true })
  googleId!: string | null;

  @Column({ type: 'text', nullable: true })
  avatar!: string | null;

  @Column({ type: 'boolean', name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ type: 'datetime', name: 'email_verified_at', nullable: true })
  emailVerifiedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => MedicalProfile, (profile) => profile.user, {
    cascade: true,
  })
  medicalProfile!: MedicalProfile;

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions!: ChatSession[];

  @OneToMany(() => Feedback, (fb) => fb.user)
  feedbacks!: Feedback[];
}