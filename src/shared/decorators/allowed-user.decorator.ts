import { createParamDecorator, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { IUser } from '../types/user.types';

export const AllowedUser = createParamDecorator(
  (data: string | string[] | undefined, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest();
    
    // JWT 가드에서 리턴한 user 정보 가져오기
    const user = request.user;

    // userId가 있는지 확인
    if (!user.userId) {
      throw new BadRequestException('유효하지 않은 사용자 정보입니다.');
    }

    
    if (data && data !== '*') {
      // 추가 권한 체크 필요시 아래 로직 추가
    }

    return user as IUser;
  },
);
