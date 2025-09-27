import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, MaxLength, ArrayMaxSize, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: '게시글 텍스트 내용',
    example: '안녕하세요! 오늘 날씨가 정말 좋네요.',
    maxLength: 280,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(280, { message: '텍스트는 최대 280자까지 입력 가능합니다.' })
  text: string;

  @ApiPropertyOptional({
    description: '게시글에 첨부할 이미지 URL 목록',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
    maxItems: 4,
    items: {
      type: 'string',
      format: 'uri',
    },
  })
  @IsArray()
  @ArrayMaxSize(4, { message: '이미지는 최대 4개까지 등록 가능합니다.' })
  @IsOptional()
  @IsUrl({}, { each: true, message: '유효한 URL이어야 합니다.' })
  imageUrls?: string[];

  @ApiProperty({
    description: '게시글 카테고리 ID',
    example: 1,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
