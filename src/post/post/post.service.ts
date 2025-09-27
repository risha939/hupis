import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { isEmpty } from 'lodash';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';
import { PostStatusType } from './types/status.types';
import { GetPostsQueryDto } from './dto/get-posts.query.dto';
import { PostDetailResponseDto } from './response/post-detail-response.dto';
import { PostListResponseDto } from './response/post-list-response.dto';
import { ProfileResponseDto } from '../../user/response/profile-response.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreatePostDto, userId: number): Promise<PostDetailResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 확인
      const user = await queryRunner.manager.findOne(User, {
        where: { userId }
      });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }

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
        user,
        category,
      });
      const savedPost = await queryRunner.manager.save(post);

      // 이미지 URL이 있으면 PostImage 생성
      let postImages: PostImage[] = [];
      if (dto.imageUrls && !isEmpty(dto.imageUrls)) {
        const postImageEntities = dto.imageUrls.map(url =>
          queryRunner.manager.create(PostImage, {
            post: savedPost,
            postImageUrl: url,
          })
        );
        postImages = await queryRunner.manager.save(postImageEntities);
      }

      await queryRunner.commitTransaction();

      return {
        postId: savedPost.postId,
        text: savedPost.text,
        createdAt: savedPost.createdAt,
        postImages: postImages.map(img => ({
          postImageId: img.postImageId,
          postImageUrl: img.postImageUrl,
        })),
        category: {
          categoryId: category.categoryId,
          name: category.name,
        },
        user: {
          userId: user!.userId,
          nickname: user!.nickname,
          profileImageUrl: user!.profileImageUrl,
        } as ProfileResponseDto,
        likeCount: 0,
        repostCount: 0,
        commentCount: 0,
        isReposted: false,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<PostDetailResponseDto> {
    const post = await this.postRepo.findOne({ where: { postId: id } });
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 게시물만 수정할 수 있습니다.');
    }

    const setMerge = this.postRepo.merge(post, updatePostDto);
    const updatedPost = await this.postRepo.save(setMerge);

    return await this.getPostDetail(updatedPost.postId);
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

  // 게시글 id 배열을 받아서 좋아요, 리포스트, 댓글 수를 조회
  async getPostCounts(postIds: number[]): Promise<Map<number, { likeCount: number; repostCount: number; commentCount: number }>> {
    if (postIds.length === 0) {
      return new Map();
    }

    // Like count 조회
    const likeCounts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.likes', 'like')
      .select('post.postId', 'postId')
      .addSelect('COUNT(like.userId)', 'count')
      .where('post.postId IN (:...postIds)', { postIds })
      .groupBy('post.postId')
      .getRawMany();

    // Repost count 조회
    const repostCounts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.reposts', 'repost')
      .select('post.postId', 'postId')
      .addSelect('COUNT(repost.userId)', 'count')
      .where('post.postId IN (:...postIds)', { postIds })
      .groupBy('post.postId')
      .getRawMany();

    // Comment count 조회
    const commentCounts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.comments', 'comment')
      .select('post.postId', 'postId')
      .addSelect('COUNT(comment.commentId)', 'count')
      .where('post.postId IN (:...postIds)', { postIds })
      .groupBy('post.postId')
      .getRawMany();

    // 결과를 Map으로 변환
    const countMap = new Map();

    // 모든 postId에 대해 기본값 설정
    postIds.forEach(postId => {
      countMap.set(postId, { likeCount: 0, repostCount: 0, commentCount: 0 });
    });

    // Like count 매핑
    likeCounts.forEach(item => {
      const existing = countMap.get(item.postId) || { likeCount: 0, repostCount: 0, commentCount: 0 };
      countMap.set(item.postId, { ...existing, likeCount: parseInt(item.count) || 0 });
    });

    // Repost count 매핑
    repostCounts.forEach(item => {
      const existing = countMap.get(item.postId) || { likeCount: 0, repostCount: 0, commentCount: 0 };
      countMap.set(item.postId, { ...existing, repostCount: parseInt(item.count) || 0 });
    });

    // Comment count 매핑
    commentCounts.forEach(item => {
      const existing = countMap.get(item.postId) || { likeCount: 0, repostCount: 0, commentCount: 0 };
      countMap.set(item.postId, { ...existing, commentCount: parseInt(item.count) || 0 });
    });

    return countMap;
  }

  async getPosts(dto: GetPostsQueryDto, userId?: number): Promise<PostListResponseDto> {
    const qb = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.postImages', 'postImage')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.status = :status', { status: PostStatusType.ACTIVE });

    if (dto?.categoryId) {
      qb.andWhere('post.category_id = :categoryId', { categoryId: dto?.categoryId });
    }
    if (dto?.userId) {
      qb.andWhere('post.user_id = :userId', { userId: dto?.userId });
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

    const entities = await qb.getMany();
    const hasNext = entities.length > dto.limit;
    const posts = hasNext ? entities.slice(0, dto.limit) : entities;
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    // COUNT 로직을 별도로 조회
    const postIds = posts.map(post => post.postId);
    const counts = await this.getPostCounts(postIds);

    // 사용자 리포스트 여부 확인
    let userReposts: Set<number> = new Set();
    if (userId) {
      const repostQuery = this.postRepo
        .createQueryBuilder('post')
        .leftJoin('post.reposts', 'repost')
        .select('post.postId')
        .where('repost.user_id = :userId', { userId })
        .andWhere('post.status = :status', { status: PostStatusType.ACTIVE });

      const repostedPosts = await repostQuery.getMany();
      userReposts = new Set(repostedPosts.map(post => post.postId));
    }
    // PostDetailResponseDto 형태로 변환
    const items: PostDetailResponseDto[] = posts.map((post) => {
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
        isReposted: userReposts.has(post.postId),
      };
    });

    return { items, nextCursor, hasNext };
  }

  async getPostDetail(postId: number, userId?: number): Promise<PostDetailResponseDto> {
    const post = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.postImages', 'postImage')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.postId = :postId', { postId })
      .andWhere('post.status = :status', { status: PostStatusType.ACTIVE })
      .getOne();

    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    // COUNT 로직을 별도로 조회
    const counts = await this.getPostCounts([postId]);
    const postCounts = counts.get(postId) || { likeCount: 0, repostCount: 0, commentCount: 0 };

    // 사용자 리포스트 여부 확인
    let isReposted = false;
    if (userId) {
      const repostQuery = this.postRepo
        .createQueryBuilder('post')
        .leftJoin('post.reposts', 'repost')
        .where('post.postId = :postId', { postId })
        .andWhere('repost.user_id = :userId', { userId })
        .andWhere('post.status = :status', { status: PostStatusType.ACTIVE });

      const repost = await repostQuery.getOne();
      isReposted = !!repost;
    }
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
      isReposted,
    };
  }
}
