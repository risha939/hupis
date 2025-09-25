import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import type { IUser } from 'src/shared/types/user.types';
import { GetCommentsQueryDto } from './dto/get-comments.query.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  async create(postId: number, dto: CreateCommentDto, user: IUser) {
    const post = await this.postRepo.findOne({ where: { postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');

    let parent: Comment | null = null;
    if (dto.parentCommentId) {
      parent = await this.commentRepo.findOne({ where: { commentId: dto.parentCommentId } });
      if (!parent) throw new NotFoundException('상위 댓글을 찾을 수 없습니다.');
    }

    const entity = this.commentRepo.create({
      content: dto.content,
      postId,
      userId: user.userId,
      parentCommentId: parent ? parent.commentId : null,
    });

    return await this.commentRepo.save(entity);
  }

  async update(commentId: number, dto: UpdateCommentDto, user: IUser) {
    const comment = await this.commentRepo.findOne({ where: { commentId } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== user.userId) throw new ForbiddenException('작성자만 수정할 수 있습니다.');

    const merge = this.commentRepo.merge(comment, dto);

    return await this.commentRepo.save(merge);
  }

  async remove(commentId: number, user: IUser) {
    const comment = await this.commentRepo.findOne({ where: { commentId } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== user.userId) throw new ForbiddenException('작성자만 삭제할 수 있습니다.');

    await this.commentRepo.remove(comment);
    return { message: '댓글이 삭제되었습니다.' };
  }

  async listByPostId(postId: number, query: GetCommentsQueryDto) {
    const qb = this.commentRepo.createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'DESC');

    if (query?.cursor) {
      const cursorDate = new Date(query.cursor);
      qb.andWhere('comment.createdAt < :cursorDate', { cursorDate });
    }

    const take = query.limit + 1;
    qb.take(take);

    const itemsPlusOne = await qb.getMany();
    const hasNext = itemsPlusOne.length > query.limit;
    const items = hasNext ? itemsPlusOne.slice(0, query.limit) : itemsPlusOne;
    const nextCursor = items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor, hasNext };
  }
}
