import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: '密码需包含字母和数字' })
  newPassword: string;
}
