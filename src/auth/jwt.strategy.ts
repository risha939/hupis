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
      secretOrKey: config.get<string>('jwt.secret'),
      issuer: config.get<string>('jwt.signOptions.issuer'),
      // audience: config.get<string>('jwt.signOptions.audience'),
      algorithms: config.get<any>('jwt.signOptions.algorithm') ? [config.get<any>('jwt.signOptions.algorithm')] : undefined,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId };
  }
}


