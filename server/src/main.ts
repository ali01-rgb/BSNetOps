import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Buka gerbang biar React (Vite) bisa nembak data ke mari
  app.enableCors(); 
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();