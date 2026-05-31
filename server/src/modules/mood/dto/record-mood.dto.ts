import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class RecordMoodDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore: number;

  @IsNotEmpty()
  moodType: 'happy' | 'sad' | 'angry' | 'anxious' | 'calm';

  @IsOptional()
  @IsString()
  reason?: string;
}