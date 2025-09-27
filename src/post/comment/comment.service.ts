import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../../user/entities/user.entity';
import type { IUser } from 'src/shared/types/user.types';
import { GetCommentsQueryDto } from './dto/get-comments.query.dto';
import { CommentResponseDto } from './response/create-comment-response.dto';
import { CommentListResponseDto, CommentWithRepliesDto } from './response/comment-with-replies.dto';
import { isEmpty } from 'lodash';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) { }

  async create(postId: number, dto: CreateCommentDto, operator: IUser): Promise<CommentResponseDto> {
    const post = await this.postRepo.findOne({ where: { postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');

    const user = await this.userRepo.findOne({ where: { userId: operator.userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    let parent: Comment | null = null;
    if (dto.parentCommentId) {
      parent = await this.commentRepo.findOne({ where: { commentId: dto.parentCommentId } });
      if (!parent) throw new NotFoundException('상위 댓글을 찾을 수 없습니다.');
    }

    const entity = this.commentRepo.create({
      content: dto.content,
      post,
      user,
      userId: user.userId,
      parentComment: parent,
    });

    const savedComment = await this.commentRepo.save(entity);

    return {
      commentId: savedComment.commentId,
      content: savedComment.content,
      userId: savedComment.userId,
      postId: savedComment.postId,
      parentCommentId: savedComment.parentCommentId,
      createdAt: savedComment.createdAt,
      updatedAt: savedComment.updatedAt,
    };
  }

  async update(commentId: number, dto: UpdateCommentDto, user: IUser): Promise<CommentResponseDto> {
    const comment = await this.commentRepo.findOne({ where: { commentId } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== user.userId) throw new ForbiddenException('작성자만 수정할 수 있습니다.');

    const merge = this.commentRepo.merge(comment, dto);
    const updatedComment = await this.commentRepo.save(merge);

    return {
      commentId: updatedComment.commentId,
      content: updatedComment.content,
      userId: updatedComment.userId,
      postId: updatedComment.postId,
      parentCommentId: updatedComment.parentCommentId,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
    };
  }

  async remove(commentId: number, user: IUser): Promise<{ message: string }> {
    const comment = await this.commentRepo.findOne({ where: { commentId } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== user.userId) throw new ForbiddenException('작성자만 삭제할 수 있습니다.');

    await this.commentRepo.remove(comment);
    return { message: '댓글이 삭제되었습니다.' };
  }

  async listByPostId(postId: number, query: GetCommentsQueryDto): Promise<CommentListResponseDto> {
    // 최상위 댓글과 대댓글을 함께 조회
    const qb = this.commentRepo.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.replies', 'replies')
      .where('comment.post_id = :postId', { postId })
      .andWhere('comment.parent_comment_id IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .addOrderBy('replies.createdAt', 'ASC');

    if (query?.cursor) {
      const cursorDate = new Date(query.cursor);
      qb.andWhere('comment.createdAt < :cursorDate', { cursorDate });
    }

    const take = query.limit + 1;
    qb.take(take);

    const topLevelComments = await qb.getMany();
    const hasNext = topLevelComments.length > query.limit;
    const items = hasNext ? topLevelComments.slice(0, query.limit) : topLevelComments;

    // CommentWithRepliesDto 형태로 변환
    const itemsWithReplies: CommentWithRepliesDto[] = items.map(comment => ({
      ...comment,
      replies: comment.replies || []
    }));

    const nextCursor = items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;

    return { items: itemsWithReplies, nextCursor, hasNext };
  }
}
