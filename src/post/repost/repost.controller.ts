import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RepostService } from './repost.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { GetRepostsQueryDto } from './dto/get-reposts.query.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import type { IUser } from 'src/shared/types/user.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RepostResponseDto } from './response/repost-response.dto';
import { RepostListResponseDto } from './response/repost-list-response.dto';
import { RepostDeleteResponseDto } from './response/repost-\bdelete-response.dto';

@ApiTags('Repost')
@ApiBearerAuth('JWT-auth')
@Controller('repost')
@UseGuards(JwtAuthGuard)
export class RepostController {
  constructor(private readonly repostService: RepostService) { }

  @ApiOperation({ summary: '리포스트 생성' })
  @ApiResponse({
    status: 201,
    description: '리포스트 생성 성공',
    type: RepostResponseDto
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @Post()
  async create(
    @Body() dto: CreateRepostDto,
    @AllowedUser() user: IUser,
  ): Promise<RepostResponseDto> {
    return this.repostService.create(dto, user.userId);
  }

  @ApiOperation({ summary: '리포스트 취소' })
  @ApiParam({ name: 'postId', description: '게시글 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '리포스트 취소 성공',
    type: RepostDeleteResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @Delete('post/:postId')
  async remove(
    @Param('postId') postId: string,
    @AllowedUser() user: IUser,
  ): Promise<RepostDeleteResponseDto> {
    return this.repostService.remove(+postId, user.userId);
  }

  @ApiOperation({ summary: '리포스트 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '리포스트 목록 조회 성공',
    type: RepostListResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @Get()
  async getReposts(
    @Query() dto: GetRepostsQueryDto,
    @AllowedUser() user: IUser,
  ): Promise<RepostListResponseDto> {
    return this.repostService.getReposts(dto, user);
  }
}
