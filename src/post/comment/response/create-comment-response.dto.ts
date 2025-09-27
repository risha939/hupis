import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
    @ApiProperty({
        description: '댓글 ID',
        example: 1,
    })
    commentId: number;

    @ApiProperty({
        description: '댓글 내용',
        example: '좋은 글이네요!',
    })
    content: string;

    @ApiProperty({
        description: '댓글 작성자 ID',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        description: '게시글 ID',
        example: 1,
    })
    postId: number;

    @ApiProperty({
        description: '상위 댓글 ID (대댓글인 경우)',
        example: null,
        nullable: true,
    })
    parentCommentId: number | null;

    @ApiProperty({
        description: '댓글 생성일시',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: '댓글 수정일시',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}
