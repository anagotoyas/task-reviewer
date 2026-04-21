import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Stack,
  Select,
  Button,
  Text,
  Alert,
  Group,
  Progress,
  Paper,
  ActionIcon,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconVideo, IconX, IconUpload, IconCheck } from '@tabler/icons-react';
import { Homework } from '@/types';
import { useGroups } from '@/features/homeworks/hooks/useHomeworks';
import { useCreateSubmission } from '@/features/submissions/hooks/useSubmissions';
import { uploadVideo } from '@/features/submissions/api/submissions.api';
import { getApiErrorMessage } from '@/lib/utils';
import { notifications } from '@mantine/notifications';

interface Props {
  opened: boolean;
  onClose: () => void;
  homework: Homework | null;
}

export function SubmitHomeworkModal({ opened, onClose, homework }: Props) {
  const { data: groups } = useGroups(homework?.isGroup ? (homework?.id ?? null) : null);
  const createMutation = useCreateSubmission();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    initialValues: { groupId: '' },
    validate: {
      groupId: (v) => (homework?.isGroup && !v ? 'Selecciona tu grupo' : null),
    },
  });

  useEffect(() => {
    if (opened) {
      form.reset();
      setVideoFile(null);
      setUploadProgress(0);
      setUploading(false);
    }
  }, [opened]);

  const groupOptions =
    groups?.map((g) => ({
      value: g.id,
      label: `${g.name} (${g.members.map((m) => m.student.name).join(', ')})`,
    })) ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      notifications.show({ color: 'red', message: 'Solo se permiten archivos de video' });
      return;
    }
    setVideoFile(file);
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!homework || !videoFile) return;

    try {
      setUploading(true);
      const videoUrl = await uploadVideo(videoFile, setUploadProgress);

      createMutation.mutate(
        {
          homeworkId: homework.id,
          videoUrl,
          groupId: homework.isGroup ? values.groupId : undefined,
        },
        { onSuccess: onClose },
      );
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Error al subir el video',
        message: getApiErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
  };

  const isPending = uploading || createMutation.isPending;
  const canSubmit = !!videoFile && (!homework?.isGroup || !!form.values.groupId);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Entregar: ${homework?.name ?? ''}`}
      centered
      size="md"
      closeOnClickOutside={!isPending}
      closeOnEscape={!isPending}
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

          {/* File picker */}
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {!videoFile ? (
            <Paper
              withBorder
              p="xl"
              radius="md"
              style={{ cursor: 'pointer', borderStyle: 'dashed' }}
              onClick={() => inputRef.current?.click()}
            >
              <Stack align="center" gap="xs">
                <ThemeIcon size="xl" variant="light" color="blue">
                  <IconUpload size={24} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Haz clic para seleccionar tu video</Text>
                <Text size="xs" c="dimmed">MP4, MOV, AVI, MKV — máx. 500 MB</Text>
              </Stack>
            </Paper>
          ) : (
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="blue">
                    <IconVideo size={16} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 280 }}>
                      {videoFile.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </Text>
                  </Stack>
                </Group>
                {!isPending && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => { setVideoFile(null); setUploadProgress(0); }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )}
              </Group>

              {uploading && (
                <Stack gap={4} mt="sm">
                  <Progress value={uploadProgress} animated size="sm" />
                  <Text size="xs" c="dimmed" ta="right">{uploadProgress}%</Text>
                </Stack>
              )}

              {createMutation.isSuccess && (
                <Group gap={6} mt="sm">
                  <IconCheck size={14} color="green" />
                  <Text size="xs" c="green">Video subido correctamente</Text>
                </Group>
              )}
            </Paper>
          )}

          <Button
            type="submit"
            loading={isPending}
            disabled={!canSubmit}
            mt="xs"
          >
            {uploading ? `Subiendo... ${uploadProgress}%` : 'Enviar entrega'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
