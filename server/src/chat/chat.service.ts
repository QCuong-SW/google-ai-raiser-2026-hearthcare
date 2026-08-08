import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { ChatMessage } from './chat-message.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
  ) {}

  async createSession(user?: User, title?: string, activeMode?: string): Promise<ChatSession> {
    const session = this.sessionRepository.create({
      user,
      title: title && title !== 'Đoạn Triage Y Tế Mới'
        ? (title.length > 28 ? title.substring(0, 28) + '...' : title)
        : 'Đoạn Triage Y Tế',
      activeMode: activeMode || 'triage_hospital',
    });
    return this.sessionRepository.save(session);
  }

  // Returns ONLY active sessions that have messages
  async getAllSessions(): Promise<ChatSession[]> {
    const all = await this.sessionRepository.find({
      relations: { messages: true },
      order: { createdAt: 'DESC' },
    });
    // Filter out sessions that have no user messages and default title
    return all.filter((s) => s.messages && s.messages.length > 0);
  }

  async getSessionById(id: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: { messages: true },
    });
    if (!session) throw new NotFoundException(`Chat session ${id} not found`);
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    const res = await this.sessionRepository.delete(id);
    return (res.affected || 0) > 0;
  }

  // AI MEMORY CONTEXT: Retrieves the last 5 messages in this chat thread
  async getLast5Messages(sessionId: string): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    return messages.reverse(); // Return in chronological order
  }

  async saveMessage(
    sessionId: string,
    sender: 'user' | 'ai',
    text: string,
    imageUrl?: string,
    triageResult?: any,
    recommendedHospitals?: any,
  ): Promise<ChatMessage> {
    const session = await this.getSessionById(sessionId);

    // Set first user prompt as session title
    if ((session.title === 'Đoạn Triage Y Tế' || session.title === 'Đoạn Triage Y Tế Mới') && sender === 'user') {
      const cleanTitle = text || 'Phân tích ảnh lâm sàng';
      session.title = cleanTitle.length > 28 ? cleanTitle.substring(0, 28) + '...' : cleanTitle;
      await this.sessionRepository.save(session);
    }

    const msg = this.messageRepository.create({
      session,
      sender,
      text,
      imageUrl,
      triageResult,
      recommendedHospitals,
    });
    return this.messageRepository.save(msg);
  }
}
