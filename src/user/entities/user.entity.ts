import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserStatusType } from '../types/status.types';
import { Post } from '../../post/post/entities/post.entity';
import { RefreshToken } from './refresh-token.entity';
import { Comment } from '../../post/comment/entities/comment.entity';
import { Like } from '../../post/like/entities/like.entity';
import { Repost } from '../../post/repost/entities/repost.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', unique: true })
  loginId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  nickname: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', default: UserStatusType.ACTIVE })
  status: UserStatusType;

  @Column({ type: 'varchar', nullable: true })
  profileImageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Repost, (repost) => repost.user)
  reposts: Repost[];
}


