import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { GeminiService } from './gemini.service';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, GeminiService],
})
export class SubmissionsModule {}
