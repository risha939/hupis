import { ApiProperty } from "@nestjs/swagger";

export class LikeCancelResponseDto {
    @ApiProperty({
        description: '응답 메시지',
        example: '좋아요가 취소되었습니다.',
    })
    message: string;
}