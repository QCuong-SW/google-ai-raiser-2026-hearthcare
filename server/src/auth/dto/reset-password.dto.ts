import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token reset không được để trống' })
  resetToken!: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải chứa ít nhất 8 ký tự' })
  newPassword!: string;
}
