import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './create-comment-response.dto';

export class CommentWithRepliesDto extends CommentResponseDto {
    @ApiProperty({
        description: '대댓글 목록',
        type: [CommentResponseDto],
        example: [],
    })
    replies: CommentResponseDto[];
}

export class CommentListResponseDto {
    @ApiProperty({
        description: '댓글 목록 (대댓글 포함)',
        type: [CommentWithRepliesDto],
    })
    items: CommentWithRepliesDto[];

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
