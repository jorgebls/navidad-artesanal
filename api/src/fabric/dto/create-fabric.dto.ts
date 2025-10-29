import { IsNotEmpty, IsNumberString, IsOptional, IsString, Matches } from 'class-validator';

export class CreateFabricDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#?[0-9A-Fa-f]{6}$/, { message: 'colorHex debe ser un código hexadecimal de 6 caracteres' })
  colorHex?: string;

  @IsNumberString()
  @IsOptional()
  extraCost?: string;
}
