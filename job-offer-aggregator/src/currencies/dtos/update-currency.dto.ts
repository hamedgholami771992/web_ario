import { IsOptional, ValidateIf, IsString } from 'class-validator';

export class UpdateCurrencyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @ValidateIf(o => !o.name && !o.symbol)
  invalid?: never; // triggers validation error
}