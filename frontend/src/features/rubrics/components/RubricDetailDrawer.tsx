import {
  Drawer,
  Stack,
  Title,
  Text,
  Badge,
  Paper,
  Group,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { Rubric } from '@/types';

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

const LEVELS = ['AD', 'A', 'B', 'C'];

interface Props {
  rubric: Rubric | null;
  opened: boolean;
  onClose: () => void;
}

export function RubricDetailDrawer({ rubric, opened, onClose }: Props) {
  const sortedCriteria = rubric?.criteria
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex) ?? [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>{rubric?.name}</Title>}
      position="right"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        {rubric?.description && (
          <Text size="sm" c="dimmed">{rubric.description}</Text>
        )}

        <Text fw={500} size="sm">
          {sortedCriteria.length} criterio{sortedCriteria.length !== 1 ? 's' : ''}
        </Text>

        {sortedCriteria.map((criterion, i) => (
          <Paper key={criterion.id} withBorder p="md" radius="md">
            <Stack gap="sm">
              <Group gap="xs">
                <Badge variant="outline" color="gray" size="sm">
                  #{i + 1}
                </Badge>
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
    </Drawer>
  );
}
