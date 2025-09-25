import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, MaxLength, ArrayMaxSize, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280, { message: '텍스트는 최대 280자까지 입력 가능합니다.' })
  text: string;

  @IsArray()
  @ArrayMaxSize(4, { message: '이미지는 최대 4개까지 등록 가능합니다.' })
  @IsOptional()
  @IsUrl({}, { each: true, message: '유효한 URL이어야 합니다.' })
  imageUrls?: string[];

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
