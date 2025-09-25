import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Unique, CreateDateColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('reposts')
@Unique(['postId', 'userId'])
export class Repost {
  @PrimaryColumn({ name: 'post_id' })
  postId: number;

  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Post, (post) => post.reposts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.reposts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
