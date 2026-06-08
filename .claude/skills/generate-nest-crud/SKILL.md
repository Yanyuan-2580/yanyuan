---
name: generate-nest-crud
description: 按项目规范生成 NestJS CRUD 模块 — Entity + DTO + Service + Controller + Module + app.module 注册
---

# 生成 NestJS CRUD 模块

> **AI 执行规则**: 严格按照下方模板生成代码，不做自由发挥。生成后提示用户在 `app.module.ts` 中注册模块。

## 输入

用户需提供:
- **模块名** (英文小写): 如 `reminder`
- **表名** (snake_case): 如 `reminder`
- **字段列表**: `字段名:类型:约束`
- **API 前缀**: 如 `reminders`

## 生成文件清单

```
server/src/database/entities/[module-name].entity.ts       # 实体
server/src/modules/[module-name]/[module-name].module.ts    # 模块
server/src/modules/[module-name]/[module-name].controller.ts # 控制器
server/src/modules/[module-name]/[module-name].service.ts   # 服务
server/src/modules/[module-name]/dto/create-[module-name].dto.ts  # 创建DTO
server/src/modules/[module-name]/dto/update-[module-name].dto.ts  # 更新DTO
```

## 代码模板

### 1. Entity

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity('{table_name}')
export class {EntityName} {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户定义的字段...

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**字段类型映射:**
| 业务类型 | TypeORM 装饰器 |
|---------|---------------|
| 短文本(≤255) | `@Column({ type: 'varchar', length: N })` |
| 长文本 | `@Column({ type: 'text', nullable: true })` |
| 整数 | `@Column({ type: 'int', default: 0 })` |
| 小数 | `@Column({ type: 'decimal', precision: 10, scale: 2 })` |
| 布尔 | `@Column({ type: 'tinyint', default: 0 })` |
| 日期 | `@Column({ type: 'datetime', nullable: true })` |
| 枚举(RiskLevel) | `@Column({ type: 'tinyint', default: 0 })` |
| JSON | `@Column({ type: 'json', nullable: true })` |

### 2. Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {EntityName} } from '../../database/entities/{module-name}.entity';
import { {ServiceName}Service } from './{module-name}.service';
import { {ControllerName}Controller } from './{module-name}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([{EntityName}])],
  controllers: [{ControllerName}Controller],
  providers: [{ServiceName}Service],
  exports: [{ServiceName}Service],
})
export class {ModuleName}Module {}
```

### 3. Controller

```typescript
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards
} from '@nestjs/common';
import { {ServiceName}Service } from './{module-name}.service';
import { Create{EntityName}Dto } from './dto/create-{module-name}.dto';
import { Update{EntityName}Dto } from './dto/update-{module-name}.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/v1/{route-prefix}')
@UseGuards(JwtAuthGuard)
export class {ControllerName}Controller {
  constructor(private readonly service: {ServiceName}Service) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.service.findAll(+page, +pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  async create(@Body() dto: Create{EntityName}Dto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: Update{EntityName}Dto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
```

### 4. Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {EntityName} } from '../../database/entities/{module-name}.entity';

@Injectable()
export class {ServiceName}Service {
  constructor(
    @InjectRepository({EntityName})
    private readonly repository: Repository<{EntityName}>,
  ) {}

  async findAll(page: number, pageSize: number) {
    const [list, total] = await this.repository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as const },
    });
    return {
      code: 200, message: 'success',
      data: { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: number) {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException('记录不存在');
    return { code: 200, message: 'success', data: entity };
  }

  async create(dto: any) {
    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);
    return { code: 200, message: '创建成功', data: saved };
  }

  async update(id: number, dto: any) {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException('记录不存在');
    await this.repository.update(id, dto as any);
    const updated = await this.repository.findOne({ where: { id } as any });
    return { code: 200, message: '更新成功', data: updated };
  }

  async remove(id: number) {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException('记录不存在');
    await this.repository.delete(id);
    return { code: 200, message: '删除成功', data: null };
  }
}
```

### 5. Create DTO

```typescript
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, Min, Max } from 'class-validator';

export class Create{EntityName}Dto {
  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  @MaxLength(100, { message: '名称最长100字符' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

**常用验证装饰器:**
| 场景 | 装饰器 |
|------|--------|
| 必填字符串 | `@IsString()` + `@IsNotEmpty()` |
| 可选字符串 | `@IsString()` + `@IsOptional()` |
| 最大长度 | `@MaxLength(N)` |
| 必填数字 | `@IsNumber()` + `@IsNotEmpty()` |
| 范围 | `@Min(N)` + `@Max(N)` |
| 邮箱 | `@IsEmail()` |
| 手机号 | `@Matches(/^1[3-9]\d{9}$/)` |

### 6. Update DTO

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Create{EntityName}Dto } from './create-{module-name}.dto';

export class Update{EntityName}Dto extends PartialType(Create{EntityName}Dto) {}
```

## 6. 注册模块

生成完成后，必须在 `server/src/app.module.ts` 中:

1. 在文件顶部添加 import:
```typescript
import { {ModuleName}Module } from './modules/{module-name}/{module-name}.module';
```

2. 在 `@Module({ imports: [...] })` 数组中添加:
```typescript
{ModuleName}Module,
```

## 命名规范检查表

| 元素 | 规范 | 示例 (reminder) |
|------|------|-----------------|
| 文件夹 | 小写短横线 | `reminder` |
| 文件名 | 小写短横线 | `reminder.service.ts` |
| 实体类 | PascalCase | `Reminder` |
| 表名 | snake_case | `reminder` |
| 服务类 | PascalCase + Service | `ReminderService` |
| 控制器 | PascalCase + Controller | `ReminderController` |
| 模块类 | PascalCase + Module | `ReminderModule` |
| DTO | PascalCase + Dto | `CreateReminderDto` |
| API 路由 | 小写短横线 | `reminders` |
