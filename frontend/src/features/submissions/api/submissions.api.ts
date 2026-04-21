import { apiClient } from '@/lib/api-client';
import { ApiResponse, Submission } from '@/types';

export interface CreateSubmissionPayload {
  homeworkId: string;
  groupId?: string;
  videoUrl: string;
}

export async function getSubmissions(): Promise<Submission[]> {
  const { data } = await apiClient.get<ApiResponse<Submission[]>>('/submissions');
  return data.data;
}

export async function getSubmission(id: string): Promise<Submission> {
  const { data } = await apiClient.get<ApiResponse<Submission>>(`/submissions/${id}`);
  return data.data;
}

export async function createSubmission(payload: CreateSubmissionPayload): Promise<Submission> {
  const { data } = await apiClient.post<ApiResponse<Submission>>('/submissions', payload);
  return data.data;
}
