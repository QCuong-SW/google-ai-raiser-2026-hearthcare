import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configures SMTP Transporter (Fallback to Ethereal / Console log mode if SMTP is not provided)
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mail Transporter initialized for ${user}`);
    } else {
      // Development fallback mode: log email verification links to console cleanly
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.log('SMTP credentials not set. MailService operating in Console Log Dev Mode.');
    }
  }

  async sendVerificationEmail(toEmail: string, fullName: string, rawToken: string): Promise<boolean> {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?verifyToken=${rawToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f0fdf4; border: 1px solid #6ee7b7; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0; font-size: 22px;">LifeLink AI — Xác Minh Mở Tài Khoản</h2>
          <p style="color: #334155; font-size: 14px;">Hệ Thống Cấp Cứu & Triage Y Tế Thông Minh</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 14px; border: 1px solid #a7f3d0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <p style="font-size: 15px; color: #0f172a;">Xin chào <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Có một yêu cầu đăng ký tài khoản <strong>LifeLink AI</strong> bằng địa chỉ Gmail này (<strong>${toEmail}</strong>).
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Nếu đây chính là tài khoản của bạn, vui lòng bấm vào nút bên dưới để xác nhận mở khóa tài khoản và bắt đầu sử dụng đầy đủ tính năng:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: bold; border-radius: 12px; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
              Xác Nhận Đây Là Tài Khoản Của Tôi
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
            Hoặc bạn có thể copy liên kết này dán trực tiếp vào trình duyệt:<br/>
            <a href="${verifyUrl}" style="color: #059669; word-break: break-all;">${verifyUrl}</a>
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">Liên kết xác nhận có hiệu lực trong 24 giờ. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER) {
        await this.transporter.sendMail({
          from: `"LifeLink AI Support" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: '🔒 LifeLink AI — Xác nhận đây là tài khoản của tôi để hoàn tất đăng ký',
          html: htmlContent,
        });
        this.logger.log(`Verification email successfully sent to ${toEmail}`);
      } else {
        this.logger.log(`--------------------------------------------------`);
        this.logger.log(`📧 DEV EMAIL SIMULATION to: ${toEmail}`);
        this.logger.log(`🔗 Verification Link: ${verifyUrl}`);
        this.logger.log(`--------------------------------------------------`);
      }
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${toEmail}:`, err);
      return false;
    }
  }

  async sendPasswordResetOtp(toEmail: string, fullName: string, otpCode: string): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f0fdf4; border: 1px solid #6ee7b7; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0;">LifeLink AI — Khôi Phục Mật Khẩu</h2>
          <p style="color: #334155; font-size: 14px;">Hệ Thống Cấp Cứu & Triage Y Tế Thông Minh</p>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #a7f3d0;">
          <p style="font-size: 15px; color: #0f172a;">Xin chào <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong>. Sử dụng mã OTP 6 số dưới đây để đặt lại mật khẩu:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="background-color: #059669; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 12px 28px; border-radius: 12px; display: inline-block;">
              ${otpCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Mã xác nhận này có hiệu lực trong <strong>15 phút</strong>.</p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn sẽ được giữ nguyên an toàn.</p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER) {
        await this.transporter.sendMail({
          from: `"LifeLink AI Support" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: '🔑 LifeLink AI — Mã xác nhận OTP khôi phục mật khẩu',
          html: htmlContent,
        });
        this.logger.log(`Password reset OTP email sent to ${toEmail}`);
      } else {
        this.logger.log(`--------------------------------------------------`);
        this.logger.log(`🔑 DEV PASSWORD RESET OTP to: ${toEmail}`);
        this.logger.log(`🔢 OTP Code: [ ${otpCode} ]`);
        this.logger.log(`--------------------------------------------------`);
      }
      return true;
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${toEmail}:`, err);
      return false;
    }
  }
}
