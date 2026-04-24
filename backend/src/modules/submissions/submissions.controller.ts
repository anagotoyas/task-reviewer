import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Roles('student')
  @Post()
  create(@Body() dto: CreateSubmissionDto, @CurrentUser() user: any) {
    return this.submissionsService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('homeworkId') homeworkId?: string) {
    return this.submissionsService.findAll(user, homeworkId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.submissionsService.findOne(id, user);
  }

  @Roles('teacher')
  @Post(':id/start-review')
  startReview(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.submissionsService.startReview(id, user.id);
  }

  @Roles('teacher')
  @Patch(':id/review')
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.review(id, dto, user.id);
  }

  @Roles('teacher')
  @Post(':id/retry-ai')
  retryAi(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.submissionsService.retryAiEvaluation(id, user.id);
  }
}
