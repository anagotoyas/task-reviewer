import { IsString, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsUUID()
  teacherId: string;
}
