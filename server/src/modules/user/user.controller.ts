import { Controller, Post, Get, Put, Delete, Body, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { ExportService } from '@/shared';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private exportService: ExportService
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  refreshToken(@CurrentUser() user: JwtPayload) {
    return this.userService.refreshToken(user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.userId, dto);
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(user.userId, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: JwtPayload) {
    return this.userService.logout(user.userId);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.userService.deleteAccount(user.userId);
  }

  @Get('report')
  @UseGuards(JwtAuthGuard)
  exportReport(@CurrentUser() user: JwtPayload) {
    return this.exportService.exportUserReport(user.userId);
  }
}
