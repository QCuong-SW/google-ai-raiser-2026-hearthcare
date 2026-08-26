import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './chat-session.entity';
import { ChatMessage } from './chat-message.entity';
import { User } from '../user/user.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, ChatMessage, User])],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
