import { Injectable, ConflictException, UnauthorizedException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { User } from '@/database/entities';
import { JwtPayload } from '@/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CacheService, NotificationService } from '@/shared';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private cacheService: CacheService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existingUser) {
      throw new ConflictException('用户名已注册');
    }

    // 如果提供了手机号，检查唯一性
    if (dto.phone) {
      const phoneExists = await this.userRepository.findOne({ where: { phone: dto.phone } });
      if (phoneExists) {
        throw new ConflictException('手机号已注册');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      phone: dto.phone || null,
      passwordHash,
      nickname: dto.nickname || dto.username
    });

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
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
      select: ['id', 'username', 'phone', 'email', 'nickname', 'avatarUrl', 'riskLevel', 'createdAt']
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

    if (dto.phone) {
      const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('手机号已被使用');
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

  async wechatLogin(code: string, userInfo?: { nickname?: string; avatarUrl?: string }) {
    const appId = this.configService.get('WECHAT_APP_ID');
    const appSecret = this.configService.get('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      throw new UnauthorizedException('微信登录未配置');
    }

    try {
      // 调用微信 code2session 接口
      const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: { appid: appId, secret: appSecret, js_code: code, grant_type: 'authorization_code' },
      });

      if (data.errcode) {
        throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`);
      }

      const { openid, unionid } = data;

      // 查找或创建用户（通过 username 查找，兼容旧 wechat_ 前缀回填的数据）
      const wxUsername = `wechat_${openid}`;
      let user = await this.userRepository.findOne({ where: { username: wxUsername } });
      if (!user) {
        user = this.userRepository.create({
          username: wxUsername,
          phone: wxUsername,
          passwordHash: await bcrypt.hash(openid, 10),
          nickname: userInfo?.nickname || `微信用户${Date.now().toString().slice(-6)}`,
          avatarUrl: userInfo?.avatarUrl || '',
        });
        await this.userRepository.save(user);
      } else if (userInfo?.nickname) {
        await this.userRepository.update(user.id, {
          nickname: userInfo.nickname,
          avatarUrl: userInfo.avatarUrl || user.avatarUrl,
        });
      }

      return this.generateToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('微信登录失败，请重试');
    }
  }

  /**
   * 发送短信验证码（通用）
   */
  async sendCode(phone: string): Promise<{ success: boolean }> {
    // 生成6位随机验证码
    const code = String(Math.floor(100000 + Math.random() * 900000));
    // 存入 Redis，5分钟有效
    await this.cacheService.set(`sms_code:${phone}`, code, 300);
    // 发送短信
    await this.notificationService.sendVerificationCode(phone, code);
    return { success: true };
  }

  /**
   * 忘记密码 - 发送重置验证码
   */
  async forgotPassword(phone: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException('该手机号未注册');
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.cacheService.set(`reset_code:${phone}`, code, 300);
    await this.notificationService.sendPasswordResetCode(phone, code);
    return { success: true };
  }

  /**
   * 重置密码
   */
  async resetPassword(phone: string, code: string, newPassword: string): Promise<{ success: boolean }> {
    const storedCode = await this.cacheService.get(`reset_code:${phone}`);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('验证码错误或已过期');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update({ phone }, { passwordHash });
    // 删除验证码
    await this.cacheService.del(`reset_code:${phone}`);
    return { success: true };
  }

  /**
   * 验证码登录
   */
  async codeLogin(phone: string, code: string) {
    const storedCode = await this.cacheService.get(`sms_code:${phone}`);
    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedException('验证码错误或已过期');
    }
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('手机号未注册');
    }
    if (user.status === 0) {
      throw new ForbiddenException('账号已被封禁');
    }
    // 删除验证码
    await this.cacheService.del(`sms_code:${phone}`);
    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const payload: JwtPayload = { userId: user.id, username: user.username, phone: user.phone || undefined };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.cacheService.setUserToken(user.id, accessToken);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        riskLevel: user.riskLevel
      }
    };
  }
}
