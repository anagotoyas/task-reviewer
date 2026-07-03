import { useState } from 'react';
import {
  Title,
  Stack,
  Group,
  Select,
  SimpleGrid,
  Paper,
  Text,
  Badge,
  Table,
  Button,
  Divider,
  Skeleton,
  Progress,
  ThemeIcon,
  RingProgress,
  Center,
} from '@mantine/core';
import {
  IconDownload,
  IconClock,
  IconCheck,
  IconEdit,
  IconChartBar,
} from '@tabler/icons-react';
import { useAnalyticsCourses, useAnalyticsHomeworks, useAnalyticsStats } from '../hooks/useAnalytics';
import { AnalyticsStats, SubmissionBreakdown, CriterionEditRate } from '../api/analytics.api';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const levelColor: Record<string, string> = { AD: 'violet', A: 'blue', B: 'yellow', C: 'red' };
const levelColors = ['violet', 'blue', 'yellow', 'red'];
const levels = ['AD', 'A', 'B', 'C'];

function StatCard({
  label,
  value,
  icon,
  color = 'blue',
}: {
  readonly label: string;
  readonly value: string | number;
  readonly icon: React.ReactNode;
  readonly color?: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group>
        <ThemeIcon color={color} variant="light" size="lg">
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed">{label}</Text>
          <Text fw={700} size="xl">{value}</Text>
        </div>
      </Group>
    </Paper>
  );
}

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToExcel(
  stats: AnalyticsStats,
  courseLabel: string,
  homeworkLabel: string,
) {
  const prefix = `analytics_${Date.now()}`;
  const filter = `${courseLabel}${homeworkLabel ? ' > ' + homeworkLabel : ''}`;

  // CSV 1: Resumen
  const summaryRows: (string | number)[][] = [
    ['Filtro', filter],
    [],
    ['TIEMPO DE REVISIÓN'],
    ['Total entregas revisadas', stats.summary.totalReviewed],
    ['Tiempo promedio', formatDuration(stats.summary.avgDurationSeconds)],
    ['Tiempo mínimo', formatDuration(stats.summary.minDurationSeconds)],
    ['Tiempo máximo', formatDuration(stats.summary.maxDurationSeconds)],
    [],
    ['CONCORDANCIA IA vs DOCENTE'],
    ['Total evaluaciones con IA', stats.summary.totalEvaluations],
    ['Aceptadas por el docente', stats.summary.agreedCount],
    ['Modificadas por el docente', stats.summary.editedCount],
    ['Tasa de concordancia', `${stats.summary.agreementRate}%`],
    [],
    ['Nivel', 'IA', 'Docente'],
    ...levels.map((l) => [
      l,
      stats.aiVsFinal.aiLevelDist[l as keyof typeof stats.aiVsFinal.aiLevelDist],
      stats.aiVsFinal.finalLevelDist[l as keyof typeof stats.aiVsFinal.finalLevelDist],
    ]),
  ];
  downloadCsv(toCsv(summaryRows), `${prefix}_resumen.csv`);

  // CSV 2: Edición por criterio
  const criterionRows: (string | number)[][] = [
    ['Criterio', 'Total evaluaciones', 'Modificadas', 'Tasa de edición (%)'],
    ...stats.criterionEditRates.map((c: CriterionEditRate) => [
      c.criterionName, c.total, c.edited, c.editRate,
    ]),
  ];
  downloadCsv(toCsv(criterionRows), `${prefix}_criterios.csv`);

  // CSV 3: Detalle entregas
  const breakdownRows: (string | number)[][] = [
    ['Tarea', 'Curso', 'Duración (s)', 'Criterios totales', 'Criterios editados'],
    ...stats.submissionBreakdown.map((s: SubmissionBreakdown) => [
      s.homeworkName, s.courseName, s.durationSeconds, s.totalCriteria, s.editedCriteria,
    ]),
  ];
  downloadCsv(toCsv(breakdownRows), `${prefix}_entregas.csv`);
}

