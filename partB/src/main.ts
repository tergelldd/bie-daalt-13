import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * App bootstrap.
 *
 * Swagger UI is served at `/api` (e.g. http://localhost:3000/api).
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('URL Shortener')
    .setDescription('URL redirect + short link API')
    .setVersion('1.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDoc);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

