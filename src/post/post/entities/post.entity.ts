import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn, RelationId, OneToMany } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { PostStatusType } from '../types/status.types';
import { PostImage } from './post-image.entity';
import { Category } from 'src/post/category/entities/category.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Like } from '../../like/entities/like.entity';
import { Repost } from '../../repost/entities/repost.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  postId: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((post: Post) => post.user)
  userId: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', default: PostStatusType.ACTIVE })
  status: PostStatusType;

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @RelationId((post: Post) => post.category)
  categoryId: number;

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  postImages: PostImage[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Repost, (repost) => repost.post)
  reposts: Repost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
