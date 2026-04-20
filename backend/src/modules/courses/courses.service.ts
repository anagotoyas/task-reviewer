import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCourseDto, actorId: string) {
    const teacher = await this.prisma.user.findFirst({
      where: { id: dto.teacherId, state: 1 },
      include: { role: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.role.name !== 'teacher')
      throw new BadRequestException('User is not a teacher');

    const course = await this.prisma.course.create({
      data: { name: dto.name, teacherId: dto.teacherId, createdUser: actorId },
      include: { teacher: { include: { role: true } } },
    });

    return { message: 'Course created', data: course };
  }

  async findAll(user: { id: string; role: string }) {
    let where: any = { state: 1 };

    if (user.role === 'teacher') where.teacherId = user.id;
    else if (user.role === 'student') {
      const enrollments = await this.prisma.courseStudent.findMany({
        where: { studentId: user.id, state: 1 },
        select: { courseId: true },
      });
      where.id = { in: enrollments.map((e) => e.courseId) };
    }

    const courses = await this.prisma.course.findMany({
      where,
      include: { teacher: true },
    });

    return { message: 'Courses retrieved', data: courses };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const course = await this.prisma.course.findFirst({
      where: { id, state: 1 },
      include: { teacher: true, students: { where: { state: 1 }, include: { student: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (user.role === 'teacher' && course.teacherId !== user.id)
      throw new ForbiddenException();

    if (user.role === 'student') {
      const enrolled = course.students.some((s) => s.studentId === user.id);
      if (!enrolled) throw new ForbiddenException();
    }

    return { message: 'Course retrieved', data: course };
  }

  async update(id: string, dto: UpdateCourseDto, actorId: string) {
    const course = await this.prisma.course.findFirst({ where: { id, state: 1 } });
    if (!course) throw new NotFoundException('Course not found');

    const updated = await this.prisma.course.update({
      where: { id },
      data: { ...dto, updatedUser: actorId },
      include: { teacher: true },
    });

    return { message: 'Course updated', data: updated };
  }

  async remove(id: string, actorId: string) {
    const course = await this.prisma.course.findFirst({ where: { id, state: 1 } });
    if (!course) throw new NotFoundException('Course not found');

    await this.prisma.course.update({
      where: { id },
      data: { state: 0, updatedUser: actorId },
    });

    return { message: 'Course deleted', data: null };
  }

  async assignStudents(courseId: string, dto: AssignStudentsDto) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, state: 1 } });
    if (!course) throw new NotFoundException('Course not found');

    // Validate all are students
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.studentIds }, state: 1 },
      include: { role: true },
    });

    const nonStudents = users.filter((u) => u.role.name !== 'student');
    if (nonStudents.length > 0)
      throw new BadRequestException('All users must have student role');

    if (users.length !== dto.studentIds.length)
      throw new NotFoundException('One or more students not found');

    // Upsert enrollments
    const results = await Promise.all(
      dto.studentIds.map((studentId) =>
        this.prisma.courseStudent.upsert({
          where: { courseId_studentId: { courseId, studentId } },
          update: { state: 1 },
          create: { courseId, studentId },
        }),
      ),
    );

    return { message: 'Students assigned', data: results };
  }
}
