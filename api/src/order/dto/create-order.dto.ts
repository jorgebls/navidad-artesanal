import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsString()
  @IsNotEmpty()
  size!: string;

  @IsNumber()
  @IsPositive()
  qty!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsObject()
  customizations?: Record<string, string>;
}

export class CreateOrderDto {
  @IsString()
  @MaxLength(150)
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @MaxLength(40)
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  city!: string;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsNumber()
  @Min(0)
  total!: number;

  @IsEnum(['COD'])
  paymentMethod!: 'COD';
}


