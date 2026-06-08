import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from '@/database/entities/Reminder.entity';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>
  ) {}

  async getReminders(userId: number): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { userId },
      order: { time: 'ASC' }
    });
  }

  async createReminder(userId: number, data: {
    type: string; title: string; description?: string;
    time: string; daysOfWeek?: number[];
  }): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      userId,
      type: data.type,
      title: data.title,
      description: data.description,
      time: data.time,
      daysOfWeek: data.daysOfWeek || [1, 2, 3, 4, 5],
      enabled: true
    });
    return this.reminderRepository.save(reminder);
  }

  async updateReminder(userId: number, id: number, data: Partial<Reminder>): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({ where: { id, userId } });
    if (!reminder) throw new NotFoundException('提醒不存在');
    await this.reminderRepository.update(id, data);
    return this.reminderRepository.findOne({ where: { id } });
  }

  async deleteReminder(userId: number, id: number): Promise<{ success: boolean }> {
    const reminder = await this.reminderRepository.findOne({ where: { id, userId } });
    if (!reminder) throw new NotFoundException('提醒不存在');
    await this.reminderRepository.delete(id);
    return { success: true };
  }

  async updateLastTriggered(id: number): Promise<void> {
    await this.reminderRepository.update(id, { lastTriggeredAt: new Date() });
  }

  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    const currentDay = now.getDay();

    // Build a 3-minute tolerance window: HH:MM ± 1 minute
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeWindows = [
      `${pad(now.getHours())}:${pad(Math.max(0, now.getMinutes() - 1))}`,
      `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      `${pad(now.getHours())}:${pad(Math.min(59, now.getMinutes() + 1))}`,
    ];

    // Build unique time strings (handle hour boundary edge case)
    const uniqueTimes = [...new Set(timeWindows)];

    const reminders = await this.reminderRepository.find({
      where: { enabled: true }
    });

    return reminders.filter(r => {
      const days = r.daysOfWeek || [];
      return days.includes(currentDay) && uniqueTimes.includes(r.time);
    });
  }
}
