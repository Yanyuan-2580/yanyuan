import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Admin, AdminOperationLog, AiSession, MoodDiary, KnowledgeArticle } from '@/database/entities';
import { JwtPayload, UserStatus, RiskLevel } from '@/types';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/register.dto';
import { CreateArticleDto } from '@/modules/knowledge/dto/create-article.dto';

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

    const payload: JwtPayload = { userId: admin.id, username: admin.username, role: 'admin' };
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

  // ==================== User Management ====================

  async getUsers(page: number, pageSize: number, status?: number, riskLevel?: number, keyword?: string): Promise<{ list: User[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    if (status !== undefined) {
      query.andWhere('user.status = :status', { status });
    }
    if (riskLevel !== undefined) {
      query.andWhere('user.riskLevel = :riskLevel', { riskLevel });
    }
    if (keyword) {
      query.andWhere('(user.nickname LIKE :keyword OR user.username LIKE :keyword OR user.phone LIKE :keyword)', { keyword: `%${keyword}%` });
    }

    const [list, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async createUser(data: { username: string; password: string; phone?: string; nickname?: string }): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { username: data.username } });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }
    if (data.phone) {
      const phoneExists = await this.userRepository.findOne({ where: { phone: data.phone } });
      if (phoneExists) {
        throw new ConflictException('手机号已被注册');
      }
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      username: data.username,
      phone: data.phone || null,
      passwordHash,
      nickname: data.nickname || data.username,
      status: 1 as UserStatus,
      riskLevel: 0 as RiskLevel
    });
    return this.userRepository.save(user);
  }

  async updateUserStatus(id: number, status: number, adminId?: number): Promise<User> {
    const user = await this.getUser(id);
    await this.userRepository.update(id, { status: status as UserStatus });
    if (adminId) {
      await this.logOperation(adminId, 'updateUserStatus', 'user', id, { from: user.status, to: status });
    }
    return this.getUser(id);
  }

  async updateUserRiskLevel(id: number, riskLevel: number): Promise<User> {
    const user = await this.getUser(id);
    await this.userRepository.update(id, { riskLevel: riskLevel as RiskLevel });
    return this.getUser(id);
  }

  async deleteUser(id: number): Promise<{ success: boolean }> {
    const user = await this.getUser(id);
    await this.userRepository.softDelete(id);
    return { success: true };
  }

  // ==================== Article Management ====================

  async getArticles(page: number, pageSize: number, status?: number, categoryId?: number, keyword?: string): Promise<{ list: KnowledgeArticle[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const query = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category');

    if (status !== undefined) {
      query.andWhere('article.status = :status', { status });
    }
    if (categoryId) {
      query.andWhere('article.categoryId = :categoryId', { categoryId });
    }
    if (keyword) {
      query.andWhere('(article.title LIKE :keyword OR article.content LIKE :keyword)', { keyword: `%${keyword}%` });
    }

    const [list, total] = await query
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getArticleDetail(id: number): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category']
    });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  async adminCreateArticle(dto: CreateArticleDto, adminId: number): Promise<KnowledgeArticle> {
    const article = this.articleRepository.create({ ...dto, authorId: adminId });
    const saved = await this.articleRepository.save(article);
    await this.logOperation(adminId, 'createArticle', 'article', saved.id, { title: dto.title });
    return saved;
  }

  async updateArticleStatus(id: number, status: number): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    const updateData: any = { status };
    if (status === 2) {
      updateData.publishedAt = new Date();
    }
    await this.articleRepository.update(id, updateData);
    return this.articleRepository.findOne({ where: { id } });
  }

  // ==================== Chat & Diary ====================

  async getSessions(page: number, pageSize: number, riskFlag?: number): Promise<{ list: AiSession[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const query = this.aiSessionRepository.createQueryBuilder('session');

    if (riskFlag !== undefined) {
      query.andWhere('session.riskFlag = :riskFlag', { riskFlag });
    }

    const [list, total] = await query
      .orderBy('session.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getDiaries(page: number, pageSize: number): Promise<{ list: MoodDiary[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const [list, total] = await this.moodDiaryRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ==================== Analytics ====================

  async getDashboardData(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { updatedAt: MoreThanOrEqual(weekAgo) } });

    const totalSessions = await this.aiSessionRepository.count();
    const todaySessions = await this.aiSessionRepository.count({ where: { createdAt: MoreThanOrEqual(today) } });

    const totalDiaries = await this.moodDiaryRepository.count();
    const todayDiaries = await this.moodDiaryRepository.count({ where: { createdAt: MoreThanOrEqual(today) } });

    const totalArticles = await this.articleRepository.count({ where: { status: 2 } });

    const highRiskUsers = await this.userRepository.count({ where: { riskLevel: 2 } });
    const highRiskSessions = await this.aiSessionRepository.count({ where: { riskFlag: 2 } });

    return {
      totalUsers,
      activeUsers,
      totalSessions,
      todaySessions,
      totalDiaries,
      todayDiaries,
      totalArticles,
      highRiskUsers,
      highRiskSessions,
      riskCount: highRiskUsers + highRiskSessions
    };
  }

  async getWeeklyTrend(): Promise<any> {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      days.push({ date, label: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()], nextDate });
    }

    const trends = await Promise.all(days.map(async d => {
      const newUsers = await this.userRepository.count({
        where: { createdAt: MoreThanOrEqual(d.date) }
      });
      const sessions = await this.aiSessionRepository.count({
        where: { createdAt: MoreThanOrEqual(d.date) }
      });
      const diaries = await this.moodDiaryRepository.count({
        where: { createdAt: MoreThanOrEqual(d.date) }
      });
      return { day: d.label, date: d.date.toISOString().split('T')[0], newUsers, sessions, diaries };
    }));

    return { trends };
  }

  // ==================== Risk Management ====================

  async getRiskRecords(page: number, pageSize: number, riskLevel?: number, type?: string): Promise<{ list: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const conditions: any = {};
    if (riskLevel !== undefined) {
      conditions.riskLevel = riskLevel;
    }

    let userList: any[] = [];
    let sessionList: any[] = [];
    let userCount = 0;
    let sessionCount = 0;

    if (!type || type === 'user') {
      [userList, userCount] = await this.userRepository.findAndCount({
        where: { ...conditions, riskLevel: riskLevel !== undefined ? riskLevel : 2 as any },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize
      });
    }

    if (!type || type === 'session') {
      [sessionList, sessionCount] = await this.aiSessionRepository.findAndCount({
        where: { ...conditions, riskFlag: riskLevel !== undefined ? riskLevel as any : undefined },
        order: { updatedAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize
      });
    }

    const list: any[] = [
      ...userList.map(u => ({
        type: 'user',
        id: u.id,
        name: u.nickname || u.username,
        phone: u.phone,
        riskLevel: u.riskLevel,
        content: u.nickname || u.username,
        createdAt: u.createdAt
      })),
      ...sessionList.map(s => ({
        type: 'session',
        id: s.id,
        userId: s.userId,
        riskFlag: s.riskFlag,
        riskLevel: s.riskFlag,
        content: `会话 #${s.id} 触发风险预警`,
        createdAt: s.updatedAt
      }))
    ];

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      list: list.slice(0, pageSize),
      total: userCount + sessionCount,
      page,
      pageSize,
      totalPages: Math.ceil((userCount + sessionCount) / pageSize)
    };
  }

  async resolveRiskRecord(type: string, id: number, resolution: string, adminId: number): Promise<any> {
    if (type === 'user') {
      await this.userRepository.update(id, { riskLevel: 0 as RiskLevel });
    } else if (type === 'session') {
      await this.aiSessionRepository.update(id, { riskFlag: 0 });
    }
    await this.logOperation(adminId, 'resolveRisk', type, id, { resolution });
    return { success: true };
  }

  // ==================== Audit Logs ====================

  async getAuditLogs(page: number, pageSize: number, adminId?: number, action?: string, targetType?: string): Promise<{ list: AdminOperationLog[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const query = this.operationLogRepository.createQueryBuilder('log');

    if (adminId) {
      query.andWhere('log.adminId = :adminId', { adminId });
    }
    if (action) {
      query.andWhere('log.action = :action', { action });
    }
    if (targetType) {
      query.andWhere('log.targetType = :targetType', { targetType });
    }

    const [list, total] = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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
