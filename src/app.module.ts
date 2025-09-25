import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post/post.module';
import { CategoryModule } from './post/category/category.module';
import { CommentModule } from './post/comment/comment.module';
import { RepostModule } from './post/repost/repost.module';
import { LikeModule } from './post/like/like.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [databaseConfig, jwtConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('database') as any,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get('jwt');
        if (!jwtConfig) {
          throw new Error('JWT configuration not found');
        }
        return jwtConfig;
      },
    }),
    UserModule,
    PostModule,
    CategoryModule,
    LikeModule,
    CommentModule,
    RepostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}