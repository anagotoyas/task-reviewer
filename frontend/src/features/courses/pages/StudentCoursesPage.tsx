import { Title, SimpleGrid, Text, Stack, Skeleton, Card, ThemeIcon, Badge, Group } from '@mantine/core';
import { IconBook, IconSchool, IconAtom, IconMath, IconMicroscope, IconGlobe, IconPalette, IconMusic, IconDeviceDesktop, IconLeaf } from '@tabler/icons-react';
import { useCourses } from '@/features/courses/hooks/useCourses';

const COLORS = ['blue', 'teal', 'violet', 'orange', 'pink', 'cyan', 'grape', 'green', 'red', 'indigo'];
const ICONS = [IconBook, IconSchool, IconAtom, IconMath, IconMicroscope, IconGlobe, IconPalette, IconMusic, IconDeviceDesktop, IconLeaf];

function hashIndex(str: string, len: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % len;
}

export function StudentCoursesPage() {
  const { data: courses, isLoading } = useCourses();

  return (
    <Stack gap="lg">
      <Title order={3}>Mis cursos</Title>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={180} radius="md" />
          ))}
        </SimpleGrid>
      ) : courses?.length === 0 ? (
        <Text c="dimmed" size="sm" ta="center" py="xl">
          No estás inscrito en ningún curso.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {courses?.map((course) => {
            const color = COLORS[hashIndex(course.id, COLORS.length)];
            const Icon = ICONS[hashIndex(course.id + '1', ICONS.length)];
            return (
              <Card key={course.id} withBorder radius="md" padding="lg" style={{ cursor: 'default' }}>
                <Stack align="center" gap="md">
                  <ThemeIcon color={color} variant="light" size={72} radius="xl">
                    <Icon size={40} />
                  </ThemeIcon>
                  <Text fw={700} size="lg" ta="center" lineClamp={2}>{course.name}</Text>
                  {course.teacher && (
                    <Group gap={6}>
                      <Badge variant="light" color={color} size="sm">
                        Docente: {course.teacher.name} {course.teacher.lastname}
                      </Badge>
                    </Group>
                  )}
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
