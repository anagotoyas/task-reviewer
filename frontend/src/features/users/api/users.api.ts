import { apiClient } from '@/lib/api-client';
import { ApiResponse, User, Role } from '@/types';

export interface CreateUserPayload {
  name: string;
  lastname: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserPayload {
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
  return data.data;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<ApiResponse<Role[]>>('/roles');
  return data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
  return data.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
