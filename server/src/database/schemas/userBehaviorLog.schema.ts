import * as mongoose from 'mongoose';

export const UserBehaviorLogSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  eventType: { type: String, required: true },
  page: { type: String, required: true },
  duration: { type: Number, default: 0 },
  extra: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
});

export interface UserBehaviorLogDocument extends mongoose.Document {
  userId: number;
  eventType: string;
  page: string;
  duration?: number;
  extra?: Record<string, any>;
  createdAt: Date;
}
