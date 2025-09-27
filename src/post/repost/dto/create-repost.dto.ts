import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRepostDto {
  @ApiProperty({
    description: '리포스트할 게시글 ID',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  postId: number;
}
