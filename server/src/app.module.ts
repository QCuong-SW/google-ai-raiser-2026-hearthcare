import { Module } from '@nestjs/common';  
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { HospitalModule } from './hospital/hospital.module';
import { TriageModule } from './triage/triage.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MailModule } from './mail/mail.module';

import { User } from './user/user.entity';
import { MedicalProfile } from './user/medical-profile.entity';
import { ChatSession } from './chat/chat-session.entity';
import { ChatMessage } from './chat/chat-message.entity';
import { HospitalEntity } from './hospital/hospital.entity';
import { Feedback } from './feedback/feedback.entity';
import { EmailVerificationToken } from './auth/email-verification-token.entity';
import { PasswordResetToken } from './auth/password-reset-token.entity';
import { RefreshToken } from './auth/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT', 5432);
        const dbUser = configService.get<string>('DB_USERNAME', 'lifelink');
        const dbPass = configService.get<string>('DB_PASSWORD', 'lifelink_password_2026');
        const dbName = configService.get<string>('DB_NAME', 'lifelink_db');

        const allEntities = [
          User,
          MedicalProfile,
          ChatSession,
          ChatMessage,
          HospitalEntity,
          Feedback,
          EmailVerificationToken,
          PasswordResetToken,
          RefreshToken,
        ];

        if (dbHost) {
          return {
            type: 'postgres',
            host: dbHost,
            port: dbPort,
            username: dbUser,
            password: dbPass,
            database: dbName,
            entities: allEntities,
            synchronize: true,
          } as any;
        }

        return {
          type: 'better-sqlite3',
          database: 'lifelink_db.sqlite',
          entities: allEntities,
          synchronize: true,
        } as any;
      },
    }),
    AuthModule,
    UserModule,
    ChatModule,
    HospitalModule,
    TriageModule,
    FeedbackModule,
    MailModule,
  ],
})
export class AppModule {}
