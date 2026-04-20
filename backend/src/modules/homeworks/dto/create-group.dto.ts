import { IsArray, IsString, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsArray()
  @IsUUID('all', { each: true })
  studentIds: string[];
}
