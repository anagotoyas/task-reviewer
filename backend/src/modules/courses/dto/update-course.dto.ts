import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  teacherId?: string;
}
