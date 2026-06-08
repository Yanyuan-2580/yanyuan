import { IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

export class ResetPasswordDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  code: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: '密码需包含字母和数字' })
  newPassword: string;
}

export class SendCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

export class CodeLoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  code: string;
}
