import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodDiary, MoodRecord, AiSession, MeditationHistory, User } from '@/database/entities';
import { ExportService } from './export.service';

@Module({
  imports: [TypeOrmModule.forFeature([MoodDiary, MoodRecord, AiSession, MeditationHistory, User])],
  providers: [ExportService],
  exports: [ExportService]
})
export class ExportModule {}
