import { IsDateString, IsNumber, Min, Max, Matches } from 'class-validator';
export class CreateAvaliacaoDto {
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dataColeta: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) @Max(500) peso: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.3) @Max(2.7) altura: number;
}
