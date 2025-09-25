import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280, { message: '텍스트는 최대 280자까지 입력 가능합니다.' })
  text: string;
}
