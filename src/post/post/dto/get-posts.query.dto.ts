import { Type, Exclude, Transform } from 'class-transformer';
import { IsOptional, IsString, IsISO8601, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from 'src/shared/dto/base.dto';

export class GetPostsQueryDto {
  @ApiPropertyOptional({
    description: '조회할 게시글 수',
    example: 10,
    type: 'number',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
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
    description: '카테고리 ID로 필터링',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    description: '사용자 ID로 필터링',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sort?: 'ASC' | 'DESC';
}


