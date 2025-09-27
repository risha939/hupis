import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Bearer 토큰 형식 검증
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token이 필요합니다.');
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    if (!token) {
      throw new UnauthorizedException('토큰이 비어있습니다.');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 토큰 검증 실패 시
    if (err || !user) {
      throw err || new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 토큰 만료 등의 정보가 있는 경우
    if (info) {
      console.log('JWT Info:', info);
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(`유효하지 않은 토큰입니다: ${info.message}`);
      }
    }

    return user;
  }
}


