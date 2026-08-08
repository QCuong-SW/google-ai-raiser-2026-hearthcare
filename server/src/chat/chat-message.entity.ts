import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender: string; // 'user' | 'ai'

  @Column('text')
  text: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column('jsonb', { name: 'triage_result', nullable: true })
  triageResult: any;

  @Column('jsonb', { name: 'recommended_hospitals', nullable: true })
  recommendedHospitals: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ChatSession, (session) => session.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;
}
