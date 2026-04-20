import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getCourses,
  getTeachers,
  getStudents,
  createCourse,
  updateCourse,
  deleteCourse,
  assignStudents,
  CreateCoursePayload,
  UpdateCoursePayload,
  AssignStudentsPayload,
} from '@/features/courses/api/courses.api';
import { getApiErrorMessage } from '@/lib/utils';

export const COURSES_QUERY_KEY = ['courses'];
export const TEACHERS_QUERY_KEY = ['users', 'teachers'];
export const STUDENTS_QUERY_KEY = ['users', 'students'];

export function useCourses() {
  return useQuery({ queryKey: COURSES_QUERY_KEY, queryFn: getCourses });
}

export function useTeachers() {
  return useQuery({ queryKey: TEACHERS_QUERY_KEY, queryFn: getTeachers });
}

export function useStudents() {
  return useQuery({ queryKey: STUDENTS_QUERY_KEY, queryFn: getStudents });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Curso creado exitosamente' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) =>
      updateCourse(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Curso actualizado' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Curso eliminado' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}

export function useAssignStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: AssignStudentsPayload }) =>
      assignStudents(courseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      notifications.show({ color: 'green', message: 'Estudiantes asignados' });
    },
    onError: (error) => {
      notifications.show({ color: 'red', title: 'Error', message: getApiErrorMessage(error) });
    },
  });
}
