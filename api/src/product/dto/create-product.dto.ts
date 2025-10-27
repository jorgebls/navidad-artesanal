import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, IsNumberString } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  // aceptamos "99.90" como string -> IsNumberString
  @IsNumberString()
  basePrice: string;

  @IsInt() @Min(0)
  stock: number;

  @IsBoolean() @IsOptional()
  customizable?: boolean = false;
}