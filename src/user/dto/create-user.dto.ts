import { IsNotEmpty, IsOptional, IsString, Matches, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 로그인 ID',
    example: 'user123',
    minLength: 4,
    maxLength: 32,
    pattern: '^[a-z0-9]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/, { message: 'id는 영문 소문자와 숫자만 가능합니다.' })
  @MinLength(4)
  @MaxLength(32)
  loginId: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '김철수',
    minLength: 2,
    maxLength: 50,
    pattern: '^[\\p{L}A-Za-z\\s]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}A-Za-z\s]+$/u, { message: 'name은 한글/영문만 가능합니다.' })
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'nickname',
    minLength: 2,
    maxLength: 20,
    pattern: '^[a-z]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]+$/, { message: 'nickname은 영문 소문자만 허용합니다.' })
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123!',
    minLength: 8,
    maxLength: 64,
    pattern: '^(?=.*[a-z])(?=.*\\d)(?=.*[ !"#$%&\'()*+,\\-./:;<=>?@\\[\\\\\\]^_`{|}~]).+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^[\x20-\x7E]+$/, { message: '제어문자는 사용할 수 없습니다.' })
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]).+$/, {
    message: '소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
  })
  password: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    format: 'uri',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '유효한 URL이어야 합니다.' })
  profileImageUrl?: string;
}
