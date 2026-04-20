import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CriterionEvaluationDto {
  @IsUUID()
  criterionId: string;

  @IsEnum(['AD', 'A', 'B', 'C'])
  finalLevel: 'AD' | 'A' | 'B' | 'C';

  @IsString()
  finalReasoning: string;
}

export class ReviewSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionEvaluationDto)
  evaluations: CriterionEvaluationDto[];
}
