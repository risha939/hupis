import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import type { IUser } from 'src/shared/types/user.types';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { GetPostsQueryDto } from './dto/get-posts.query.dto';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePostDto, @AllowedUser() user: IUser) {
    return this.service.create(dto, user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @AllowedUser() user: IUser) {
    return this.service.update(+id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @AllowedUser() user: IUser): Promise<void> {
    await this.service.remove(+id, user.userId);
    return;
  }

  @Get()
  async getPosts(
    @Query() dto: GetPostsQueryDto,
  ) {
    return this.service.getPosts(dto);
  }
}
