import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from 'src/post/post/entities/post.entity';

@Entity('categorys')
export class Category {
  @PrimaryGeneratedColumn()
  categoryId: number;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
