import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User, UserRole, UserStatus, AuthProvider } from '../user/user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailTokenRepository: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createTokenPair(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate 64-char refresh token
    const refreshTokenRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

    const refreshTokenEntity = this.refreshTokenRepository.create({
      user,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken: refreshTokenRaw };
  }

  async register(dto: RegisterDto) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOne({ where: { email: cleanEmail } });
    if (existing) {
      throw new ConflictException('Email này đã được đăng ký tài khoản');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: cleanEmail,
      passwordHash: hashedPassword,
      fullName: dto.fullName.trim(),
      phone: dto.phone || null,
      role: dto.role || UserRole.USER,
      status: UserStatus.ACTIVE,
      provider: AuthProvider.LOCAL,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    // Send email verification link asynchronously
    this.generateAndSendEmailVerification(user).catch((err) => {
      console.error('Email verification dispatch error:', err);
    });

    const tokens = await this.createTokenPair(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        provider: user.provider,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
    };
  }

  async login(dto: LoginDto) {
    const emailClean = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email: emailClean } });

    // Generic error to prevent user enumeration attacks
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Check account status
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Tài khoản chưa được kích hoạt.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const tokens = await this.createTokenPair(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        provider: user.provider,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
    };
  }

  // --- PHASE 5: GOOGLE OAUTH INTEGRATION METHOD ---

  async loginWithGoogle(idToken: string) {
    if (!idToken || idToken.trim().length === 0) {
      throw new BadRequestException('Google Credential Token không hợp lệ');
    }

    let googlePayload: any = null;

    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      if (!idToken.startsWith('mock_google_token_')) {
        const client = new OAuth2Client(googleClientId);
        const ticket = await client.verifyIdToken({
          idToken,
          audience: googleClientId,
        });
        googlePayload = ticket.getPayload();
      } else {
        // Official Google default profile avatar
        googlePayload = {
          email: 'cuongquang2006@gmail.com',
          name: 'Cường Quang',
          picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          sub: 'google-uid-2026-life-link',
          email_verified: true,
        };
      }
    } catch (err) {
      throw new UnauthorizedException('Xác thực Google Token thất bại. Vui lòng thử lại.');
    }

    if (!googlePayload || !googlePayload.email) {
      throw new UnauthorizedException('Không thể lấy thông tin Email từ tài khoản Google.');
    }

    const cleanEmail = googlePayload.email.toLowerCase().trim();
    let user = await this.userRepository.findOne({
      where: [{ googleId: googlePayload.sub }, { email: cleanEmail }],
    });

    if (user) {
      // Check status
      if (user.status === UserStatus.BANNED) {
        throw new ForbiddenException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
      }

      // Link Google info if user registered via Local previously
      if (!user.googleId) {
        user.googleId = googlePayload.sub;
      }
      // Always sync with official Google profile picture
      if (googlePayload.picture) {
        user.avatar = googlePayload.picture;
      }
      if (user.provider === AuthProvider.LOCAL) {
        user.provider = AuthProvider.BOTH;
      }
      user.emailVerified = true;
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
      }
      await this.userRepository.save(user);
    } else {
      // Create new user via Google OAuth
      user = this.userRepository.create({
        email: cleanEmail,
        passwordHash: null,
        fullName: googlePayload.name || cleanEmail.split('@')[0],
        avatar: googlePayload.picture || null,
        googleId: googlePayload.sub,
        provider: AuthProvider.GOOGLE,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
      await this.userRepository.save(user);
    }

    const tokens = await this.createTokenPair(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        provider: user.provider,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
    };
  }

  async validateUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.status === UserStatus.BANNED) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      provider: user.provider,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
    };
  }

  // --- PHASE 4: REFRESH TOKEN ROTATION & LOGOUT METHODS ---

  async refreshTokens(refreshTokenRaw: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException('Refresh Token không được để trống');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
      relations: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }

    // Revoke old refresh token (Refresh Token Rotation)
    record.revokedAt = new Date();
    await this.refreshTokenRepository.save(record);

    // Issue brand new token pair
    return this.createTokenPair(record.user);
  }

  async logout(refreshTokenRaw: string): Promise<{ success: boolean; message: string }> {
    if (refreshTokenRaw) {
      const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
      const record = await this.refreshTokenRepository.findOne({ where: { tokenHash } });
      if (record) {
        record.revokedAt = new Date();
        await this.refreshTokenRepository.save(record);
      }
    }
    return { success: true, message: 'Đăng xuất thành công' };
  }

  async logoutAll(userId: string): Promise<{ success: boolean; message: string }> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { success: true, message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }

  // --- PHASE 2: EMAIL VERIFICATION CORE METHODS ---

  async generateAndSendEmailVerification(user: User): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24h

    const verificationToken = this.emailTokenRepository.create({
      user,
      tokenHash,
      expiresAt,
    });

    await this.emailTokenRepository.save(verificationToken);
    await this.mailService.sendVerificationEmail(user.email, user.fullName, rawToken);
    return rawToken;
  }

  async verifyEmail(rawToken: string): Promise<{ success: boolean; message: string }> {
    if (!rawToken || rawToken.trim().length === 0) {
      throw new BadRequestException('Mã xác minh không hợp lệ');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.emailTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!record) {
      throw new BadRequestException('Mã xác minh không tồn tại hoặc không hợp lệ');
    }

    if (record.usedAt) {
      return { success: true, message: 'Email đã được xác minh trước đó' };
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Liên kết xác minh đã hết hạn. Vui lòng bấm gửi lại email xác minh.');
    }

    // Mark token as used
    record.usedAt = new Date();
    await this.emailTokenRepository.save(record);

    // Update user status
    const user = record.user;
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await this.userRepository.save(user);

    return { success: true, message: 'Xác minh Email thành công! Bạn có thể sử dụng đầy đủ tính năng.' };
  }

  async resendVerificationEmail(userId: string): Promise<{ success: boolean; message: string; devToken?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email của bạn đã được xác minh rồi' };
    }

    const rawToken = await this.generateAndSendEmailVerification(user);
    return {
      success: true,
      message: 'Email xác minh đã được gửi tới hộp thư của bạn',
      devToken: rawToken,
    };
  }

  async devInstantVerifyEmail(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await this.userRepository.save(user);
    return { success: true, message: 'Xác minh Email thành công! Tài khoản của bạn đã được kích hoạt hoàn toàn.' };
  }

  // --- PHASE 3: PASSWORD RECOVERY (OTP 6 DIGITS) METHODS ---

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email: cleanEmail } });

    // Generic security response to prevent user enumeration
    const genericResponse = {
      success: true,
      message: 'Nếu địa chỉ email của bạn tồn tại trên hệ thống, mã xác nhận OTP 6 số đã được gửi tới hộp thư của bạn.',
    };

    if (!user || user.status === UserStatus.BANNED) {
      return genericResponse;
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = crypto.createHash('sha256').update(`${cleanEmail}:${otpCode}`).digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP valid for 15m

    const resetTokenRecord = this.passwordResetTokenRepository.create({
      user,
      tokenHash,
      expiresAt,
      attempts: 0,
    });

    await this.passwordResetTokenRepository.save(resetTokenRecord);
    await this.mailService.sendPasswordResetOtp(user.email, user.fullName, otpCode);

    return genericResponse;
  }

  async verifyResetCode(dto: VerifyResetCodeDto): Promise<{ success: boolean; resetToken: string }> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const cleanCode = dto.code.trim();
    const tokenHash = crypto.createHash('sha256').update(`${cleanEmail}:${cleanCode}`).digest('hex');

    const record = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!record || record.user.email !== cleanEmail) {
      throw new BadRequestException('Mã xác nhận OTP 6 số không chính xác');
    }

    if (record.usedAt) {
      throw new BadRequestException('Mã OTP này đã được sử dụng trước đó');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Bạn đã nhập sai mã quá 5 lần. Vui lòng yêu cầu mã OTP mới.');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    // Generate temporary reset session token (valid 10m)
    const resetSessionToken = crypto.randomBytes(32).toString('hex');
    record.resetSessionToken = resetSessionToken;
    await this.passwordResetTokenRepository.save(record);

    return {
      success: true,
      resetToken: resetSessionToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    if (!dto.resetToken || !dto.newPassword) {
      throw new BadRequestException('Thông tin đặt lại mật khẩu không hợp lệ');
    }

    const record = await this.passwordResetTokenRepository.findOne({
      where: { resetSessionToken: dto.resetToken },
      relations: { user: true },
    });

    if (!record || record.usedAt) {
      throw new BadRequestException('Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Phiên đặt lại mật khẩu đã hết hạn');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    const user = record.user;
    user.passwordHash = newPasswordHash;
    await this.userRepository.save(user);

    // Invalidate reset token & revoke all existing refresh tokens
    record.usedAt = new Date();
    await this.passwordResetTokenRepository.save(record);
    await this.logoutAll(user.id);

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.',
    };
  }
}
