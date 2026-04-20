import { IsOptional, IsString } from 'class-validator';

export class UpdateRubricDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
