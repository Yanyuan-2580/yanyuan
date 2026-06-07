import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Reminder } from '@/database/entities/Reminder.entity';
import { User } from '@/database/entities/User.entity';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { ReminderScheduler } from './reminder.scheduler';
import { NotificationModule as UserNotificationModule } from '@/modules/notification/notification.module';
import { NotificationModule } from '@/shared/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, User]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UserNotificationModule,
    NotificationModule,
  ],
  providers: [ReminderService, ReminderScheduler],
  controllers: [ReminderController],
  exports: [ReminderService],
})
export class ReminderModule {}
