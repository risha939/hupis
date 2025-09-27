import { Module } from '@nestjs/common';
import { RepostService } from './repost.service';
import { RepostController } from './repost.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repost } from './entities/repost.entity';
import { Post } from '../post/entities/post.entity';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repost, Post]),
    PostModule,
  ],
  controllers: [RepostController],
  providers: [RepostService],
})
export class RepostModule { }
