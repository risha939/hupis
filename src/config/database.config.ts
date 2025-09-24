import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'postgres',
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',
  ssl:
    (process.env.DB_SSL ?? 'false') === 'true'
      ? { rejectUnauthorized: false }
      : false,
}));


