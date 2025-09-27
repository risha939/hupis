import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AccessTokenResponseDto {
  @ApiProperty({
    description: '엑세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })

  accessToken: string;
}