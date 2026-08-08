import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getAllSessions() {
    return this.chatService.getAllSessions();
  }

  @Post('session')
  async createSession(@Body() body: { title?: string; activeMode?: string }) {
    return this.chatService.createSession(undefined, body.title, body.activeMode);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.chatService.getSessionById(id);
  }

  @Delete('session/:id')
  async deleteSession(@Param('id') id: string) {
    return this.chatService.deleteSession(id);
  }

  @Get('session/:id/history')
  async getLast5Messages(@Param('id') id: string) {
    return this.chatService.getLast5Messages(id);
  }
}
