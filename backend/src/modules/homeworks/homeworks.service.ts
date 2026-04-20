import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class HomeworksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHomeworkDto, actorId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, state: 1 },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacherId !== actorId) throw new ForbiddenException();

    const rubric = await this.prisma.rubric.findFirst({
      where: { id: dto.rubricId, state: 1, ownerId: actorId },
    });
    if (!rubric) throw new NotFoundException('Rubric not found or not owned by you');

    const homework = await this.prisma.homework.create({
      data: {
        courseId: dto.courseId,
        rubricId: dto.rubricId,
        name: dto.name,
        description: dto.description,
        isGroup: dto.isGroup ?? false,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? 'draft',
        createdUser: actorId,
      },
      include: { course: true, rubric: true },
    });

    return { message: 'Homework created', data: homework };
  }

  async findAll(user: { id: string; role: string }) {
    let where: any = { state: 1 };

    if (user.role === 'teacher') {
      const courses = await this.prisma.course.findMany({
        where: { teacherId: user.id, state: 1 },
        select: { id: true },
      });
      where.courseId = { in: courses.map((c) => c.id) };
    } else if (user.role === 'student') {
      const enrollments = await this.prisma.courseStudent.findMany({
        where: { studentId: user.id, state: 1 },
        select: { courseId: true },
      });
      where.courseId = { in: enrollments.map((e) => e.courseId) };
      where.status = 'published';
    }

    const homeworks = await this.prisma.homework.findMany({
      where,
      include: { course: true, rubric: true },
    });

    return { message: 'Homeworks retrieved', data: homeworks };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const homework = await this.prisma.homework.findFirst({
      where: { id, state: 1 },
      include: { course: true, rubric: { include: { criteria: { include: { levelDescriptors: true } } } } },
    });
    if (!homework) throw new NotFoundException('Homework not found');

    if (user.role === 'teacher' && homework.course.teacherId !== user.id)
      throw new ForbiddenException();

    if (user.role === 'student') {
      const enrolled = await this.prisma.courseStudent.findFirst({
        where: { courseId: homework.courseId, studentId: user.id, state: 1 },
      });
      if (!enrolled) throw new ForbiddenException();
    }

    return { message: 'Homework retrieved', data: homework };
  }

  async update(id: string, dto: UpdateHomeworkDto, actorId: string) {
    const homework = await this.prisma.homework.findFirst({
      where: { id, state: 1 },
      include: { course: true },
    });
    if (!homework) throw new NotFoundException('Homework not found');
    if (homework.course.teacherId !== actorId) throw new ForbiddenException();

    const updated = await this.prisma.homework.update({
      where: { id },
      data: { ...dto, updatedUser: actorId },
      include: { course: true, rubric: true },
    });

    return { message: 'Homework updated', data: updated };
  }

  async remove(id: string, actorId: string) {
    const homework = await this.prisma.homework.findFirst({
      where: { id, state: 1 },
      include: { course: true },
    });
    if (!homework) throw new NotFoundException('Homework not found');
    if (homework.course.teacherId !== actorId) throw new ForbiddenException();

    await this.prisma.homework.update({
      where: { id },
      data: { state: 0, updatedUser: actorId },
    });

    return { message: 'Homework deleted', data: null };
  }

  async createGroup(homeworkId: string, dto: CreateGroupDto, actorId: string) {
    const homework = await this.prisma.homework.findFirst({
      where: { id: homeworkId, state: 1 },
      include: { course: true },
    });
    if (!homework) throw new NotFoundException('Homework not found');
    if (homework.course.teacherId !== actorId) throw new ForbiddenException();
    if (!homework.isGroup) throw new BadRequestException('This homework is not group-based');

    // Validate all students are enrolled in the course
    const enrollments = await this.prisma.courseStudent.findMany({
      where: { courseId: homework.courseId, studentId: { in: dto.studentIds }, state: 1 },
    });

    if (enrollments.length !== dto.studentIds.length)
      throw new BadRequestException('All students must be enrolled in the course');

    const group = await this.prisma.homeworkGroup.create({
      data: {
        homeworkId,
        name: dto.name,
        members: {
          create: dto.studentIds.map((studentId) => ({ studentId })),
        },
      },
      include: { members: { include: { student: true } } },
    });

    return { message: 'Group created', data: group };
  }

  async findGroups(homeworkId: string, user: { id: string; role: string }) {
    const homework = await this.prisma.homework.findFirst({
      where: { id: homeworkId, state: 1 },
      include: { course: true },
    });
    if (!homework) throw new NotFoundException('Homework not found');

    if (user.role === 'teacher' && homework.course.teacherId !== user.id)
      throw new ForbiddenException();

    const groups = await this.prisma.homeworkGroup.findMany({
      where: { homeworkId, state: 1 },
      include: { members: { include: { student: true } } },
    });

    return { message: 'Groups retrieved', data: groups };
  }
}
