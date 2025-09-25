import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Unique } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('likes')
@Unique(['postId', 'userId'])
export class Like {
  @PrimaryColumn({ name: 'post_id' })
  postId: number;

  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
