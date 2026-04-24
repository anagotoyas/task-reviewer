import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB (Supabase free tier limit)
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(
            new BadRequestException('Only video files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file provided');
    const url = await this.uploadService.uploadVideo(file);
    return { message: 'Video uploaded', data: { url } };
  }
}
