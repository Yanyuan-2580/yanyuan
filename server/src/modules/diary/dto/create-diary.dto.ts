import { IsNotEmpty, IsInt, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

export class CreateDiaryDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  moodTags?: string[];

  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @IsOptional()
  @IsString()
  bodyFeeling?: string;

  @IsOptional()
  @IsInt()
  sleepHours?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  isPublic?: number;
}
