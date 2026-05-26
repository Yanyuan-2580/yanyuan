import { Injectable, ConflictException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '@/database/entities';
import { JwtPayload } from '@/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CacheService } from '@/shared';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private cacheService: CacheService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existingUser) {
      throw new ConflictException('手机号已注册');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      phone: dto.phone,
      passwordHash,
      nickname: dto.nickname || `用户${Date.now().toString().slice(-6)}`
    });

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (user.status === 0) {
      throw new ForbiddenException('账号已被封禁');
    }

    return this.generateToken(user);
  }

  async refreshToken(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.generateToken(user);
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'phone', 'email', 'nickname', 'avatarUrl', 'riskLevel', 'createdAt']
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    await this.userRepository.update(userId, dto);
    return this.getProfile(userId);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { passwordHash: newPasswordHash });
    return { success: true };
  }

  async logout(userId: number) {
    await this.cacheService.deleteUserToken(userId);
    return { success: true };
  }

  async deleteAccount(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.softDelete(userId);
    await this.cacheService.deleteUserToken(userId);
    return { success: true };
  }

  private async generateToken(user: User) {
    const payload: JwtPayload = { userId: user.id, phone: user.phone };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.cacheService.setUserToken(user.id, accessToken);
    
    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        riskLevel: user.riskLevel
      }
    };
  }
}
