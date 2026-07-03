import { useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  ActionIcon,
  Divider,
  Badge,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash, IconArrowLeft, IconGripVertical } from '@tabler/icons-react';
import { Rubric } from '@/types';
import { CreateRubricPayload } from '@/features/rubrics/api/rubrics.api';

const LEVELS = ['AD', 'A', 'B', 'C'] as const;

interface LevelDescriptorRowProps {
  readonly level: (typeof LEVELS)[number];
  readonly inputProps: ReturnType<ReturnType<typeof useForm>['getInputProps']>;
}

function LevelDescriptorRow({ level, inputProps }: LevelDescriptorRowProps) {
  return (
    <Group align="flex-start" gap="sm">
      <Badge color={levelColor[level]} variant="filled" w={40} mt={26} style={{ flexShrink: 0 }}>
        {level}
      </Badge>
      <Box style={{ flex: 1 }}>
        <Textarea
          label={levelLabel[level]}
          placeholder={`Describe el desempeño nivel ${level}`}
          rows={2}
          {...inputProps}
        />
      </Box>
    </Group>
  );
}

interface CriterionCardProps {
  readonly criterionIndex: number;
  readonly canRemove: boolean;
  readonly onRemove: () => void;
  readonly getInputProps: ReturnType<typeof useForm>['getInputProps'];
}

function CriterionCard({ criterionIndex, canRemove, onRemove, getInputProps }: CriterionCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs" style={{ flex: 1 }}>
            <IconGripVertical size={16} color="gray" />
            <Box style={{ flex: 1 }}>
              <TextInput
                placeholder={`Criterio ${criterionIndex + 1} — Ej: Claridad de exposición`}
                label="Nombre del criterio"
                {...getInputProps(`criteria.${criterionIndex}.name`)}
              />
            </Box>
          </Group>
          <ActionIcon
            variant="subtle"
            color="red"
            mt={24}
            onClick={onRemove}
            disabled={!canRemove}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        <Textarea
          label="Descripción del criterio (opcional)"
          placeholder="Describe qué se evalúa con este criterio"
          rows={2}
          {...getInputProps(`criteria.${criterionIndex}.description`)}
        />

        <Divider label="Descriptores de nivel" labelPosition="left" />

        <Stack gap="xs">
          {LEVELS.map((level, levelIndex) => (
            <LevelDescriptorRow
              key={level}
              level={level}
              inputProps={getInputProps(
                `criteria.${criterionIndex}.levelDescriptors.${levelIndex}.description`,
              )}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

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

interface CriterionFormValues {
  name: string;
  description: string;
  levelDescriptors: {
    level: 'AD' | 'A' | 'B' | 'C';
    description: string;
  }[];
}

interface FormValues {
  name: string;
  description: string;
  criteria: CriterionFormValues[];
}

function buildEmptyCriterion(): CriterionFormValues {
  return {
    name: '',
    description: '',
    levelDescriptors: LEVELS.map((level) => ({ level, description: '' })),
  };
}

function mapCriterionToFormValues(c: Rubric['criteria'][number]): CriterionFormValues {
  return {
    name: c.name,
    description: c.description ?? '',
    levelDescriptors: LEVELS.map((level) => {
      const existing = c.levelDescriptors.find((ld) => ld.level === level);
      return { level, description: existing?.description ?? '' };
    }),
  };
}

interface Props {
  readonly editRubric?: Rubric | null;
  readonly onSubmit: (payload: CreateRubricPayload) => void;
  readonly onCancel: () => void;
  readonly isPending: boolean;
}

export function RubricFormPage({ editRubric, onSubmit, onCancel, isPending }: Props) {
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      criteria: [buildEmptyCriterion()],
    },
    validate: {
      name: (v) => (v.trim() ? null : 'El nombre es requerido'),
      criteria: {
        name: (v) => (v.trim() ? null : 'El nombre del criterio es requerido'),
        levelDescriptors: {
          description: (v) => (v.trim() ? null : 'La descripción es requerida'),
        },
      },
    },
  });

  useEffect(() => {
    if (editRubric) {
      form.setValues({
        name: editRubric.name,
        description: editRubric.description ?? '',
        criteria: editRubric.criteria
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(mapCriterionToFormValues),
      });
    } else {
      form.reset();
    }
  }, [editRubric]);

  const addCriterion = () => {
    form.insertListItem('criteria', buildEmptyCriterion());
  };

  const removeCriterion = (index: number) => {
    if (form.values.criteria.length > 1) {
      form.removeListItem('criteria', index);
    }
  };

  const handleSubmit = (values: FormValues) => {
    const payload: CreateRubricPayload = {
      name: values.name,
      description: values.description || undefined,
      criteria: values.criteria.map((c, i) => ({
        name: c.name,
        description: c.description || undefined,
        orderIndex: i,
        levelDescriptors: c.levelDescriptors,
      })),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Group>
          <ActionIcon variant="subtle" onClick={onCancel} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={3}>
            {editRubric ? 'Editar rúbrica' : 'Nueva rúbrica'}
          </Title>
        </Group>

        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Text fw={500} size="sm">Información general</Text>
            <TextInput
              label="Nombre de la rúbrica"
              placeholder="Ej: Rúbrica de presentación oral"
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Descripción (opcional)"
              placeholder="Describe el propósito de esta rúbrica"
              rows={2}
              {...form.getInputProps('description')}
            />
          </Stack>
        </Paper>

        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={500} size="sm">
              Criterios de evaluación ({form.values.criteria.length})
            </Text>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={addCriterion}
            >
              Agregar criterio
            </Button>
          </Group>

          {form.values.criteria.map((_, criterionIndex) => (
            <CriterionCard
              key={`criterion-${criterionIndex}`}
              criterionIndex={criterionIndex}
              canRemove={form.values.criteria.length > 1}
              onRemove={() => removeCriterion(criterionIndex)}
              getInputProps={form.getInputProps}
            />
          ))}
        </Stack>

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {editRubric ? 'Guardar cambios' : 'Crear rúbrica'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
