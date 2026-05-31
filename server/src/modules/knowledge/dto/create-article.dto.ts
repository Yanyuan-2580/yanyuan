import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
