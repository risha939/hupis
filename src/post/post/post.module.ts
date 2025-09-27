import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostImage])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule { }
