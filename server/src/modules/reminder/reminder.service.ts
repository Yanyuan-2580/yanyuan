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

  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();

    return this.reminderRepository.find({
      where: { enabled: true, time: currentTime }
    }).then(reminders =>
      reminders.filter(r => {
        const days = r.daysOfWeek || [];
        return days.includes(currentDay);
      })
    );
  }
}
