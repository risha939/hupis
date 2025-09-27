import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
      issuer: process.env.JWT_ISSUER || 'http://localhost:3000',
      algorithms: process.env.JWT_ALGORITHM ? [process.env.JWT_ALGORITHM] : ['HS256'],
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId };
  }
}


