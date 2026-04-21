import { useState } from 'react';
import {
  Title,
  Stack,
  Table,
  Text,
  Badge,
  Group,
  Anchor,
  Skeleton,
  Tooltip,
  Button,
} from '@mantine/core';
import { IconVideo, IconCheck, IconClock, IconEdit, IconRobot } from '@tabler/icons-react';
import { useSubmissions } from '@/features/submissions/hooks/useSubmissions';
import { ReviewSubmissionModal } from '@/features/submissions/components/ReviewSubmissionModal';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const levelColor: Record<string, string> = {
  AD: 'violet',
  A: 'blue',
  B: 'yellow',
  C: 'red',
};

export function SubmissionsPage() {
  const { data: submissions, isLoading } = useSubmissions();
  const [reviewId, setReviewId] = useState<string | null>(null);

  return (
    <Stack gap="lg">
      <Title order={3}>Entregas recibidas</Title>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={48} radius="sm" />
          ))}
        </Stack>
      ) : submissions?.length === 0 ? (
        <Text c="dimmed" size="sm" ta="center" py="md">
          No hay entregas registradas aún.
        </Text>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tarea</Table.Th>
              <Table.Th>Alumno / Grupo</Table.Th>
              <Table.Th>Video</Table.Th>
              <Table.Th>Entregado</Table.Th>
              <Table.Th>IA</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Niveles</Table.Th>
              <Table.Th>Acción</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions?.map((sub) => (
              <Table.Tr key={sub.id}>
                <Table.Td>
                  <Text fw={500} size="sm">{sub.homework?.name ?? '—'}</Text>
                  <Text size="xs" c="dimmed">{sub.homework?.course?.name ?? ''}</Text>
                </Table.Td>
                <Table.Td>
                  {sub.groupId ? (
                    <Badge variant="light" color="teal" size="sm">
                      {sub.group?.name ?? 'Grupo'}
                    </Badge>
                  ) : (
                    <Text size="sm">
                      {sub.student ? `${sub.student.name} ${sub.student.lastname}` : '—'}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Anchor href={sub.videoUrl} target="_blank" size="sm">
                    <Group gap={4}>
                      <IconVideo size={14} />
                      Ver
                    </Group>
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(sub.submittedAt)}</Text>
                </Table.Td>
                <Table.Td>
                  {sub.aiEvaluatedAt ? (
                    <Tooltip label={`Evaluado: ${new Date(sub.aiEvaluatedAt).toLocaleString('es-PE')}`}>
                      <Badge color="blue" variant="light" size="sm" leftSection={<IconRobot size={10} />}>
                        Listo
                      </Badge>
                    </Tooltip>
                  ) : (
                    <Badge color="gray" variant="light" size="sm" leftSection={<IconClock size={10} />}>
                      Pendiente
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {sub.teacherReviewed ? (
                    <Badge color="green" variant="light" size="sm" leftSection={<IconCheck size={10} />}>
                      Revisado
                    </Badge>
                  ) : (
                    <Badge color="orange" variant="light" size="sm" leftSection={<IconClock size={10} />}>
                      Pendiente
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {sub.teacherReviewed && sub.evaluations && sub.evaluations.length > 0 ? (
                    <Group gap={4}>
                      {sub.evaluations.map((ev) => (
                        <Tooltip key={ev.id} label={ev.criterion?.name ?? ''}>
                          <Badge color={levelColor[ev.finalLevel]} variant="filled" size="sm">
                            {ev.finalLevel}
                          </Badge>
                        </Tooltip>
                      ))}
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    color={sub.teacherReviewed ? 'gray' : 'blue'}
                    leftSection={<IconEdit size={14} />}
                    onClick={() => setReviewId(sub.id)}
                  >
                    {sub.teacherReviewed ? 'Ver/Editar' : 'Revisar'}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <ReviewSubmissionModal
        submissionId={reviewId}
        opened={!!reviewId}
        onClose={() => setReviewId(null)}
      />
    </Stack>
  );
}
