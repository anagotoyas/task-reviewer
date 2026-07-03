import { apiClient } from '@/lib/api-client';
import { ApiResponse, AuthUser } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<LoginResponseData> {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
