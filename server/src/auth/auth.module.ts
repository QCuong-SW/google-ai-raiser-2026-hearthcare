import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UserModule,
    MailModule,
    PassportModule,
    TypeOrmModule.forFeature([User, EmailVerificationToken, PasswordResetToken, RefreshToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lifelink_super_secret_jwt_key_2026',
      signOptions: { expiresIn: '15m' }, // Short-lived Access Token (15 minutes)
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, RolesGuard],
})
export class AuthModule {}
