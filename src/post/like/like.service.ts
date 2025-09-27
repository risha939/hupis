import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post } from '../post/entities/post.entity';
import { PostStatusType } from '../post/types/status.types';
import { LikeResponseDto } from './response/like-response.dto';
import { LikeCancelResponseDto } from './response/like-cancel-response.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) { }

  async create(postId: number, userId: number): Promise<LikeResponseDto> {
    const post = await this.postRepo.findOne({
      where: { postId, status: PostStatusType.ACTIVE }
    });
    if (!post) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    // 이미 좋아요한 게시글인지 확인
    const existingLike = await this.likeRepo.findOne({
      where: { postId, userId }
    });
    if (existingLike) return existingLike;

    // 좋아요 생성
    const like = this.likeRepo.create({
      postId,
      userId
    });

    return await this.likeRepo.save(like);
  }

  async remove(postId: number, userId: number): Promise<LikeCancelResponseDto> {
    // 좋아요 존재 확인
    const like = await this.likeRepo.findOne({
      where: { postId, userId }
    });
    if (!like) {
      throw new NotFoundException('좋아요를 찾을 수 없습니다.');
    }

    // 좋아요 삭제
    await this.likeRepo.remove(like);
    return { message: '좋아요가 취소되었습니다.' };
  }
}
