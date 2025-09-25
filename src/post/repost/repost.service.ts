import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repost } from './entities/repost.entity';
import { Post } from '../post/entities/post.entity';
import { PostStatusType } from '../post/types/status.types';
import { GetRepostsQueryDto } from './dto/get-reposts.query.dto';
import { CreateRepostDto } from './dto/create-repost.dto';
import type { IUser } from 'src/shared/types/user.types';
import { Like } from '../like/entities/like.entity';
import { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class RepostService {
  constructor(
    @InjectRepository(Repost) private readonly repostRepo: Repository<Repost>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}
  async create(dto: CreateRepostDto, userId: number) {
    // 게시글 존재 및 활성 상태 확인
    const post = await this.postRepo.findOne({ where: { postId: dto.postId, status: PostStatusType.ACTIVE } });
    if (!post) throw new Error('존재하지 않는 게시글입니다.');

    // 중복 리포스트 방지
    const exists = await this.repostRepo.findOne({ where: { postId: dto.postId, userId } });
    if (exists) return exists; // 이미 리포스트된 경우 idempotent 처리

    const entity = this.repostRepo.create({ postId: dto.postId, userId });
    return await this.repostRepo.save(entity);
  }

  async remove(postId: number, userId: number) {
    const entity = await this.repostRepo.findOne({ where: { postId, userId } });
    if (!entity) return { message: '리포스트가 존재하지 않습니다.' };
    await this.repostRepo.remove(entity);
    return { message: '리포스트가 취소되었습니다.' };
  }

  async getReposts(dto: GetRepostsQueryDto, user: IUser) {
    const qb = this.repostRepo.createQueryBuilder('repost')
      .leftJoinAndSelect('repost.post', 'post')
      .leftJoinAndSelect('post.postImages', 'postImage')
      .leftJoin('post.user', 'user')
      .addSelect(['user.userId', 'user.nickname', 'user.profileImageUrl'])
      .where('post.status = :status', { status: PostStatusType.ACTIVE })
      .andWhere('repost.userId = :userId', { userId: user.userId })
      .addSelect((sub) => sub
        .select('COUNT(*)')
        .from(Like, 'l')
        .where('l.post_id = post.postId')
      , 'likeCount')
      .addSelect((sub) => sub
        .select('COUNT(*)')
        .from(Repost, 'r2')
        .where('r2.postId = post.postId')
      , 'repostCount')
      .addSelect((sub) => sub
        .select('COUNT(*)')
        .from(Comment, 'c')
        .where('c.postId = post.postId')
      , 'commentCount');

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

    const { entities: entitiesPlusOne, raw } = await qb.getRawAndEntities();
    const hasNext = entitiesPlusOne.length > dto.limit;
    const entities = hasNext ? entitiesPlusOne.slice(0, dto.limit) : entitiesPlusOne;
    const items = entities.map((entity, idx) => {
      const row: any = raw[idx] ?? {};
      return Object.assign(entity, {
        likeCount: Number(row.likeCount ?? 0),
        repostCount: Number(row.repostCount ?? 0),
        commentCount: Number(row.commentCount ?? 0),
      });
    });
    const nextCursor = items.length > 0 ? (items[items.length - 1] as any).createdAt.toISOString() : null;

    return { items, nextCursor, hasNext };
  }
}

