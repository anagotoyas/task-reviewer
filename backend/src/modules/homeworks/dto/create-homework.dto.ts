import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class CreateHomeworkDto {
  @IsUUID()
  courseId: string;

  @IsUUID()
  rubricId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'closed'])
  status?: 'draft' | 'published' | 'closed';
}
