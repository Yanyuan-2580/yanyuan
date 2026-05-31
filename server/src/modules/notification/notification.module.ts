import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Notification } from '@/database/entities';
import { UserNotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [UserNotificationService],
  controllers: [NotificationController],
  exports: [UserNotificationService]
})
export class NotificationModule {}
