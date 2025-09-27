import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: '사용자 로그인 ID',
    example: 'user123',
    minLength: 4,
    maxLength: 32,
    pattern: '^[a-z0-9]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/, { message: 'loginId는 영문 소문자와 숫자만 가능합니다.' })
  @MinLength(4)
  @MaxLength(32)
  loginId: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123!',
    minLength: 8,
    maxLength: 64,
    pattern: '^[\\x20-\\x7E]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^[\x20-\x7E]+$/, { message: '제어문자는 사용할 수 없습니다.' })
  password: string;
}


