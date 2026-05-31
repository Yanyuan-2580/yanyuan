import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from '@/database/entities/Reminder.entity';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder])],
  providers: [ReminderService],
  controllers: [ReminderController],
  exports: [ReminderService]
})
export class ReminderModule {}
