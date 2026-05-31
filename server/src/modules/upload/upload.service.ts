import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File, subDir: string = 'images'): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('请选择文件');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG/PNG/GIF/WebP 格式');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 5MB');
    }

    const dir = path.join(this.uploadDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return { url: `/uploads/${subDir}/${filename}` };
  }
}
