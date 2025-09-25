import { IsNotEmpty, IsOptional, IsString, Matches, MinLength, MaxLength, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/, { message: 'id는 영문 소문자와 숫자만 가능합니다.' })
  @MinLength(4)
  @MaxLength(32)
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}A-Za-z\s]+$/u, { message: 'name은 한글/영문만 가능합니다.' })
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]+$/, { message: 'nickname은 영문 소문자만 허용합니다.' })
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^[\x20-\x7E]+$/, { message: '제어문자는 사용할 수 없습니다.' })
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]).+$/, {
    message: '소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
  })
  password: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '유효한 URL이어야 합니다.' })
  profileImageUrl?: string;
}
