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

export async function uploadVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/upload/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data.data.url;
}
