import { Controller, Post, Get, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { KnowledgeService } from '@/modules/knowledge/knowledge.service';
import { ExportService } from '@/shared/export/export.service';
import { JwtAuthGuard, CurrentUser, RolesGuard, Roles, Public } from '@/common';
import { JwtPayload } from '@/types';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/register.dto';
import { CreateArticleDto } from '@/modules/knowledge/dto/create-article.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private exportService: ExportService,
    private knowledgeService: KnowledgeService
  ) {}

  // ==================== Auth ====================

  @Public()
  @Post('register')
  register(@Body() dto: AdminRegisterDto) {
    return this.adminService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @Post('logout')
  logout(@CurrentUser() payload: JwtPayload) {
    return this.adminService.logout(payload.userId);
  }

  // ==================== User Management ====================

  @Get('users')
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
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(parseInt(id));
  }

  @Post('users')
  createUser(@Body() body: { username: string; password: string; phone?: string; nickname?: string }) {
    return this.adminService.createUser(body);
  }

  @Put('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { nickname?: string; status?: number; riskLevel?: number }
  ) {
    return this.adminService.updateUser(parseInt(id), body);
  }

  @Put('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: number },
    @CurrentUser() admin: JwtPayload
  ) {
    return this.adminService.updateUserStatus(parseInt(id), body.status, admin.userId);
  }

  @Put('users/:id/risk-level')
  updateUserRiskLevel(
    @Param('id') id: string,
    @Body() body: { riskLevel: number },
    @CurrentUser() admin: JwtPayload
  ) {
    return this.adminService.updateUserRiskLevel(parseInt(id), body.riskLevel);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(parseInt(id));
  }

  // ==================== Article Management ====================

  @Get('articles')
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

  // 待审核文章列表 (必须放在 :id 之前)
  @Get('articles/pending')
  getPendingArticles(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.knowledgeService.getPendingArticles(parseInt(page), parseInt(pageSize));
  }

  @Get('articles/:id')
  getArticle(@Param('id') id: string) {
    return this.adminService.getArticleDetail(parseInt(id));
  }

  @Post('articles')
  createArticle(@Body() dto: CreateArticleDto, @CurrentUser() admin: JwtPayload) {
    return this.adminService.adminCreateArticle(dto, admin.userId);
  }

  @Put('articles/:id')
  updateArticle(@Param('id') id: string, @Body() dto: Partial<CreateArticleDto>) {
    return this.knowledgeService.updateArticle(parseInt(id), dto);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.knowledgeService.deleteArticle(parseInt(id));
  }

  @Put('articles/:id/status')
  updateArticleStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.adminService.updateArticleStatus(parseInt(id), body.status);
  }

  // 审核通过
  @Put('articles/:id/approve')
  approveArticle(@Param('id') id: string) {
    return this.knowledgeService.approveArticle(parseInt(id));
  }

  // 驳回文章
  @Put('articles/:id/reject')
  rejectArticle(@Param('id') id: string) {
    return this.knowledgeService.rejectArticle(parseInt(id));
  }

  @Put('articles/:id/publish')
  publishArticle(@Param('id') id: string) {
    return this.knowledgeService.publishArticle(parseInt(id));
  }

  // ==================== Category Management ====================

  @Get('categories')
  getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() body: { name: string; description?: string }) {
    return this.knowledgeService.createCategory(body.name, body.description);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.knowledgeService.updateCategory(parseInt(id), body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.knowledgeService.deleteCategory(parseInt(id));
  }

  // ==================== Chat Sessions ====================

  @Get('chat/sessions')
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
  getDiaries(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.adminService.getDiaries(parseInt(page), parseInt(pageSize));
  }

  // ==================== Analytics ====================

  @Get('analytics/dashboard')
  getDashboard() {
    return this.adminService.getDashboardData();
  }

  @Get('statistics')
  getStatistics() {
    return this.adminService.getDashboardData();
  }

  @Get('analytics/weekly-trend')
  getWeeklyTrend() {
    return this.adminService.getWeeklyTrend();
  }

  @Get('analytics/hourly-heatmap')
  getHourlyHeatmap() {
    return this.adminService.getHourlyHeatmap();
  }

  @Get('analytics/weekly-distribution')
  getWeeklyDistribution() {
    return this.adminService.getWeeklyDistribution();
  }

  @Get('analytics/mood-distribution')
  getMoodDistribution() {
    return this.adminService.getMoodDistribution();
  }

  @Get('analytics/overview')
  getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  // ==================== Risk Management ====================

  @Get('risk-records')
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
  getAuditLogs(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
  ) {
    return this.adminService.getAuditLogs(
      parseInt(page),
      parseInt(pageSize),
      adminId ? parseInt(adminId) : undefined,
      action,
      targetType,
    );
  }

  // ========== 数据导出 ==========

  @Get('export/:type')
  exportData(
    @Param('type') type: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exportService.exportAdminData(type, { startDate, endDate });
  }
}
