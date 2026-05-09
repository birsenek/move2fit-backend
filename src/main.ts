import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('Move2Fit')
      .setDescription('Projeto Fitness')
      .setContact(
        'Grupo 06',
        'https://github.com/birsenek/PI-02',
        ''
      )
      .setVersion('0.3')
      .addApiKey(
        { type: 'apiKey', name: 'X-API-KEY', in: 'header' },
        'api-key',
      )
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/swagger', app, document);

    process.env.TZ = '-03:00';

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors();

    await app.listen(process.env.PORT ?? 3000);

    console.log(`A aplicação está sendo executada em: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Erro deconhecido no bootstrap:', error);
  process.exit(1);
});
