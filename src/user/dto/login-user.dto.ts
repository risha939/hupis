import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/, { message: 'loginId는 영문 소문자와 숫자만 가능합니다.' })
  @MinLength(4)
  @MaxLength(32)
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^[\x20-\x7E]+$/, { message: '제어문자는 사용할 수 없습니다.' })
  password: string;
}


