import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'videos';

@Injectable()
export class UploadService {
  private supabase;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_KEY')!,
    );
  }

  async uploadVideo(file: any): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `submissions/${filename}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error)
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);

    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}
