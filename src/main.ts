import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initApplicationSetting } from './config/utils';
import { handleUnexpectedError } from './config/handle-unexpected-error';

async function bootstrap() {
  handleUnexpectedError();
  const app = await NestFactory.create(AppModule);
  initApplicationSetting(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
