import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@/database/entities';
import { UserNotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [UserNotificationService],
  controllers: [NotificationController],
  exports: [UserNotificationService]
})
export class NotificationModule {}
