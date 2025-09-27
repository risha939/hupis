import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import type { IUser } from 'src/shared/types/user.types';
import { GetCommentsQueryDto } from './dto/get-comments.query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommentResponseDto } from './response/create-comment-response.dto';
import { CommentListResponseDto } from './response/comment-with-replies.dto';

@ApiTags('Comment')
@ApiBearerAuth('JWT-auth')
@Controller('posts/:postId/comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @ApiOperation({ summary: '댓글 생성' })
  @ApiResponse({
    status: 201,
    description: '댓글 생성 성공',
    type: CommentResponseDto
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다' })
  @ApiResponse({ status: 404, description: '상위 댓글을 찾을 수 없습니다.' })
  @Post()
  async create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @AllowedUser() user: IUser,
  ): Promise<CommentResponseDto> {
    return this.commentService.create(+postId, dto, user);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 200, description: '댓글 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 403, description: '권한이 없습니다' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다' })
  @Patch(':id')
  async update(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @AllowedUser() user: IUser
  ): Promise<CommentResponseDto> {
    return this.commentService.update(+id, dto, user);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 403, description: '권한이 없습니다' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다' })
  @Delete(':id')
  async remove(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @AllowedUser() user: IUser
  ): Promise<{ message: string }> {
    return this.commentService.remove(+id, user);
  }

  @ApiOperation({ summary: '댓글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    type: CommentListResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @Get()
  async listByPostId(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryDto
  ): Promise<CommentListResponseDto> {
    return this.commentService.listByPostId(+postId, query);
  }
}
