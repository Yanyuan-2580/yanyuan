import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, { message: '用户名由3-30位字母、数字、下划线组成' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: '密码需包含字母和数字' })
  password: string;

  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}
