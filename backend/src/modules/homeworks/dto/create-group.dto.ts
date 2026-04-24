import { IsArray, IsString, IsUUID, ArrayMinSize } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  studentIds: string[];
}
