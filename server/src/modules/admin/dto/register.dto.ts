import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AdminRegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  nickname?: string;
}