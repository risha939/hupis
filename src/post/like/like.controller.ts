import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import type { IUser } from 'src/shared/types/user.types';

@Controller('like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateLikeDto,
    @AllowedUser() user: IUser
  ) {
    return this.likeService.create(dto, user.userId);
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('postId') postId: string,
    @AllowedUser() user: IUser
  ) {
    return this.likeService.remove(+postId, user.userId);
  }
}
