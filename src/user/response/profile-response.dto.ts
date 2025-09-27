import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
    @ApiProperty({
        description: '사용자 ID',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        description: '사용자 닉네임',
        example: '홍길동',
    })
    nickname: string;

    @ApiProperty({
        description: '프로필 이미지 URL',
        example: 'https://example.com/profile.jpg',
        nullable: true,
    })
    profileImageUrl: string | null;
}
