import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsOptional, IsString } from 'class-validator';

export class GetCommentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'cursor는 ISO8601 날짜 문자열이어야 합니다.' })
  cursor?: string;
}


