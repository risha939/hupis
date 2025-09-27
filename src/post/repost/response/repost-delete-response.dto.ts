import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RepostDeleteResponseDto {
    @ApiProperty({
        description: '응답 메시지',
        example: '리포스트가 취소되었습니다.',
    })
    message: string;
}
