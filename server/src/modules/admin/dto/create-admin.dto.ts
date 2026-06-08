import { IsString, IsNotEmpty, MinLength, IsArray, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];

  @IsOptional()
  status?: number;
}
