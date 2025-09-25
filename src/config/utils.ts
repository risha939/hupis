import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
      validationError: { target: false, value: false }, // 유효성 검사 실패 시 반환되는 에러 객체에서 원본 객체와 값을 제외
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
      transformOptions: {
        enableImplicitConversion: true, // 타입이 명확하지 않아도 암묵적으로 타입 변환을 허용
      },
      forbidUnknownValues: true, // DTO에 정의되지 않은 값이 들어오면 에러를 발생
      whitelist: true, // DTO에 정의된 속성만 허용하고, 나머지는 자동으로 제거
    }),
  );  
}