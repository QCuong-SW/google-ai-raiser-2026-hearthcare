import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('api/feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async submitFeedback(@Body() body: { senderName: string; senderPhone: string; content: string }) {
    return this.feedbackService.createFeedback(body.senderName, body.senderPhone, body.content);
  }

  // ADMIN ONLY ROUTE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllFeedbacks() {
    return this.feedbackService.getAllFeedbacks();
  }
}
