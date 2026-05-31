import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Questionnaire, QuestionnaireResult } from '@/database/entities';
import { AiModule } from '@/shared';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Questionnaire, QuestionnaireResult]),
    AiModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [QuestionnaireService],
  controllers: [QuestionnaireController],
  exports: [QuestionnaireService]
})
export class QuestionnaireModule {}
