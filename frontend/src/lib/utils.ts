export type PerformanceLevel = 'AD' | 'A' | 'B' | 'C';

export function getLevelColor(level: PerformanceLevel): string {
  const map: Record<PerformanceLevel, string> = {
    AD: 'green',
    A: 'blue',
    B: 'yellow',
    C: 'red',
  };
  return map[level];
}

export function getLevelLabel(level: PerformanceLevel): string {
  const map: Record<PerformanceLevel, string> = {
    AD: 'Logro destacado',
    A: 'Logro esperado',
    B: 'En proceso',
    C: 'En inicio',
  };
  return map[level];
}

export function getApiErrorMessage(error: unknown): string {
  console.log('Error object:', error);
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string | string[] } };
    };
    const msg = axiosError.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  return 'Ocurrió un error inesperado';
}
