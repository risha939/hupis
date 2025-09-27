import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repost } from './entities/repost.entity';
import { Post } from '../post/entities/post.entity';
import { PostStatusType } from '../post/types/status.types';
import { GetRepostsQueryDto } from './dto/get-reposts.query.dto';
import { CreateRepostDto } from './dto/create-repost.dto';
import type { IUser } from 'src/shared/types/user.types';
import { RepostResponseDto } from './response/repost-response.dto';
import { RepostListResponseDto } from './response/repost-list-response.dto';
import { PostDetailResponseDto } from '../post/response/post-detail-response.dto';
import { ProfileResponseDto } from '../../user/response/profile-response.dto';
import { RepostDeleteResponseDto } from './response/repost-\bdelete-response.dto';
import { PostService } from '../post/post.service';

@Injectable()
export class RepostService {
  constructor(
    @InjectRepository(Repost) private readonly repostRepo: Repository<Repost>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly postService: PostService,
  ) { }

  async create(dto: CreateRepostDto, userId: number): Promise<RepostResponseDto> {
    // 게시글 존재 및 활성 상태 확인
    const post = await this.postRepo.findOne({ where: { postId: dto.postId, status: PostStatusType.ACTIVE } });
    if (!post) throw new NotFoundException('존재하지 않는 게시글입니다.');

    // 중복 리포스트 체크 및 이미 리포스트된 경우 해당 리포스트 반환
    const exists = await this.repostRepo.findOne({ where: { postId: dto.postId, userId } });
    if (exists) {
      return {
        postId: exists.postId,
        userId: exists.userId,
        createdAt: exists.createdAt,
      };
    }

    const entity = this.repostRepo.create({ postId: dto.postId, userId });
    const savedRepost = await this.repostRepo.save(entity);

    return {
      postId: savedRepost.postId,
      userId: savedRepost.userId,
      createdAt: savedRepost.createdAt,
    };
  }

  async remove(postId: number, userId: number): Promise<RepostDeleteResponseDto> {
    const entity = await this.repostRepo.findOne({ where: { postId, userId } });
    if (!entity) return { message: '리포스트가 존재하지 않습니다.' };
    await this.repostRepo.remove(entity);
    return { message: '리포스트가 취소되었습니다.' };
  }

  async getReposts(dto: GetRepostsQueryDto, user: IUser): Promise<RepostListResponseDto> {
    const qb = this.repostRepo.createQueryBuilder('repost')
      .leftJoinAndSelect('repost.post', 'post')
      .leftJoinAndSelect('post.postImages', 'postImage')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoin('post.user', 'user')
      .addSelect(['user.userId', 'user.nickname', 'user.profileImageUrl'])
      .where('post.status = :status', { status: PostStatusType.ACTIVE })
      .andWhere('repost.userId = :userId', { userId: user.userId });

    // 커서 기반: repost의 createdAt을 커서로 사용 (리포스트한 시점 기준)
    if (dto?.cursor) {
      const cursorDate = new Date(dto.cursor);
      if (dto?.sort === 'DESC') {
        qb.andWhere('repost.createdAt < :cursorDate', { cursorDate });
      } else {
        qb.andWhere('repost.createdAt > :cursorDate', { cursorDate });
      }
    }

    if (dto?.sort === 'DESC') {
      qb.orderBy('repost.createdAt', 'DESC');
    } else {
      qb.orderBy('repost.createdAt', 'ASC');
    }

    // limit+1 로 다음 페이지 여부 판단
    const take = dto.limit + 1;
    qb.take(take);

    const entities = await qb.getMany();
    const hasNext = entities.length > dto.limit;
    const reposts = hasNext ? entities.slice(0, dto.limit) : entities;

    // COUNT 로직을 별도로 조회
    const postIds = reposts.map(repost => repost.post.postId);
    const counts = await this.postService.getPostCounts(postIds);

    // PostDetailResponseDto 형태로 변환
    const items: PostDetailResponseDto[] = reposts.map((repost) => {
      const post = repost.post;
      const postCounts = counts.get(post.postId) || { likeCount: 0, repostCount: 0, commentCount: 0 };

      return {
        postId: post.postId,
        text: post.text,
        createdAt: post.createdAt,
        postImages: post.postImages || [],
        category: {
          categoryId: post.category.categoryId,
          name: post.category.name,
        },
        user: {
          userId: post.user.userId,
          nickname: post.user.nickname,
          profileImageUrl: post.user.profileImageUrl,
        } as ProfileResponseDto,
        likeCount: postCounts.likeCount,
        repostCount: postCounts.repostCount,
        commentCount: postCounts.commentCount,
        isReposted: true, // 리포스트 목록이므로 항상 true
      };
    });

    const nextCursor = items.length > 0 ? reposts[reposts.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor, hasNext };
  }
}

