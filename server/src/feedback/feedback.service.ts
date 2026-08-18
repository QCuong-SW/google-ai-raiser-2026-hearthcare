// import từ common của nestjs gồm các thành phần sử dụng chung 
// Injectable được dùng với ft tạo dependency injection khiến ta k cần tự tạo obj new 
// mà chúng tự liên kết dựa trên dependency injection conntainer 
import { Injectable } from '@nestjs/common';
// injectrepo của typeorm vào 
import { InjectRepository } from '@nestjs/typeorm';
// import repo từ type orm để inject và sử dụng để thao tác với db 
import { Repository } from 'typeorm';
// import entity feedback để ánh xạ tương tác với table sql
import { Feedback } from './feedback.entity';

// 
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
