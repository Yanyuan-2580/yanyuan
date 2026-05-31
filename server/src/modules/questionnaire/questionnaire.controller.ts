import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';

@Controller('questionnaires')
export class QuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  @Get()
  getQuestionnaires() {
    return this.questionnaireService.getQuestionnaires();
  }

  @Get(':id')
  getQuestionnaire(@Param('id') id: string) {
    return this.questionnaireService.getQuestionnaire(parseInt(id));
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submitResult(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { answers: Array<{ questionId: number; selectedValue: number }> }
  ) {
    return this.questionnaireService.submitResult(user.userId, parseInt(id), body.answers);
  }

  @Get('results/list')
  @UseGuards(JwtAuthGuard)
  getUserResults(
    @CurrentUser() user: JwtPayload,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    return this.questionnaireService.getUserResults(user.userId, parseInt(page), parseInt(pageSize));
  }

  @Get('results/:id')
  @UseGuards(JwtAuthGuard)
  getResultDetail(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.questionnaireService.getResultDetail(user.userId, parseInt(id));
  }
}
