import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRepostDto {
  @IsNotEmpty()
  @IsNumber()
  postId: number;
}
