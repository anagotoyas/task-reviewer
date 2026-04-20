import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/features/users/api/users.api';
import { getApiErrorMessage } from '@/lib/utils';

export const USER_QUERY_KEY = ['users'];
export const ROLES_QUERY_KEY = ['roles'];

export function useUsers() {
  return useQuery({ queryKey: USER_QUERY_KEY, queryFn: getUsers });
}

export function useRoles() {
  return useQuery({ queryKey: ROLES_QUERY_KEY, queryFn: getRoles });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Usuario creado exitosamente' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Usuario actualizado' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Usuario eliminado' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}
