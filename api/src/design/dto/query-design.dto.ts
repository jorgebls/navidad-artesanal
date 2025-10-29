import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryDesignDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
