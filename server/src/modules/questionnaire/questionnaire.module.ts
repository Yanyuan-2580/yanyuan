import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questionnaire, QuestionnaireResult } from '@/database/entities';
import { AiModule } from '@/shared';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Questionnaire, QuestionnaireResult]),
    AiModule
  ],
  providers: [QuestionnaireService],
  controllers: [QuestionnaireController],
  exports: [QuestionnaireService]
})
export class QuestionnaireModule {}
