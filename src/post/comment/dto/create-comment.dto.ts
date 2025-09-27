import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '정말 좋은 글이네요!',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({
    description: '대댓글인 경우 부모 댓글 ID',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
