import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  content: string;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
