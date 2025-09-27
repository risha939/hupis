import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initApplicationSetting } from './config/utils';
import { handleUnexpectedError } from './config/handle-unexpected-error';
import { buildSwagger } from './config/swagger';
import { RemoveUndefinedPipe } from './shared/interceptors/remove-undefined.interceptor';

async function bootstrap() {
  handleUnexpectedError();
  const app = await NestFactory.create(AppModule);
  initApplicationSetting(app);
  buildSwagger(app);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.useGlobalPipes(new RemoveUndefinedPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
