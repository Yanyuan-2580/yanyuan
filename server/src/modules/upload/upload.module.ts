import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 }
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService]
})
export class UploadModule {}
