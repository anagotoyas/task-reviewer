import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('courses')
  getCourses() {
    return this.analyticsService.getCourses();
  }

  @Get('homeworks')
  getHomeworks(@Query('courseId') courseId: string) {
    return this.analyticsService.getHomeworksByCourse(courseId);
  }

  @Get('stats')
  getStats(
    @Query('courseId') courseId?: string,
    @Query('homeworkId') homeworkId?: string,
  ) {
    return this.analyticsService.getStats(courseId, homeworkId);
  }
}
