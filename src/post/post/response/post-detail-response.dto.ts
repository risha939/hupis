import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from 'src/post/category/response/category-response-dto';
import { ProfileResponseDto } from 'src/user/response/profile-response.dto';
import { PostImageDto } from './post-image-response.dto';

export class PostDetailResponseDto {
  @ApiProperty({
    description: '게시글 ID',
    example: 1,
  })

  postId: number;

  @ApiProperty({
    description: '게시글 텍스트 내용',
    example: '안녕하세요! 오늘 날씨가 정말 좋네요.',
  })

  text: string;

  @ApiProperty({
    description: '게시글 생성일시',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })

  createdAt: Date;

  @ApiProperty({
    description: '게시글 이미지 목록',
    type: [PostImageDto],
  })

  @Type(() => PostImageDto)
  postImages: PostImageDto[];

  @ApiProperty({
    description: '게시글 카테고리 정보',
    type: CategoryDto,
  })

  @Type(() => CategoryDto)
  category: CategoryDto;

  @ApiProperty({
    description: '게시글 작성자 정보',
    type: ProfileResponseDto,
  })

  @Type(() => ProfileResponseDto)
  user: ProfileResponseDto;

  @ApiProperty({
    description: '좋아요 수',
    example: 10,
  })

  likeCount: number;

  @ApiProperty({
    description: '리포스트 수',
    example: 5,
  })

  repostCount: number;

  @ApiProperty({
    description: '댓글 수',
    example: 3,
  })

  commentCount: number;

  @ApiProperty({
    description: '현재 사용자의 리포스트 여부',
    example: true,
  })

  isReposted: boolean;
}
