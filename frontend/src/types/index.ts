export interface Role {
  id: string;
  name: 'admin' | 'teacher' | 'student';
}

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: Role;
  state: number;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  teacher?: User;
  state: number;
  createdAt: string;
}

export type HomeworkStatus = 'draft' | 'published' | 'closed';

export interface Homework {
  id: string;
  courseId: string;
  rubricId: string;
  name: string;
  description: string;
  isGroup: boolean;
  startDate: string;
  endDate: string;
  status: HomeworkStatus;
  course?: Course;
  rubric?: Rubric;
}

export type PerformanceLevel = 'AD' | 'A' | 'B' | 'C';

export interface LevelDescriptor {
  id: string;
  criterionId: string;
  level: PerformanceLevel;
  description: string;
}

export interface RubricCriterion {
  id: string;
  rubricId: string;
  name: string;
  description?: string;
  orderIndex: number;
  levelDescriptors: LevelDescriptor[];
}

export interface Rubric {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  criteria: RubricCriterion[];
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId?: string;
  groupId?: string;
  videoUrl: string;
  submittedAt: string;
  teacherReviewed: boolean;
  reviewStartedAt?: string;
  reviewSubmittedAt?: string;
  reviewDurationSeconds?: number;
  evaluations?: CriterionEvaluation[];
}

export interface CriterionEvaluation {
  id: string;
  submissionId: string;
  criterionId: string;
  finalLevel: PerformanceLevel;
  finalReasoning: string;
  editedByTeacher: boolean;
  criterion?: RubricCriterion;
}

export interface HomeworkGroupMember {
  id: string;
  groupId: string;
  studentId: string;
  student: User;
}

export interface HomeworkGroup {
  id: string;
  homeworkId: string;
  name: string;
  state: number;
  members: HomeworkGroupMember[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
