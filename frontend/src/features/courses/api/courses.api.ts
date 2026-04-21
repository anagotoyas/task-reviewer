import { apiClient } from '@/lib/api-client';
import { ApiResponse, Course, User } from '@/types';

interface CourseDetail extends Course {
  students: { student: User }[];
}

export interface CreateCoursePayload {
  name: string;
  teacherId: string;
}

export interface UpdateCoursePayload {
  name?: string;
  teacherId?: string;
}

export interface AssignStudentsPayload {
  studentIds: string[];
}

export async function getCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<ApiResponse<Course[]>>('/courses');
  return data.data;
}

export async function getTeachers(): Promise<User[]> {
  const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
  return data.data.filter((u) => u.role.name === 'teacher');
}

export async function getStudents(): Promise<User[]> {
  const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
  return data.data.filter((u) => u.role.name === 'student');
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const { data } = await apiClient.post<ApiResponse<Course>>('/courses', payload);
  return data.data;
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
  const { data } = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}`, payload);
  return data.data;
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/courses/${id}`);
}

export async function assignStudents(courseId: string, payload: AssignStudentsPayload): Promise<void> {
  await apiClient.post(`/courses/${courseId}/students`, payload);
}

export async function getCourseStudents(courseId: string): Promise<User[]> {
  const { data } = await apiClient.get<ApiResponse<CourseDetail>>(`/courses/${courseId}`);
  return data.data.students.map((s) => s.student);
}
