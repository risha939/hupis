import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class PostImageDto {
    @ApiProperty({
        description: '게시글 이미지 ID',
        example: 1,
    })

    postImageId: number;

    @ApiProperty({
        description: '게시글 이미지 URL',
        example: 'https://example.com/image.jpg',
        nullable: true,
    })

    postImageUrl: string | null;
}