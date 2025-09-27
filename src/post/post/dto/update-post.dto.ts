import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    description: '수정할 게시글 텍스트 내용',
    example: '수정된 게시글 내용입니다.',
    maxLength: 280,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(280, { message: '텍스트는 최대 280자까지 입력 가능합니다.' })
  text: string;
}
