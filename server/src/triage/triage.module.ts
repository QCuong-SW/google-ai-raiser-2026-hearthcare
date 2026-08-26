import { Module } from '@nestjs/common';
import { TriageController } from './triage.controller';
import { GeminiService } from '../gemini/gemini.service';
import { HospitalModule } from '../hospital/hospital.module';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [HospitalModule, ChatModule, UserModule],
  providers: [GeminiService],
  controllers: [TriageController],
})
export class TriageModule {}
