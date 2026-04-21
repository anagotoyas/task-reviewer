import { useState } from 'react';
import {
  Title,
  Button,
  Group,
  Stack,
  Skeleton,
  Text,
  Paper,
  ActionIcon,
  Tooltip,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useRubrics, useCreateRubric, useDeleteRubric } from '@/features/rubrics/hooks/useRubrics';
import { RubricFormPage } from '@/features/rubrics/components/RubricFormPage';
import { RubricDetailDrawer } from '@/features/rubrics/components/RubricDetailDrawer';
import { CreateRubricPayload } from '@/features/rubrics/api/rubrics.api';
import { Rubric } from '@/types';

type View = 'list' | 'create' | 'edit';

export function RubricsPage() {
  const { data: rubrics, isLoading } = useRubrics();
  const createMutation = useCreateRubric();
  const deleteMutation = useDeleteRubric();

  const [view, setView] = useState<View>('list');
  const [editRubric, setEditRubric] = useState<Rubric | null>(null);
  const [detailRubric, setDetailRubric] = useState<Rubric | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openCreate = () => {
    setEditRubric(null);
    setView('create');
  };

  const openEdit = (rubric: Rubric) => {
    setEditRubric(rubric);
    setView('edit');
  };

  const openDetail = (rubric: Rubric) => {
    setDetailRubric(rubric);
    setDrawerOpen(true);
  };

  const confirmDelete = (rubric: Rubric) => {
    modals.openConfirmModal({
      title: 'Eliminar rúbrica',
      centered: true,
      children: (
        <Text size="sm">
          ¿Eliminar la rúbrica <strong>{rubric.name}</strong>? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(rubric.id),
    });
  };

  const handleSubmit = (payload: CreateRubricPayload) => {
    if (view === 'edit' && editRubric) {
      // Backend only supports updating name/description; recreate rubric for full edit
      deleteMutation.mutate(editRubric.id, {
        onSuccess: () =>
          createMutation.mutate(payload, { onSuccess: () => setView('list') }),
      });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setView('list') });
    }
  };

  const isSubmitting = createMutation.isPending || deleteMutation.isPending;

  if (view === 'create' || view === 'edit') {
    return (
      <RubricFormPage
        editRubric={view === 'edit' ? editRubric : null}
        onSubmit={handleSubmit}
        onCancel={() => setView('list')}
        isPending={isSubmitting}
      />
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Mis rúbricas</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Nueva rúbrica
        </Button>
      </Group>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={140} radius="md" />
          ))}
        </SimpleGrid>
      ) : rubrics?.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed" size="sm">
            Aún no tienes rúbricas. Crea tu primera rúbrica.
          </Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {rubrics?.map((rubric) => (
            <Paper key={rubric.id} withBorder p="md" radius="md">
              <Stack gap="sm" h="100%" justify="space-between">
                <Stack gap="xs">
                  <Text fw={600} lineClamp={2}>{rubric.name}</Text>
                  {rubric.description && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {rubric.description}
                    </Text>
                  )}
                  <Badge variant="light" color="blue" size="sm" w="fit-content">
                    {rubric.criteria.length} criterio{rubric.criteria.length !== 1 ? 's' : ''}
                  </Badge>
                </Stack>

                <Group gap="xs" justify="flex-end">
                  <Tooltip label="Ver detalle">
                    <ActionIcon variant="subtle" color="gray" onClick={() => openDetail(rubric)}>
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Editar">
                    <ActionIcon variant="subtle" onClick={() => openEdit(rubric)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Eliminar">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => confirmDelete(rubric)}
                      loading={deleteMutation.isPending}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      <RubricDetailDrawer
        rubric={detailRubric}
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Stack>
  );
}
