import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getHomeworks,
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  getGroups,
  createGroup,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  CreateGroupPayload,
} from '@/features/homeworks/api/homeworks.api';
import { getApiErrorMessage } from '@/lib/utils';

export const HOMEWORKS_QUERY_KEY = ['homeworks'];

export function useHomeworks() {
  return useQuery({ queryKey: HOMEWORKS_QUERY_KEY, queryFn: getHomeworks });
}

export function useHomework(id: string | null) {
  return useQuery({
    queryKey: [...HOMEWORKS_QUERY_KEY, id],
    queryFn: () => getHomework(id!),
    enabled: !!id,
  });
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

export function groupsQueryKey(homeworkId: string) {
  return ['homeworks', homeworkId, 'groups'];
}

export function useGroups(homeworkId: string | null) {
  return useQuery({
    queryKey: groupsQueryKey(homeworkId ?? ''),
    queryFn: () => getGroups(homeworkId!),
    enabled: !!homeworkId,
  });
}

export function useCreateGroup(homeworkId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(homeworkId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupsQueryKey(homeworkId) });
      notifications.show({ color: 'green', message: 'Grupo creado' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}
