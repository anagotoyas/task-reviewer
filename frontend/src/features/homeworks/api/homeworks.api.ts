import { apiClient } from '@/lib/api-client';
import { ApiResponse, Homework, HomeworkGroup } from '@/types';

export interface CreateHomeworkPayload {
  courseId: string;
  rubricId: string;
  name: string;
  description: string;
  isGroup?: boolean;
  startDate: string;
  endDate: string;
  status?: 'draft' | 'published' | 'closed';
}

export interface UpdateHomeworkPayload {
  name?: string;
  description?: string;
  isGroup?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'published' | 'closed';
}

export async function getHomeworks(): Promise<Homework[]> {
  const { data } = await apiClient.get<ApiResponse<Homework[]>>('/homeworks');
  return data.data;
}

export async function createHomework(payload: CreateHomeworkPayload): Promise<Homework> {
  const { data } = await apiClient.post<ApiResponse<Homework>>('/homeworks', payload);
  return data.data;
}

export async function updateHomework(id: string, payload: UpdateHomeworkPayload): Promise<Homework> {
  const { data } = await apiClient.patch<ApiResponse<Homework>>(`/homeworks/${id}`, payload);
  return data.data;
}

export async function deleteHomework(id: string): Promise<void> {
  await apiClient.delete(`/homeworks/${id}`);
}

export interface CreateGroupPayload {
  name: string;
  studentIds: string[];
}

export async function getGroups(homeworkId: string): Promise<HomeworkGroup[]> {
  const { data } = await apiClient.get<ApiResponse<HomeworkGroup[]>>(`/homeworks/${homeworkId}/groups`);
  return data.data;
}

export async function createGroup(homeworkId: string, payload: CreateGroupPayload): Promise<HomeworkGroup> {
  const { data } = await apiClient.post<ApiResponse<HomeworkGroup>>(`/homeworks/${homeworkId}/groups`, payload);
  return data.data;
}
