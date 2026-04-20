import { Title, Table, Text, Stack, Skeleton, Badge } from '@mantine/core';
import { useCourses } from '@/features/courses/hooks/useCourses';

export function StudentCoursesPage() {
  const { data: courses, isLoading } = useCourses();

  return (
    <Stack gap="lg">
      <Title order={3}>Mis cursos</Title>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={48} radius="sm" />
          ))}
        </Stack>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Curso</Table.Th>
              <Table.Th>Docente</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {courses?.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text c="dimmed" ta="center" size="sm" py="md">
                    No estás inscrito en ningún curso.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {courses?.map((course) => (
              <Table.Tr key={course.id}>
                <Table.Td>{course.name}</Table.Td>
                <Table.Td>
                  {course.teacher ? (
                    <Badge variant="light" color="blue">
                      {course.teacher.name} {course.teacher.lastname}
                    </Badge>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
