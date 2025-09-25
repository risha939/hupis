import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsISO8601 } from 'class-validator';

export class GetPostsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  // createdAt ISO 문자열 커서
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'cursor는 ISO8601 날짜 문자열이어야 합니다.' })
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  sort: 'ASC' | 'DESC' = 'DESC';
}


