import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService {
  
  private readonly feedbackRepository: Repository<Feedback>;

  constructor( @InjectRepository(Feedback) feedbackRepository: Repository<Feedback>,) 
  {
    this.feedbackRepository = feedbackRepository;
  }

  async createFeedback(senderName: string, senderPhone: string, content: string): Promise<Feedback> {
    const fb = this.feedbackRepository.create({ senderName, senderPhone, content });
    return this.feedbackRepository.save(fb);
  }

  async getAllFeedbacks(): Promise<Feedback[]> {
    return this.feedbackRepository.find({ order: { createdAt: 'DESC' } });
  }
}
