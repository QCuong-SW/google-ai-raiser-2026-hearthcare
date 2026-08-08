import { UserRole } from '../../user/user.entity';

export class RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}
