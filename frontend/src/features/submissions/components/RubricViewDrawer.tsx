import {
  Drawer,
  Stack,
  Text,
  Badge,
  Paper,
  Group,
  Divider,
  ScrollArea,
  Title,
  Loader,
  Center,
} from '@mantine/core';
import { useHomework } from '@/features/homeworks/hooks/useHomeworks';

const LEVELS = ['AD', 'A', 'B', 'C'] as const;

const levelColor: Record<string, string> = {
  AD: 'violet',
  A: 'blue',
  B: 'yellow',
  C: 'red',
};

const levelLabel: Record<string, string> = {
  AD: 'Logro destacado',
  A: 'Logro esperado',
  B: 'En proceso',
  C: 'En inicio',
};

interface Props {
  readonly homeworkId: string | null;
  readonly opened: boolean;
  readonly onClose: () => void;
}

export function RubricViewDrawer({ homeworkId, opened, onClose }: Props) {
  const { data: homework, isLoading } = useHomework(opened ? homeworkId : null);

  const rubric = homework?.rubric;
  const sorted = (rubric?.criteria ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>Rúbrica: {rubric?.name ?? '...'}</Title>}
      position="right"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {isLoading ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <Stack gap="md">
          {rubric?.description && (
            <Text size="sm" c="dimmed">{rubric.description}</Text>
          )}

          {sorted.length === 0 && (
            <Text size="sm" c="dimmed" ta="center">No hay criterios definidos.</Text>
          )}

          {sorted.map((criterion, i) => (
            <Paper key={criterion.id} withBorder p="md" radius="md">
              <Stack gap="sm">
                <Group gap="xs">
                  <Badge variant="outline" color="gray" size="sm" fullWidth>#{i + 1}</Badge>
                  <Text fw={500}>{criterion.name}</Text>
                </Group>
                {criterion.description && (
                  <Text size="sm" c="dimmed">{criterion.description}</Text>
                )}
                <Divider />
                <Stack gap="xs">
                  {LEVELS.map((level) => {
                    const descriptor = criterion.levelDescriptors.find((ld) => ld.level === level);
                    return (
                      <Group key={level} align="flex-start" gap="sm">
                        <Badge color={levelColor[level]} variant="filled" w={36} style={{ flexShrink: 0 }}>
                          {level}
                        </Badge>
                        <Stack gap={0} style={{ flex: 1 }}>
                          <Text size="xs" c="dimmed">{levelLabel[level]}</Text>
                          <Text size="sm">{descriptor?.description ?? '—'}</Text>
                        </Stack>
                      </Group>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
