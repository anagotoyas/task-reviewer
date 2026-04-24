import { useQuery } from '@tanstack/react-query';
import { getCourses, getHomeworks, getStats } from '../api/analytics.api';

export function useAnalyticsCourses() {
  return useQuery({ queryKey: ['analytics', 'courses'], queryFn: getCourses });
}

export function useAnalyticsHomeworks(courseId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'homeworks', courseId],
    queryFn: () => getHomeworks(courseId!),
    enabled: !!courseId,
  });
}

export function useAnalyticsStats(courseId: string | null, homeworkId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'stats', courseId, homeworkId],
    queryFn: () => getStats(courseId ?? undefined, homeworkId ?? undefined),
  });
}
