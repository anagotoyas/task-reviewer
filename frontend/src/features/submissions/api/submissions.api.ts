import { apiClient } from '@/lib/api-client';
import { ApiResponse, PerformanceLevel, Submission } from '@/types';

export interface CreateSubmissionPayload {
  homeworkId: string;
  groupId?: string;
  videoUrl: string;
}

export interface CriterionEvaluationPayload {
  criterionId: string;
  finalLevel: PerformanceLevel;
  finalReasoning: string;
  editedByTeacher?: boolean;
}

export interface ReviewSubmissionPayload {
  evaluations: CriterionEvaluationPayload[];
}

export async function getSubmissions(): Promise<Submission[]> {
  const { data } = await apiClient.get<ApiResponse<Submission[]>>('/submissions');
  return data.data;
}

export async function getSubmissionsByHomework(homeworkId: string): Promise<Submission[]> {
  const { data } = await apiClient.get<ApiResponse<Submission[]>>('/submissions', {
    params: { homeworkId },
  });
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

export async function startReview(id: string): Promise<Submission> {
  const { data } = await apiClient.post<ApiResponse<Submission>>(`/submissions/${id}/start-review`);
  return data.data;
}

export async function reviewSubmission(id: string, payload: ReviewSubmissionPayload): Promise<Submission> {
  const { data } = await apiClient.patch<ApiResponse<Submission>>(`/submissions/${id}/review`, payload);
  return data.data;
}

export async function retryAiEvaluation(id: string): Promise<Submission> {
  const { data } = await apiClient.post<ApiResponse<Submission>>(`/submissions/${id}/retry-ai`);
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
