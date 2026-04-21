import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getSubmissions,
  getSubmission,
  createSubmission,
  CreateSubmissionPayload,
} from '@/features/submissions/api/submissions.api';
import { HOMEWORKS_QUERY_KEY } from '@/features/homeworks/hooks/useHomeworks';
import { getApiErrorMessage } from '@/lib/utils';

export const SUBMISSIONS_QUERY_KEY = ['submissions'];

export function useSubmissions() {
  return useQuery({ queryKey: SUBMISSIONS_QUERY_KEY, queryFn: getSubmissions });
}

export function useSubmission(id: string | null) {
  return useQuery({
    queryKey: [...SUBMISSIONS_QUERY_KEY, id],
    queryFn: () => getSubmission(id!),
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubmissionPayload) => createSubmission(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBMISSIONS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: HOMEWORKS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Entrega enviada exitosamente' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}
