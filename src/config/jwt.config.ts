import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'dev-secret',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    issuer: process.env.JWT_ISSUER ?? 'http://localhost:3000',
    audience: process.env.JWT_AUDIENCE ?? 'http://localhost:3000',
    algorithm: process.env.JWT_ALGORITHM ?? 'HS256',
  },
}));


