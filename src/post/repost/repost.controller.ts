import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RepostService } from './repost.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { UpdateRepostDto } from './dto/update-repost.dto';
import { GetRepostsQueryDto } from './dto/get-reposts.query.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';
import type { IUser } from 'src/shared/types/user.types';

@Controller('repost')
@UseGuards(JwtAuthGuard)
export class RepostController {
  constructor(private readonly repostService: RepostService) {}

  @Post()
  async create(
    @Body() dto: CreateRepostDto,
    @AllowedUser() user: IUser,
  ) {
    return this.repostService.create(dto, user.userId);
  }

  @Delete(':postId')
  async remove(
    @Param('postId') postId: string,
    @AllowedUser() user: IUser,
  ) {
    return this.repostService.remove(+postId, user.userId);
  }

  @Get()
  async getReposts(
    @Query() dto: GetRepostsQueryDto,
    @AllowedUser() user: IUser,
  ) {
    return this.repostService.getReposts(dto, user);
  }
}
