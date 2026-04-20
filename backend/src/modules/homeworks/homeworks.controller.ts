import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { HomeworksService } from './homeworks.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homeworks')
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Roles('teacher')
  @Post()
  create(@Body() dto: CreateHomeworkDto, @CurrentUser() user: any) {
    return this.homeworksService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.homeworksService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.homeworksService.findOne(id, user);
  }

  @Roles('teacher')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHomeworkDto,
    @CurrentUser() user: any,
  ) {
    return this.homeworksService.update(id, dto, user.id);
  }

  @Roles('teacher')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.homeworksService.remove(id, user.id);
  }

  @Roles('teacher')
  @Post(':id/groups')
  createGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateGroupDto,
    @CurrentUser() user: any,
  ) {
    return this.homeworksService.createGroup(id, dto, user.id);
  }

  @Get(':id/groups')
  findGroups(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.homeworksService.findGroups(id, user);
  }
}
