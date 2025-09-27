import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
    @ApiProperty({
        description: '게시글 ID',
        example: 1,
    })
    postId: number;

    @ApiProperty({
        description: '사용자 ID',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        description: '좋아요 생성일시',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}
