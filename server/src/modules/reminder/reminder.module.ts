import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reminder } from '@/database/entities/Reminder.entity';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [ReminderService],
  controllers: [ReminderController],
  exports: [ReminderService]
})
export class ReminderModule {}
