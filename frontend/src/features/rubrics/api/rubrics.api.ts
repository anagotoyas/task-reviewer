import { apiClient } from '@/lib/api-client';
import { ApiResponse, Rubric } from '@/types';

export interface LevelDescriptorPayload {
  level: 'AD' | 'A' | 'B' | 'C';
  description: string;
}

export interface CriterionPayload {
  name: string;
  description?: string;
  orderIndex: number;
  levelDescriptors: LevelDescriptorPayload[];
}

export interface CreateRubricPayload {
  name: string;
  description?: string;
  criteria: CriterionPayload[];
}

export interface UpdateRubricPayload {
  name?: string;
  description?: string;
}

export async function getRubrics(): Promise<Rubric[]> {
  const { data } = await apiClient.get<ApiResponse<Rubric[]>>('/rubrics');
  return data.data;
}

export async function getRubric(id: string): Promise<Rubric> {
  const { data } = await apiClient.get<ApiResponse<Rubric>>(`/rubrics/${id}`);
  return data.data;
}

export async function createRubric(payload: CreateRubricPayload): Promise<Rubric> {
  const { data } = await apiClient.post<ApiResponse<Rubric>>('/rubrics', payload);
  return data.data;
}

export async function updateRubric(id: string, payload: UpdateRubricPayload): Promise<Rubric> {
  const { data } = await apiClient.patch<ApiResponse<Rubric>>(`/rubrics/${id}`, payload);
  return data.data;
}

export async function deleteRubric(id: string): Promise<void> {
  await apiClient.delete(`/rubrics/${id}`);
}
