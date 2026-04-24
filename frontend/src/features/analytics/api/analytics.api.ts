import { apiClient } from '@/lib/api-client';

export interface CourseOption {
  id: string;
  name: string;
}

export interface HomeworkOption {
  id: string;
  name: string;
}

export interface AnalyticsSummary {
  totalReviewed: number;
  avgDurationSeconds: number;
  minDurationSeconds: number;
  maxDurationSeconds: number;
  totalEvaluations: number;
  editedCount: number;
  agreedCount: number;
  agreementRate: number;
}

export interface LevelDist {
  AD: number;
  A: number;
  B: number;
  C: number;
}

export interface CriterionEditRate {
  criterionName: string;
  total: number;
  edited: number;
  editRate: number;
}

export interface SubmissionBreakdown {
  homeworkName: string;
  courseName: string;
  durationSeconds: number;
  totalCriteria: number;
  editedCriteria: number;
}

export interface AnalyticsStats {
  summary: AnalyticsSummary;
  aiVsFinal: { aiLevelDist: LevelDist; finalLevelDist: LevelDist };
  criterionEditRates: CriterionEditRate[];
  submissionBreakdown: SubmissionBreakdown[];
}

export async function getCourses(): Promise<CourseOption[]> {
  const { data } = await apiClient.get<{ data: CourseOption[] }>('/analytics/courses');
  return data.data;
}

export async function getHomeworks(courseId: string): Promise<HomeworkOption[]> {
  const { data } = await apiClient.get<{ data: HomeworkOption[] }>('/analytics/homeworks', {
    params: { courseId },
  });
  return data.data;
}

export async function getStats(courseId?: string, homeworkId?: string): Promise<AnalyticsStats> {
  const { data } = await apiClient.get<{ data: AnalyticsStats }>('/analytics/stats', {
    params: { courseId, homeworkId },
  });
  return data.data;
}
