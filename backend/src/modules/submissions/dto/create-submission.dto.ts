import { IsString, IsUUID, IsOptional, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  homeworkId: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsString()
  videoUrl: string;
}
