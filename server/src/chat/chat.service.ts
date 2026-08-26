import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createSession(userId?: string, title?: string, activeMode?: string): Promise<ChatSession> {
    let userEntity: User | null = null;
    if (userId) {
      userEntity = await this.userRepository.findOne({ where: { id: userId } });
    }

    const session = this.sessionRepository.create({
      user: userEntity || undefined,
      title: title && title !== 'Đoạn chat Y Tế Mới'
        ? (title.length > 28 ? title.substring(0, 28) + '...' : title)
        : 'Đoạn chat Y Tế',
      activeMode: activeMode || 'triage_hospital',
    });
    return this.sessionRepository.save(session);
  }

  // Returns ONLY active sessions that belong specifically to the logged-in user (or guest sessions if no userId)
  async getAllSessions(userId?: string): Promise<ChatSession[]> {
    let whereCondition: any = { user: IsNull() };
    if (userId) {
      whereCondition = { user: { id: userId } };
    }

    const all = await this.sessionRepository.find({
      where: whereCondition,
      relations: { messages: true, user: true },
      order: { createdAt: 'DESC' },
    });
    // Filter out sessions that have no user messages and default title
    return all.filter((s) => s.messages && s.messages.length > 0);
  }

  async getSessionById(id: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: { messages: true, user: true },
    });
    if (!session) throw new NotFoundException(`Chat session ${id} not found`);
    return session;
  }

  async deleteSession(id: string, userId?: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!session) return false;

    // Security check: if session belongs to a user, ensure the caller is the owner
    if (session.user && userId && session.user.id !== userId) {
      return false;
    }

    const res = await this.sessionRepository.delete(id);
    return (res.affected || 0) > 0;
  }

  // AI MEMORY CONTEXT: Retrieves the last 5 messages in this chat thread for AI context
  async getLast5Messages(sessionId: string): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    return messages.reverse(); // Return in chronological order
  }

  // Returns ALL messages in chronological order for displaying in the UI
  async getAllMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
    });
  }

  async saveMessage(
    sessionId: string,
    sender: 'user' | 'ai',
    text: string,
    imageUrl?: string,
    triageResult?: any,
    recommendedHospitals?: any,
    userId?: string,
  ): Promise<ChatMessage> {
    let session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { user: true },
    });

    // Auto-create session on the fly if it doesn't exist yet
    if (!session) {
      let userEntity: User | null = null;
      if (userId) {
        userEntity = await this.userRepository.findOne({ where: { id: userId } });
      }

      const cleanTitle = text && sender === 'user'
        ? (text.length > 28 ? text.substring(0, 28) + '...' : text)
        : 'Đoạn chat Y Tế';

      session = this.sessionRepository.create({
        id: sessionId,
        user: userEntity || undefined,
        title: cleanTitle,
        activeMode: 'triage_hospital',
      });
      session = await this.sessionRepository.save(session);
    } else if ((session.title === 'Đoạn chat Y Tế' || session.title === 'Đoạn chat Y Tế Mới') && sender === 'user') {
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
