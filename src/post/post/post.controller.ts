import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import type { IUser } from 'src/shared/types/user.types';
import { GetPostsQueryDto } from './dto/get-posts.query.dto';
import { PostDetailResponseDto } from './response/post-detail-response.dto';
import { PostListResponseDto } from './response/post-list-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Post')
@ApiBearerAuth('JWT-auth')
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly service: PostService) { }

  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    type: PostDetailResponseDto
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없습니다' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePostDto, @AllowedUser() user: IUser): Promise<PostDetailResponseDto> {
    return this.service.create(dto, user.userId);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: PostDetailResponseDto
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 403, description: '권한이 없습니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @AllowedUser() user: IUser): Promise<PostDetailResponseDto> {
    return this.service.update(+id, dto, user.userId);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiParam({ name: 'id', description: '게시글 ID', example: 1 })
  @ApiResponse({ status: 204, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 403, description: '권한이 없습니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @AllowedUser() user: IUser): Promise<void> {
    await this.service.remove(+id, user.userId);
    return;
  }

  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: PostListResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @Get()
  async getPosts(
    @Query() dto: GetPostsQueryDto,
    @AllowedUser() user: IUser,
  ): Promise<PostListResponseDto> {
    return this.service.getPosts(dto, user.userId);
  }

  @ApiOperation({ summary: '게시글 상세 조회' })
  @ApiParam({ name: 'id', description: '게시글 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 조회 성공',
    type: PostDetailResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @Get(':id')
  async getPostDetail(
    @Param('id') id: string,
    @AllowedUser() user: IUser,
  ): Promise<PostDetailResponseDto> {
    return this.service.getPostDetail(+id, user.userId);
  }
}
