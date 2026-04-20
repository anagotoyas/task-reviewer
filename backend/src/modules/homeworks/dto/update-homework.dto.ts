import { IsString, IsBoolean, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class UpdateHomeworkDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'closed'])
  status?: 'draft' | 'published' | 'closed';
}
