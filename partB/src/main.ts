import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { stringify as stringifyYaml } from 'yaml';
import { AppModule } from './app.module';

/**
 * App bootstrap.
 *
 * Swagger UI is served at `/api` (e.g. http://localhost:3000/api).
 * OpenAPI spec is written to `partB/openapi.yaml` on each startup.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Default CSP breaks Swagger UI inline scripts; tighten in prod behind a template if needed.
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('URL Shortener')
    .setDescription('URL redirect + short link API')
    .setVersion('1.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDoc);

  const openapiYamlPath = join(__dirname, '..', '..', 'partB', 'openapi.yaml');
  await writeFile(openapiYamlPath, stringifyYaml(swaggerDoc), 'utf8');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

