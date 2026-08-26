import { Controller, Post, Get, Param, Body, Delete, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('sessions')
  async getAllSessions(@CurrentUser('id') userId?: string) {
    return this.chatService.getAllSessions(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('session')
  async createSession(
    @CurrentUser('id') userId: string | undefined,
    @Body() body: { title?: string; activeMode?: string },
  ) {
    return this.chatService.createSession(userId, body.title, body.activeMode);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.chatService.getSessionById(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete('session/:id')
  async deleteSession(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.chatService.deleteSession(id, userId);
  }

  @Get('session/:id/history')
  async getHistory(@Param('id') id: string) {
    return this.chatService.getAllMessages(id);
  }
}
