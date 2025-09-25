import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn()
  postImageId: number;

  @ManyToOne(() => Post, (post) => post.postImages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @RelationId((postImage: PostImage) => postImage.post)
  postId: number;

  @Column({ type: 'varchar', nullable: true })
  postImageUrl: string | null;
}
