import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getRubrics,
  createRubric,
  updateRubric,
  deleteRubric,
  CreateRubricPayload,
  UpdateRubricPayload,
} from '@/features/rubrics/api/rubrics.api';
import { getApiErrorMessage } from '@/lib/utils';

export const RUBRICS_QUERY_KEY = ['rubrics'];

export function useRubrics() {
  return useQuery({ queryKey: RUBRICS_QUERY_KEY, queryFn: getRubrics });
}

export function useCreateRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRubricPayload) => createRubric(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RUBRICS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Rúbrica creada exitosamente' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useUpdateRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRubricPayload }) =>
      updateRubric(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RUBRICS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Rúbrica actualizada' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useDeleteRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRubric,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RUBRICS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Rúbrica eliminada' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}
