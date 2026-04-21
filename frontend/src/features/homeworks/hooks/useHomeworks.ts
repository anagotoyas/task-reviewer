import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
} from '@/features/homeworks/api/homeworks.api';
import { getApiErrorMessage } from '@/lib/utils';

export const HOMEWORKS_QUERY_KEY = ['homeworks'];

export function useHomeworks() {
  return useQuery({ queryKey: HOMEWORKS_QUERY_KEY, queryFn: getHomeworks });
}

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHomeworkPayload) => createHomework(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOMEWORKS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Tarea creada exitosamente' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useUpdateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHomeworkPayload }) =>
      updateHomework(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOMEWORKS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Tarea actualizada' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useDeleteHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHomework,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOMEWORKS_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Tarea eliminada' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}
