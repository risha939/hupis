import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import type { IUser } from 'src/shared/types/user.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LikeResponseDto } from './response/like-response.dto';
import { LikeCancelResponseDto } from './response/like-cancel-response.dto';

@ApiTags('Like')
@ApiBearerAuth('JWT-auth')
@Controller('posts/:postId/like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) { }

  @ApiOperation({ summary: '좋아요 추가' })
  @ApiResponse({
    status: 201,
    description: '좋아요 추가 성공',
    type: LikeResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('postId') postId: string,
    @AllowedUser() user: IUser
  ): Promise<LikeResponseDto> {
    return this.likeService.create(+postId, user.userId);
  }

  @ApiOperation({ summary: '좋아요 취소' })
  @ApiResponse({
    status: 200,
    description: '좋아요 취소 성공',
    type: LikeCancelResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '좋아요를 찾을 수 없습니다' })
  @Delete()
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('postId') postId: string,
    @AllowedUser() user: IUser
  ): Promise<LikeCancelResponseDto> {
    return this.likeService.remove(+postId, user.userId);
  }
}
