import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 'Đoạn chat Y Tế' })
  title!: string;

  @Column({ name: 'active_mode', default: 'triage_hospital' })
  activeMode!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.chatSessions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => ChatMessage, (msg) => msg.session, {
    cascade: true,
  })
  messages!: ChatMessage[];
}