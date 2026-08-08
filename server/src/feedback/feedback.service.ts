import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async createFeedback(senderName: string, senderPhone: string, content: string): Promise<Feedback> {
    const fb = this.feedbackRepository.create({ senderName, senderPhone, content });
    return this.feedbackRepository.save(fb);
  }

  async getAllFeedbacks(): Promise<Feedback[]> {
    return this.feedbackRepository.find({ order: { createdAt: 'DESC' } });
  }
}
