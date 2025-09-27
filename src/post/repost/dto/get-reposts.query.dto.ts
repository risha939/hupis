import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetRepostsQueryDto {
  @ApiPropertyOptional({
    description: '조회할 리포스트 수',
    example: 10,
    type: 'number',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  @ApiPropertyOptional({
    description: '페이지네이션을 위한 커서 (ISO8601 날짜 문자열)',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'cursor는 ISO8601 날짜 문자열이어야 합니다.' })
  cursor?: string;

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sort: 'ASC' | 'DESC' = 'DESC';
}
