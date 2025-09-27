import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

export function initApplicationSetting(app: INestApplication): void {
  const config = app.get(ConfigService);
  const corsOrigin = config.get<string>('CORS_ORIGIN') ?? '*';

  const origin = corsOrigin === '*'
    ? true
    : corsOrigin.split(',').map((v) => v.trim());

  app.enableCors({
    origin,
    credentials: true,
    methods: 'GET,PUT,PATCH,POST,DELETE',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      validationError: { target: false, value: false },
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
}