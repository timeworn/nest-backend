import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as firebaseConfig from './integrations/firebase/firebase.config.json';
import RedisStore from './shared/plugins/redis';

async function bootstrap() {
  // try {
  process.env.TZ = 'Africa/Lagos';

  // await RedisStore.connect();

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as any),
  });

  try {
    await RedisStore.connect();
  } catch (error) {
    console.log('redis-error is ', error);
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.useGlobalGuards(new PermissionGuard());

  const options = new DocumentBuilder().setTitle('Spottr Api').setDescription('The Spottr API description').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT || 3000, () => {
    console.log(`Spottr api running in ${process.env.NODE_ENV} mode on PORT ${process.env.PORT}.....`);
  });
  // } catch (error) {
  //   console.log('App Error', error);
  // }
}
bootstrap();

// process.on('SIGINT', async () => await getConnection().close());
