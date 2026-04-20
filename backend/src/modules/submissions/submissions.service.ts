import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubmissionDto, studentId: string) {
    const homework = await this.prisma.homework.findFirst({
      where: { id: dto.homeworkId, state: 1, status: 'published' },
      include: { course: true },
    });
    if (!homework) throw new NotFoundException('Homework not found or not published');

    // Check student is enrolled
    const enrolled = await this.prisma.courseStudent.findFirst({
      where: { courseId: homework.courseId, studentId, state: 1 },
    });
    if (!enrolled) throw new ForbiddenException('Not enrolled in this course');

    // XOR: must have exactly one of studentId (individual) or groupId (group)
    if (homework.isGroup && !dto.groupId)
      throw new BadRequestException('Group homework requires a groupId');
    if (!homework.isGroup && dto.groupId)
      throw new BadRequestException('Individual homework does not accept a groupId');

    let resolvedStudentId: string | null = null;
    let resolvedGroupId: string | null = null;

    if (homework.isGroup) {
      const group = await this.prisma.homeworkGroup.findFirst({
        where: { id: dto.groupId, homeworkId: dto.homeworkId, state: 1 },
        include: { members: true },
      });
      if (!group) throw new NotFoundException('Group not found');
      const isMember = group.members.some((m) => m.studentId === studentId);
      if (!isMember) throw new ForbiddenException('You are not a member of this group');
      resolvedGroupId = group.id;
    } else {
      resolvedStudentId = studentId;
    }

    const submission = await this.prisma.submission.create({
      data: {
        homeworkId: dto.homeworkId,
        studentId: resolvedStudentId,
        groupId: resolvedGroupId,
        videoUrl: dto.videoUrl,
      },
      include: { homework: true, student: true, group: true },
    });

    return { message: 'Submission created', data: submission };
  }

  async findAll(user: { id: string; role: string }) {
    let where: any = { state: 1 };

    if (user.role === 'student') {
      where.studentId = user.id;
    } else if (user.role === 'teacher') {
      const courses = await this.prisma.course.findMany({
        where: { teacherId: user.id, state: 1 },
        select: { id: true },
      });
      const homeworks = await this.prisma.homework.findMany({
        where: { courseId: { in: courses.map((c) => c.id) }, state: 1 },
        select: { id: true },
      });
      where.homeworkId = { in: homeworks.map((h) => h.id) };
    }

    const submissions = await this.prisma.submission.findMany({
      where,
      include: {
        homework: true,
        student: true,
        group: true,
        evaluations: { include: { criterion: true } },
      },
    });

    return { message: 'Submissions retrieved', data: submissions };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const submission = await this.prisma.submission.findFirst({
      where: { id, state: 1 },
      include: {
        homework: { include: { course: true } },
        student: true,
        group: { include: { members: true } },
        evaluations: { include: { criterion: true } },
      },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    if (user.role === 'student') {
      const isOwner = submission.studentId === user.id ||
        submission.group?.members.some((m) => m.studentId === user.id);
      if (!isOwner) throw new ForbiddenException();
      // Only show evaluations if teacher_reviewed
      if (!submission.teacherReviewed) {
        submission.evaluations = [];
      }
    }

    if (user.role === 'teacher') {
      if (submission.homework.course.teacherId !== user.id)
        throw new ForbiddenException();
    }

    return { message: 'Submission retrieved', data: submission };
  }

  async review(id: string, dto: ReviewSubmissionDto, teacherId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id, state: 1 },
      include: {
        homework: { include: { course: true, rubric: { include: { criteria: true } } } },
      },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.homework.course.teacherId !== teacherId)
      throw new ForbiddenException();

    const criterionIds = submission.homework.rubric.criteria.map((c) => c.id);
    const providedIds = dto.evaluations.map((e) => e.criterionId);

    // All criteria must be evaluated
    const missing = criterionIds.filter((id) => !providedIds.includes(id));
    if (missing.length > 0)
      throw new BadRequestException(`Missing evaluations for criteria: ${missing.join(', ')}`);

    const extra = providedIds.filter((id) => !criterionIds.includes(id));
    if (extra.length > 0)
      throw new BadRequestException(`Invalid criteria IDs: ${extra.join(', ')}`);

    const now = new Date();
    const reviewStarted = submission.reviewStartedAt ?? now;
    const durationSeconds = Math.floor((now.getTime() - reviewStarted.getTime()) / 1000);

    // Upsert each evaluation
    await Promise.all(
      dto.evaluations.map((ev) =>
        this.prisma.submissionCriterionEvaluation.upsert({
          where: {
            submissionId_criterionId: {
              submissionId: id,
              criterionId: ev.criterionId,
            },
          },
          update: {
            finalLevel: ev.finalLevel,
            finalReasoning: ev.finalReasoning,
            editedByTeacher: true,
          },
          create: {
            submissionId: id,
            criterionId: ev.criterionId,
            finalLevel: ev.finalLevel,
            finalReasoning: ev.finalReasoning,
            editedByTeacher: true,
          },
        }),
      ),
    );

    // Update submission review timestamps
    const updated = await this.prisma.submission.update({
      where: { id },
      data: {
        teacherReviewed: true,
        reviewStartedAt: reviewStarted,
        reviewSubmittedAt: now,
        reviewDurationSeconds: durationSeconds,
      },
      include: {
        evaluations: { include: { criterion: true } },
      },
    });

    return { message: 'Review submitted', data: updated };
  }

  async startReview(id: string, teacherId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id, state: 1 },
      include: { homework: { include: { course: true } } },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.homework.course.teacherId !== teacherId)
      throw new ForbiddenException();

    const updated = await this.prisma.submission.update({
      where: { id },
      data: { reviewStartedAt: new Date() },
    });

    return { message: 'Review started', data: updated };
  }
}
