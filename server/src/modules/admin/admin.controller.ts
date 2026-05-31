import { Controller, Post, Get, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { KnowledgeService } from '@/modules/knowledge/knowledge.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/register.dto';
import { CreateArticleDto } from '@/modules/knowledge/dto/create-article.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private knowledgeService: KnowledgeService
  ) {}

  // ==================== Auth ====================

  @Post('register')
  register(@Body() dto: AdminRegisterDto) {
    return this.adminService.register(dto);
  }

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() payload: JwtPayload) {
    return this.adminService.logout(payload.userId);
  }

  // ==================== User Management ====================

  @Get('users')
  @UseGuards(JwtAuthGuard)
  getUsers(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('keyword') keyword?: string
  ) {
    return this.adminService.getUsers(
      parseInt(page),
      parseInt(pageSize),
      status ? parseInt(status) : undefined,
      riskLevel ? parseInt(riskLevel) : undefined,
      keyword
    );
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(parseInt(id));
  }

  @Post('users')
  @UseGuards(JwtAuthGuard)
  createUser(@Body() body: { phone: string; password: string; nickname?: string }) {
    return this.adminService.createUser(body);
  }

  @Put('users/:id/status')
  @UseGuards(JwtAuthGuard)
  updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: number },
    @CurrentUser() admin: JwtPayload
  ) {
    return this.adminService.updateUserStatus(parseInt(id), body.status, admin.userId);
  }

  @Put('users/:id/risk-level')
  @UseGuards(JwtAuthGuard)
  updateUserRiskLevel(
    @Param('id') id: string,
    @Body() body: { riskLevel: number },
    @CurrentUser() admin: JwtPayload
  ) {
    return this.adminService.updateUserRiskLevel(parseInt(id), body.riskLevel);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(parseInt(id));
  }

  // ==================== Article Management ====================

  @Get('articles')
  @UseGuards(JwtAuthGuard)
  getArticles(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('keyword') keyword?: string
  ) {
    return this.adminService.getArticles(
      parseInt(page),
      parseInt(pageSize),
      status ? parseInt(status) : undefined,
      categoryId ? parseInt(categoryId) : undefined,
      keyword
    );
  }

  @Get('articles/:id')
  @UseGuards(JwtAuthGuard)
  getArticle(@Param('id') id: string) {
    return this.adminService.getArticleDetail(parseInt(id));
  }

  @Post('articles')
  @UseGuards(JwtAuthGuard)
  createArticle(@Body() dto: CreateArticleDto, @CurrentUser() admin: JwtPayload) {
    return this.adminService.adminCreateArticle(dto, admin.userId);
  }

  @Put('articles/:id')
  @UseGuards(JwtAuthGuard)
  updateArticle(@Param('id') id: string, @Body() dto: Partial<CreateArticleDto>) {
    return this.knowledgeService.updateArticle(parseInt(id), dto);
  }

  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard)
  deleteArticle(@Param('id') id: string) {
    return this.knowledgeService.deleteArticle(parseInt(id));
  }

  @Put('articles/:id/status')
  @UseGuards(JwtAuthGuard)
  updateArticleStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.adminService.updateArticleStatus(parseInt(id), body.status);
  }

  @Put('articles/:id/publish')
  @UseGuards(JwtAuthGuard)
  publishArticle(@Param('id') id: string) {
    return this.knowledgeService.publishArticle(parseInt(id));
  }

  // ==================== Category Management ====================

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() body: { name: string; description?: string }) {
    return this.knowledgeService.createCategory(body.name, body.description);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.knowledgeService.updateCategory(parseInt(id), body);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id') id: string) {
    return this.knowledgeService.deleteCategory(parseInt(id));
  }

  // ==================== Chat Sessions ====================

  @Get('chat/sessions')
  @UseGuards(JwtAuthGuard)
  getSessions(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('riskFlag') riskFlag?: string
  ) {
    return this.adminService.getSessions(
      parseInt(page),
      parseInt(pageSize),
      riskFlag ? parseInt(riskFlag) : undefined
    );
  }

  // ==================== Diary Management ====================

  @Get('diaries')
  @UseGuards(JwtAuthGuard)
  getDiaries(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.adminService.getDiaries(parseInt(page), parseInt(pageSize));
  }

  // ==================== Analytics ====================

  @Get('analytics/dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return this.adminService.getDashboardData();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  getStatistics() {
    return this.adminService.getDashboardData();
  }

  @Get('analytics/weekly-trend')
  @UseGuards(JwtAuthGuard)
  getWeeklyTrend() {
    return this.adminService.getWeeklyTrend();
  }

  // ==================== Risk Management ====================

  @Get('risk-records')
  @UseGuards(JwtAuthGuard)
  getRiskRecords(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('riskLevel') riskLevel?: string,
    @Query('type') type?: string
  ) {
    return this.adminService.getRiskRecords(
      parseInt(page),
      parseInt(pageSize),
      riskLevel ? parseInt(riskLevel) : undefined,
      type
    );
  }

  @Put('risk-records/:type/:id/resolve')
  @UseGuards(JwtAuthGuard)
  resolveRiskRecord(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: { resolution: string },
    @CurrentUser() admin: JwtPayload
  ) {
    return this.adminService.resolveRiskRecord(type, parseInt(id), body.resolution, admin.userId);
  }

  // ==================== Audit Logs ====================

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  getAuditLogs(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string
  ) {
    return this.adminService.getAuditLogs(
      parseInt(page),
      parseInt(pageSize),
      adminId ? parseInt(adminId) : undefined,
      action,
      targetType
    );
  }
}
