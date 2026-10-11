import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

export class SearchAlunoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class CreateAlunoDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  usuario: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  senha?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  foto?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  altura?: number;
}

export class UpdateAlunoDto {
  @IsInt()
  @IsPositive()
  id: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  foto?: string;
}
