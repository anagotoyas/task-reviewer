import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  homeworkId: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsString()
  videoUrl: string;
}
