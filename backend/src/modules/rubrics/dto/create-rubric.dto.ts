import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LevelDescriptorDto {
  @IsEnum(['AD', 'A', 'B', 'C'])
  level: 'AD' | 'A' | 'B' | 'C';

  @IsString()
  description: string;
}

export class CreateCriterionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LevelDescriptorDto)
  levelDescriptors: LevelDescriptorDto[];
}

export class CreateRubricDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCriterionDto)
  criteria: CreateCriterionDto[];
}
