import { IsOptional, IsString } from 'class-validator';

export class QueryFabricDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
