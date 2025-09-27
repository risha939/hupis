import { ApiProperty } from '@nestjs/swagger';
import { PostDetailResponseDto } from './post-detail-response.dto';

export class PostListResponseDto {
    @ApiProperty({
        description: '게시글 목록',
        type: [PostDetailResponseDto],
    })
    items: PostDetailResponseDto[];

    @ApiProperty({
        description: '다음 페이지 커서',
        example: '2024-01-01T00:00:00.000Z',
        nullable: true,
    })
    nextCursor: string | null;

    @ApiProperty({
        description: '다음 페이지 존재 여부',
        example: true,
    })
    hasNext: boolean;
}
