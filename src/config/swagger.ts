import { SwaggerModule } from "@nestjs/swagger";
import packageJson from "../../package.json";
import { DocumentBuilder } from "@nestjs/swagger";
import { INestApplication } from '@nestjs/common';


const config = new DocumentBuilder()
  .setTitle('Hupis API')
  .setDescription('Hupis 소셜 미디어 플랫폼 API 문서')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'JWT 토큰을 입력하세요',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

export function buildSwagger(
  app: INestApplication,
  name = packageJson.name,
): void {
  SwaggerModule.setup(
    `docs/${name}`,
    app,
    SwaggerModule.createDocument(app, config),
  )
}