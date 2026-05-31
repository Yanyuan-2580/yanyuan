import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Comment } from '@/database/entities';
import { RiskControlModule } from '@/shared';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    RiskControlModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService]
})
export class CommentModule {}
