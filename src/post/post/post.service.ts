import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { isEmpty } from 'lodash';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { Category } from '../category/entities/category.entity';
import { PostStatusType } from './types/status.types';
import { GetPostsQueryDto } from './dto/get-posts.query.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePostDto, userId: number): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 카테고리 확인
      const category = await queryRunner.manager.findOne(Category, { 
        where: { categoryId: dto.categoryId } 
      });
      if (!category) {
        throw new NotFoundException('존재하지 않는 카테고리입니다.');
      }

      // 게시물 생성
      const post = queryRunner.manager.create(Post, {
        text: dto.text,
        userId,
        categoryId: dto.categoryId,
      });
      const savedPost = await queryRunner.manager.save(post);

      // 이미지 URL이 있으면 PostImage 생성
      if (dto.imageUrls && !isEmpty(dto.imageUrls)) {
        const postImages = dto.imageUrls.map(url => 
          queryRunner.manager.create(PostImage, {
            postId: savedPost.postId,
            postImageUrl: url,
          })
        );
        await queryRunner.manager.save(postImages);
      }

      await queryRunner.commitTransaction();
      
      return savedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { postId: id } });
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 게시물만 수정할 수 있습니다.');
    }

    const setMerge = this.postRepo.merge(post, updatePostDto);
    
    return await this.postRepo.save(setMerge);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postRepo.findOne({ where: { postId: id } });
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 게시물만 삭제할 수 있습니다.');
    }

    const setMerge = this.postRepo.merge(post, {
      status: PostStatusType.DELETED, 
      deletedAt: new Date()
    });

    await this.postRepo.save(setMerge);
  }

  async getPosts(dto: GetPostsQueryDto) {
    const qb = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.postImages', 'postImage')
      .leftJoin('post.user', 'user')
      .addSelect(['user.userId', 'user.nickname', 'user.profileImageUrl'])
      .leftJoin('post.likes', 'like')
      .leftJoin('post.reposts', 'repost')
      .leftJoin('post.comments', 'comment')
      .addSelect([
        'COUNT(DISTINCT like.userId) as likeCount',
        'COUNT(DISTINCT repost.userId) as repostCount', 
        'COUNT(DISTINCT comment.commentId) as commentCount'
      ])
      .where('post.status = :status', { status: PostStatusType.ACTIVE })
      .groupBy('post.postId, postImage.postImageId, user.userId');

    if (dto?.categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId: dto?.categoryId });
    }
    if (dto?.userId) {
      qb.andWhere('post.userId = :userId', { userId: dto?.userId });
    }

    // 커서 기반: createdAt을 커서로 사용
    if (dto?.cursor) {
      const cursorDate = new Date(dto.cursor);
      if (dto?.sort === 'DESC') {
        qb.andWhere('post.createdAt < :cursorDate', { cursorDate });
      } else {
        qb.andWhere('post.createdAt > :cursorDate', { cursorDate });
      }
    }

    if (dto?.sort === 'DESC') {
      qb.orderBy('post.createdAt', 'DESC');
    } else {
      qb.orderBy('post.createdAt', 'ASC');
    }

    // limit+1 로 다음 페이지 여부 판단
    const take = dto.limit + 1;
    qb.take(take);

    const itemsPlusOne = await qb.getMany();
    const hasNext = itemsPlusOne.length > dto.limit;
    const items = hasNext ? itemsPlusOne.slice(0, dto.limit) : itemsPlusOne;
    const nextCursor = items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor, hasNext };
  }
}
