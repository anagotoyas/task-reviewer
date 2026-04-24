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
    // Build submission filter
    const submissionWhere: any = { state: 1, teacherReviewed: true };

    if (homeworkId) {
      submissionWhere.homeworkId = homeworkId;
    } else if (courseId) {
      const homeworks = await this.prisma.homework.findMany({
        where: { courseId, state: 1 },
        select: { id: true },
      });
      submissionWhere.homeworkId = { in: homeworks.map((h) => h.id) };
    }

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

    // --- Review duration stats ---
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

    const minDuration = durationsWithData.length > 0
      ? Math.min(...durationsWithData.map((s) => s.reviewDurationSeconds!))
      : 0;

    const maxDuration = durationsWithData.length > 0
      ? Math.max(...durationsWithData.map((s) => s.reviewDurationSeconds!))
      : 0;

    // --- AI vs Teacher comparison ---
    const allEvals = submissions.flatMap((s) => s.evaluations);
    const evalsWithAi = allEvals.filter((e) => e.aiLevel != null);

    const totalWithAi = evalsWithAi.length;
    const editedCount = evalsWithAi.filter((e) => e.editedByTeacher).length;
    const agreedCount = evalsWithAi.filter((e) => !e.editedByTeacher).length;
    const agreementRate = totalWithAi > 0 ? Math.round((agreedCount / totalWithAi) * 100) : 0;

    // Level distribution comparison: AI vs Final
    const levelOrder = ['AD', 'A', 'B', 'C'];
    const aiLevelDist = Object.fromEntries(levelOrder.map((l) => [l, 0]));
    const finalLevelDist = Object.fromEntries(levelOrder.map((l) => [l, 0]));

    for (const ev of evalsWithAi) {
      if (ev.aiLevel) aiLevelDist[ev.aiLevel]++;
      if (ev.finalLevel) finalLevelDist[ev.finalLevel]++;
    }

    // Per-criterion edit rate
    const criterionMap = new Map<string, { name: string; total: number; edited: number }>();
    for (const ev of evalsWithAi) {
      const name = ev.criterion?.name ?? 'Desconocido';
      const key = name;
      if (!criterionMap.has(key)) criterionMap.set(key, { name, total: 0, edited: 0 });
      const entry = criterionMap.get(key)!;
      entry.total++;
      if (ev.editedByTeacher) entry.edited++;
    }

    const criterionEditRates = Array.from(criterionMap.values()).map((c) => ({
      criterionName: c.name,
      total: c.total,
      edited: c.edited,
      editRate: c.total > 0 ? Math.round((c.edited / c.total) * 100) : 0,
    }));

    // Per-submission duration breakdown (for table)
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
        aiVsFinal: {
          aiLevelDist,
          finalLevelDist,
        },
        criterionEditRates,
        submissionBreakdown,
      },
    };
  }
}
