import { useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Button,
  Text,
  Alert,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconVideo, IconInfoCircle } from '@tabler/icons-react';
import { Homework } from '@/types';
import { useGroups } from '@/features/homeworks/hooks/useHomeworks';
import { useCreateSubmission } from '@/features/submissions/hooks/useSubmissions';

interface Props {
  opened: boolean;
  onClose: () => void;
  homework: Homework | null;
}

export function SubmitHomeworkModal({ opened, onClose, homework }: Props) {
  const { data: groups } = useGroups(homework?.isGroup ? (homework?.id ?? null) : null);
  const createMutation = useCreateSubmission();

  const form = useForm({
    initialValues: {
      videoUrl: '',
      groupId: '',
    },
    validate: {
      videoUrl: (v) => (v.trim() ? null : 'La URL del video es requerida'),
      groupId: (_, values) => {
        if (homework?.isGroup && !values.groupId) return 'Selecciona tu grupo';
        return null;
      },
    },
  });

  useEffect(() => {
    if (opened) form.reset();
  }, [opened]);

  const groupOptions =
    groups?.map((g) => ({
      value: g.id,
      label: `${g.name} (${g.members.map((m) => m.student.name).join(', ')})`,
    })) ?? [];

  const handleSubmit = (values: typeof form.values) => {
    if (!homework) return;
    createMutation.mutate(
      {
        homeworkId: homework.id,
        videoUrl: values.videoUrl,
        groupId: homework.isGroup ? values.groupId : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Entregar: ${homework?.name ?? ''}`}
      centered
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          {homework?.description && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              {homework.description}
            </Alert>
          )}

          {homework?.isGroup && (
            <Select
              label="Tu grupo"
              placeholder="Selecciona el grupo al que perteneces"
              data={groupOptions}
              {...form.getInputProps('groupId')}
            />
          )}

          <TextInput
            label="URL del video"
            placeholder="https://drive.google.com/... o https://youtube.com/..."
            leftSection={<IconVideo size={16} />}
            {...form.getInputProps('videoUrl')}
          />

          <Text size="xs" c="dimmed">
            Sube tu video a Google Drive, YouTube u otra plataforma y pega el enlace aquí.{' '}
            Asegúrate de que el video sea accesible para el docente.
          </Text>

          <Button type="submit" loading={createMutation.isPending} mt="xs">
            Enviar entrega
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
