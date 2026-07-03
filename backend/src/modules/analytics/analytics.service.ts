import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getCourses() {
    const data = await this.prisma.course.findMany({
      where: { state: 1 },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return { message: 'Courses retrieved', data };
  }

  async getHomeworksByCourse(courseId: string) {
    const data = await this.prisma.homework.findMany({
      where: { courseId, state: 1 },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    });
    return { message: 'Homeworks retrieved', data };
  }

  async getStats(courseId?: string, homeworkId?: string) {
    const submissionWhere = await this.buildSubmissionFilter(courseId, homeworkId);

    const submissions = await this.prisma.submission.findMany({
      where: submissionWhere,
      select: {
        id: true,
        reviewDurationSeconds: true,
        reviewStartedAt: true,
        reviewSubmittedAt: true,
        homework: { select: { name: true, course: { select: { name: true } } } },
        evaluations: {
          select: {
            aiLevel: true,
            finalLevel: true,
            editedByTeacher: true,
            criterion: { select: { name: true } },
          },
        },
      },
    });

    const durationsWithData = submissions.filter(
      (s) => s.reviewDurationSeconds != null && s.reviewDurationSeconds > 0,
    );

    const avgDurationSeconds =
      durationsWithData.length > 0
        ? Math.round(
            durationsWithData.reduce((acc, s) => acc + s.reviewDurationSeconds!, 0) /
              durationsWithData.length,
          )
        : 0;

    const durations = durationsWithData.map((s) => s.reviewDurationSeconds!);
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    const evalsWithAi = submissions.flatMap((s) => s.evaluations).filter((e) => e.aiLevel != null);

    const totalWithAi = evalsWithAi.length;
    const editedCount = evalsWithAi.filter((e) => e.editedByTeacher).length;
    const agreedCount = totalWithAi - editedCount;
    const agreementRate = totalWithAi > 0 ? Math.round((agreedCount / totalWithAi) * 100) : 0;

    const { aiLevelDist, finalLevelDist } = this.buildLevelDists(evalsWithAi);
    const criterionEditRates = this.buildCriterionEditRates(evalsWithAi);

    const submissionBreakdown = submissions
      .filter((s) => s.reviewDurationSeconds != null)
      .map((s) => ({
        homeworkName: s.homework?.name ?? '—',
        courseName: s.homework?.course?.name ?? '—',
        durationSeconds: s.reviewDurationSeconds!,
        totalCriteria: s.evaluations.length,
        editedCriteria: s.evaluations.filter((e) => e.editedByTeacher).length,
      }))
      .sort((a, b) => b.durationSeconds - a.durationSeconds);

    return {
      message: 'Stats retrieved',
      data: {
        summary: {
          totalReviewed: submissions.length,
          avgDurationSeconds,
          minDurationSeconds: minDuration,
          maxDurationSeconds: maxDuration,
          totalEvaluations: totalWithAi,
          editedCount,
          agreedCount,
          agreementRate,
        },
        aiVsFinal: { aiLevelDist, finalLevelDist },
        criterionEditRates,
        submissionBreakdown,
      },
    };
  }

  private async buildSubmissionFilter(courseId?: string, homeworkId?: string) {
    const where: any = { state: 1, teacherReviewed: true };
    if (homeworkId) {
      where.homeworkId = homeworkId;
      return where;
    }
    if (courseId) {
      const homeworks = await this.prisma.homework.findMany({
        where: { courseId, state: 1 },
        select: { id: true },
      });
      where.homeworkId = { in: homeworks.map((h) => h.id) };
    }
    return where;
  }

  private buildLevelDists(evalsWithAi: { aiLevel: string | null; finalLevel: string | null }[]) {
    const levelOrder = ['AD', 'A', 'B', 'C'];
    const aiLevelDist = Object.fromEntries(levelOrder.map((l) => [l, 0]));
    const finalLevelDist = Object.fromEntries(levelOrder.map((l) => [l, 0]));
    for (const ev of evalsWithAi) {
      if (ev.aiLevel) aiLevelDist[ev.aiLevel]++;
      if (ev.finalLevel) finalLevelDist[ev.finalLevel]++;
    }
    return { aiLevelDist, finalLevelDist };
  }

  private buildCriterionEditRates(
    evalsWithAi: { editedByTeacher: boolean; criterion: { name: string } | null }[],
  ) {
    const criterionMap = new Map<string, { name: string; total: number; edited: number }>();
    for (const ev of evalsWithAi) {
      const name = ev.criterion?.name ?? 'Desconocido';
      if (!criterionMap.has(name)) criterionMap.set(name, { name, total: 0, edited: 0 });
      const entry = criterionMap.get(name)!;
      entry.total++;
      if (ev.editedByTeacher) entry.edited++;
    }
    return Array.from(criterionMap.values()).map((c) => ({
      criterionName: c.name,
      total: c.total,
      edited: c.edited,
      editRate: c.total > 0 ? Math.round((c.edited / c.total) * 100) : 0,
    }));
  }
}
