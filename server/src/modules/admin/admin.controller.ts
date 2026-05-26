import { Controller, Post, Get, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { AdminLoginDto } from './dto/login.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  getUsers(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string
  ) {
    return this.adminService.getUsers(
      parseInt(page),
      parseInt(pageSize),
      status ? parseInt(status) : undefined,
      riskLevel ? parseInt(riskLevel) : undefined
    );
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(parseInt(id));
  }

  @Put('users/:id/status')
  @UseGuards(JwtAuthGuard)
  updateUserStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.adminService.updateUserStatus(parseInt(id), body.status);
  }

  @Put('users/:id/risk-level')
  @UseGuards(JwtAuthGuard)
  updateUserRiskLevel(@Param('id') id: string, @Body() body: { riskLevel: number }) {
    return this.adminService.updateUserRiskLevel(parseInt(id), body.riskLevel);
  }

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

  @Get('diaries')
  @UseGuards(JwtAuthGuard)
  getDiaries(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.adminService.getDiaries(parseInt(page), parseInt(pageSize));
  }

  @Get('analytics/dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return this.adminService.getDashboardData();
  }
}
