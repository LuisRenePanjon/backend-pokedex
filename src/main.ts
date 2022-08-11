import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v3/');
  await app.listen(3000);
  return app;
}
bootstrap().then((r) =>
  console.log(`Server is running on ${r.getHttpServer().address().port}`),
);
