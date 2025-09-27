import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CategoryDto {
    @ApiProperty({
        description: '카테고리 ID',
        example: 1,
    })

    categoryId: number;

    @ApiProperty({
        description: '카테고리 이름',
        example: '일반',
    })

    name: string;
}