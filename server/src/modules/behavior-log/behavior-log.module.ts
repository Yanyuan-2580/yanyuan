import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBehaviorLogSchema } from '@/database/schemas';
import { BehaviorLogService } from './behavior-log.service';
import { BehaviorLogController } from './behavior-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserBehaviorLog', schema: UserBehaviorLogSchema },
    ]),
  ],
  providers: [BehaviorLogService],
  controllers: [BehaviorLogController],
  exports: [BehaviorLogService],
})
export class BehaviorLogModule {}
