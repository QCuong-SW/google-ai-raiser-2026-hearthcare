import { Module } from '@nestjs/common';
import { TriageController } from './triage.controller';
import { GeminiService } from '../gemini/gemini.service';
import { HospitalModule } from '../hospital/hospital.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [HospitalModule, ChatModule],
  providers: [GeminiService],
  controllers: [TriageController],
})
export class TriageModule {}
