import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserBehaviorLogSchema } from '@/database/schemas';
import { BehaviorLogService } from './behavior-log.service';
import { BehaviorLogController } from './behavior-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserBehaviorLog', schema: UserBehaviorLogSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BehaviorLogService],
  controllers: [BehaviorLogController],
  exports: [BehaviorLogService],
})
export class BehaviorLogModule {}
