import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Admin, AdminOperationLog, AiSession, MoodDiary, KnowledgeArticle } from '@/database/entities';
import { JwtPayload, UserStatus, RiskLevel } from '@/types';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/register.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AiSession)
    private aiSessionRepository: Repository<AiSession>,
    @InjectRepository(MoodDiary)
    private moodDiaryRepository: Repository<MoodDiary>,
    @InjectRepository(KnowledgeArticle)
    private articleRepository: Repository<KnowledgeArticle>,
    @InjectRepository(AdminOperationLog)
    private operationLogRepository: Repository<AdminOperationLog>,
    private jwtService: JwtService
  ) {}

  async register(dto: AdminRegisterDto) {
    const existing = await this.adminRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const admin = this.adminRepository.create({
      username: dto.username,
      passwordHash,
      nickname: dto.nickname || dto.username,
      roles: ['admin'],
      status: 1
    });

    return this.adminRepository.save(admin);
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.adminRepository.findOne({ where: { username: dto.username } });
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (admin.status === 0) {
      throw new ForbiddenException('账号已被禁用');
    }

    const payload: JwtPayload = { userId: admin.id, phone: admin.username, role: 'admin' };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        roles: admin.roles
      }
    };
  }

  async getUsers(page: number, pageSize: number, status?: number, riskLevel?: number): Promise<{ list: User[]; total: number }> {
    const query = this.userRepository.createQueryBuilder('user');
    
    if (status !== undefined) {
      query.andWhere('user.status = :status', { status });
    }
    if (riskLevel !== undefined) {
      query.andWhere('user.riskLevel = :riskLevel', { riskLevel });
    }

    const [list, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total };
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async updateUserStatus(id: number, status: number): Promise<User> {
    const user = await this.getUser(id);
    await this.userRepository.update(id, { status: status as UserStatus });
    return this.getUser(id);
  }

  async updateUserRiskLevel(id: number, riskLevel: number): Promise<User> {
    const user = await this.getUser(id);
    await this.userRepository.update(id, { riskLevel: riskLevel as RiskLevel });
    return this.getUser(id);
  }

  async getSessions(page: number, pageSize: number, riskFlag?: number): Promise<{ list: AiSession[]; total: number }> {
    const query = this.aiSessionRepository.createQueryBuilder('session');
    
    if (riskFlag !== undefined) {
      query.andWhere('session.riskFlag = :riskFlag', { riskFlag });
    }

    const [list, total] = await query
      .orderBy('session.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total };
  }

  async getDiaries(page: number, pageSize: number): Promise<{ list: MoodDiary[]; total: number }> {
    const [list, total] = await this.moodDiaryRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    return { list, total };
  }

  async getDashboardData(): Promise<any> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = await this.userRepository.count();
    const todayUsers = await this.userRepository.count({ where: { createdAt: MoreThanOrEqual(today) } });
    
    const totalSessions = await this.aiSessionRepository.count();
    const todaySessions = await this.aiSessionRepository.count({ where: { createdAt: MoreThanOrEqual(today) } });
    
    const totalDiaries = await this.moodDiaryRepository.count();
    const todayDiaries = await this.moodDiaryRepository.count({ where: { createdAt: MoreThanOrEqual(today) } });
    
    const totalArticles = await this.articleRepository.count({ where: { status: 2 } });

    const highRiskUsers = await this.userRepository.count({ where: { riskLevel: 2 } });
    const highRiskSessions = await this.aiSessionRepository.count({ where: { riskFlag: 2 } });

    return {
      totalUsers,
      todayUsers,
      totalSessions,
      todaySessions,
      totalDiaries,
      todayDiaries,
      totalArticles,
      highRiskUsers,
      highRiskSessions
    };
  }

  async getRiskRecords(page: number, pageSize: number): Promise<{ list: any[]; total: number }> {
    const [users, userCount] = await this.userRepository.findAndCount({
      where: { riskLevel: 2 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const [sessions, sessionCount] = await this.aiSessionRepository.findAndCount({
      where: { riskFlag: 2 },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const list: any[] = [
      ...users.map(u => ({
        type: 'user',
        id: u.id,
        name: u.nickname || u.phone,
        phone: u.phone,
        createdAt: u.createdAt,
        riskLevel: u.riskLevel
      })),
      ...sessions.map(s => ({
        type: 'session',
        id: s.id,
        userId: s.userId,
        riskFlag: s.riskFlag,
        updatedAt: s.updatedAt
      }))
    ];

    list.sort((a: any, b: any) => {
      const dateA = a.createdAt || a.updatedAt;
      const dateB = b.createdAt || b.updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return {
      list: list.slice(0, pageSize),
      total: userCount + sessionCount
    };
  }

  async logout(adminId: number): Promise<{ success: boolean }> {
    return { success: true };
  }

  async logOperation(adminId: number, action: string, targetType: string, targetId?: number, detail?: Record<string, any>, ip?: string): Promise<void> {
    const log = this.operationLogRepository.create({
      adminId,
      action,
      targetType,
      targetId,
      detail,
      ip: ip || '127.0.0.1'
    });
    await this.operationLogRepository.save(log);
  }
}
