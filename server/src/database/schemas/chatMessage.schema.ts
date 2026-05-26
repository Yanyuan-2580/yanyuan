import * as mongoose from 'mongoose';

export const ChatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: Number, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  moodTag: { type: String, default: null },
  riskLevel: { type: Number, default: 0 },
  tokensUsed: { type: Number, default: 0 },
  modelName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
});

export interface ChatMessageDocument extends mongoose.Document {
  sessionId: string;
  userId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  moodTag?: string;
  riskLevel: number;
  tokensUsed?: number;
  modelName?: string;
  createdAt: Date;
}