function editRateColor(rate: number): string {
  if (rate > 50) return 'red';
  if (rate > 25) return 'orange';
  return 'green';
}

export function AnalyticsPage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [homeworkId, setHomeworkId] = useState<string | null>(null);

  const { data: courses, isLoading: loadingCourses } = useAnalyticsCourses();
  const { data: homeworks } = useAnalyticsHomeworks(courseId);
  const { data: stats, isLoading: loadingStats } = useAnalyticsStats(courseId, homeworkId);

  const courseLabel = Array.isArray(courses)
    ? (courses.find((c) => c.id === courseId)?.name ?? 'Todos los cursos')
    : 'Todos los cursos'
  const homeworkLabel = Array.isArray(homeworks)
    ? (homeworks.find((h) => h.id === homeworkId)?.name ?? '')
    : '';

  const handleCourseChange = (val: string | null) => {
    setCourseId(val);
    setHomeworkId(null);
  };

  const total = stats?.summary?.totalEvaluations ?? 0;
  const aiDist = stats?.aiVsFinal?.aiLevelDist;
  const finalDist = stats?.aiVsFinal?.finalLevelDist;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Title order={3}>Dashboard de evaluaciones</Title>
        {stats && (
          <Button
            leftSection={<IconDownload size={16} />}
            variant="light"
            onClick={() => exportToExcel(stats, courseLabel, homeworkLabel)}
          >
            Exportar CSV
          </Button>
        )}
      </Group>

      {/* Filtros */}
      <Paper withBorder p="md" radius="md">
        <Group grow>
          <Select
            label="Curso"
            placeholder="Todos los cursos"
            data={Array.isArray(courses) ? courses.map((c) => ({ value: c.id, label: c.name })) : []}
            value={courseId}
            onChange={handleCourseChange}
            clearable
            disabled={loadingCourses}
          />
          <Select
            label="Tarea"
            placeholder={courseId ? 'Todas las tareas' : 'Selecciona un curso primero'}
            data={Array.isArray(homeworks) ? homeworks.map((h) => ({ value: h.id, label: h.name })) : []}
            value={homeworkId}
            onChange={setHomeworkId}
            clearable
            disabled={!courseId}
          />
        </Group>
      </Paper>

      {loadingStats && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={`sk-${i}`} height={80} radius="md" />)}
        </SimpleGrid>
      )}
      {!loadingStats && stats?.summary && (
        <Stack gap="xl">
          {/* KPIs */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <StatCard
              label="Entregas revisadas"
              value={stats.summary.totalReviewed}
              icon={<IconChartBar size={18} />}
              color="blue"
            />
            <StatCard
              label="Tiempo promedio revisión"
              value={formatDuration(stats.summary.avgDurationSeconds)}
              icon={<IconClock size={18} />}
              color="teal"
            />
            <StatCard
              label="IA aceptada por docente"
              value={`${stats.summary.agreementRate}%`}
              icon={<IconCheck size={18} />}
              color="green"
            />
            <StatCard
              label="Criterios modificados"
              value={stats.summary.editedCount}
              icon={<IconEdit size={18} />}
              color="orange"
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* Concordancia IA vs Docente */}
            <Paper withBorder p="md" radius="md">
              <Text fw={600} mb="md">Concordancia IA vs Docente</Text>
              <Center>
                <RingProgress
                  size={160}
                  thickness={18}
                  label={
                    <Center>
                      <Stack gap={0} align="center">
                        <Text fw={700} size="xl">{stats.summary.agreementRate}%</Text>
                        <Text size="xs" c="dimmed">concordancia</Text>
                      </Stack>
                    </Center>
                  }
                  sections={[
                    { value: stats.summary.agreementRate, color: 'green', tooltip: `Aceptadas: ${stats.summary.agreedCount}` },
                    { value: 100 - stats.summary.agreementRate, color: 'orange', tooltip: `Modificadas: ${stats.summary.editedCount}` },
                  ]}
                />
              </Center>
              <SimpleGrid cols={2} mt="sm">
                <Paper bg="green.0" p="xs" radius="md">
                  <Text size="xs" c="dimmed">Aceptadas por docente</Text>
                  <Text fw={700} c="green.7">{stats.summary.agreedCount}</Text>
                </Paper>
                <Paper bg="orange.0" p="xs" radius="md">
                  <Text size="xs" c="dimmed">Modificadas por docente</Text>
                  <Text fw={700} c="orange.7">{stats.summary.editedCount}</Text>
                </Paper>
              </SimpleGrid>
            </Paper>

            {/* Distribución de niveles */}
            <Paper withBorder p="md" radius="md">
              <Text fw={600} mb="md">Distribución de niveles (IA vs Docente)</Text>
              <Stack gap="sm">
                {levels.map((level, i) => {
                  const aiVal = aiDist?.[level as keyof typeof aiDist] ?? 0;
                  const finalVal = finalDist?.[level as keyof typeof finalDist] ?? 0;
                  const aiPct = total > 0 ? Math.round((aiVal / total) * 100) : 0;
                  const finalPct = total > 0 ? Math.round((finalVal / total) * 100) : 0;
                  return (
                    <div key={level}>
                      <Group justify="space-between" mb={4}>
                        <Badge color={levelColor[level]} variant="filled" size="sm">{level}</Badge>
                        <Text size="xs" c="dimmed">IA: {aiVal} · Docente: {finalVal}</Text>
                      </Group>
                      <Stack gap={3}>
                        <Progress value={aiPct} color={levelColors[i]} size="sm" />
                        <Progress value={finalPct} color={levelColors[i]} size="sm" striped />
                      </Stack>
                    </div>
                  );
                })}
                <Text size="xs" c="dimmed" mt="xs">Barra sólida = IA · Barra rayada = Docente</Text>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Tasa de edición por criterio */}
          {stats.criterionEditRates.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text fw={600} mb="md">Tasa de edición por criterio</Text>
              <Stack gap="sm">
                {stats.criterionEditRates
                  .sort((a, b) => b.editRate - a.editRate)
                  .map((c) => (
                    <div key={c.criterionName}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm" style={{ flex: 1 }} truncate>{c.criterionName}</Text>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">{c.edited}/{c.total}</Text>
                          <Badge
                            color={editRateColor(c.editRate)}
                            variant="light"
                            size="sm"
                          >
                            {c.editRate}%
                          </Badge>
                        </Group>
                      </Group>
                      <Progress value={c.editRate} color={editRateColor(c.editRate)} size="sm" />
                    </div>
                  ))}
              </Stack>
            </Paper>
          )}

          <Divider label="Detalle por entrega" labelPosition="center" />

          {/* Tiempo de revisión por entrega */}
          <Paper withBorder radius="md">
            <Table striped highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tarea</Table.Th>
                  <Table.Th>Curso</Table.Th>
                  <Table.Th>Tiempo revisión</Table.Th>
                  <Table.Th>Criterios</Table.Th>
                  <Table.Th>Editados</Table.Th>
                  <Table.Th>% Editado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.submissionBreakdown.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text size="sm" c="dimmed" ta="center" py="md">Sin datos</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  stats.submissionBreakdown.map((s, i) => {
                    const editPct = s.totalCriteria > 0
                      ? Math.round((s.editedCriteria / s.totalCriteria) * 100)
                      : 0;
                    return (
                      <Table.Tr key={`row-${i}`}>
                        <Table.Td><Text size="sm" fw={500}>{s.homeworkName}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{s.courseName}</Text></Table.Td>
                        <Table.Td><Text size="sm">{formatDuration(s.durationSeconds)}</Text></Table.Td>
                        <Table.Td><Text size="sm">{s.totalCriteria}</Text></Table.Td>
                        <Table.Td><Text size="sm">{s.editedCriteria}</Text></Table.Td>
                        <Table.Td>
                          <Badge
                            color={editRateColor(editPct)}
                            variant="light"
                            size="sm"
                          >
                            {editPct}%
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
