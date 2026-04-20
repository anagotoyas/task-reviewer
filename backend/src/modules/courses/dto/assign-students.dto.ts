import { IsArray, IsUUID } from 'class-validator';

export class AssignStudentsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  studentIds: string[];
}
