import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCommentsQueryDto {
  @ApiPropertyOptional({
    description: '조회할 댓글 수',
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
}


