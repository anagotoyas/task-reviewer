import { Title, Table, Text, Stack, Skeleton, Badge } from '@mantine/core';
import { useHomeworks } from '@/features/homeworks/hooks/useHomeworks';
import { HomeworkStatus } from '@/types';

const statusColor: Record<HomeworkStatus, string> = {
  draft: 'gray',
  published: 'green',
  closed: 'red',
};

const statusLabel: Record<HomeworkStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  closed: 'Cerrada',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function StudentHomeworksPage() {
  const { data: homeworks, isLoading } = useHomeworks();

  return (
    <Stack gap="lg">
      <Title order={3}>Mis tareas</Title>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`sk-${i}`} height={48} radius="sm" />
          ))}
        </Stack>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tarea</Table.Th>
              <Table.Th>Curso</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Inicio</Table.Th>
              <Table.Th>Cierre</Table.Th>
              <Table.Th>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {homeworks?.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" ta="center" size="sm" py="md">
                    No tienes tareas asignadas.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {homeworks?.map((hw) => (
              <Table.Tr key={hw.id}>
                <Table.Td fw={500}>{hw.name}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{hw.course?.name ?? '—'}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={hw.isGroup ? 'teal' : 'blue'} size="sm">
                    {hw.isGroup ? 'Grupal' : 'Individual'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(hw.startDate)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(hw.endDate)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={statusColor[hw.status]} variant="light" size="sm">
                    {statusLabel[hw.status]}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
