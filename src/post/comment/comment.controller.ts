import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import type { IUser } from 'src/shared/types/user.types';
import { GetCommentsQueryDto } from './dto/get-comments.query.dto';

@Controller('posts/:postId/comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(
    @Body() dto: CreateCommentDto,
    @AllowedUser() user: IUser,
    @Param('postId') postId: string,
  ) {
    return this.commentService.create(+postId, dto, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @AllowedUser() user: IUser
  ) {
    return this.commentService.update(+id, dto, user);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AllowedUser() user: IUser
  ) {
    return this.commentService.remove(+id, user);
  }

  @Get()
  async listByPostId(
    @Param('postId') postId: string,
    @Body() query: GetCommentsQueryDto
  ) {
    return this.commentService.listByPostId(+postId, query);
  }
}
