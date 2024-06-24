import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { uuid } from 'uuidv4';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  await app.listen(3000);
  // for (let i = 0; i < 25; i++) {
  //   console.log(i);
  //   console.log(uuidv4());
  // }
}
bootstrap();
