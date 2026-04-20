import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { login } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getApiErrorMessage } from '@/lib/utils';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log('Login successful:', data);
      setAuth(data.user, data.accessToken, data.refreshToken);
      const role = data.user.role.name;
      console.log('User role:', role);
      if (role === 'admin') {
        console.log('Navigating to admin users page');
        navigate('/admin/users');
      } else if (role === 'teacher') {
        console.log('Navigating to teacher courses page');
        navigate('/teacher/courses');
      } else {
        console.log('Navigating to student courses page');
        navigate('/student/courses');
      }
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Error al iniciar sesión',
        message: getApiErrorMessage(error),
      });
    },
  });
}
