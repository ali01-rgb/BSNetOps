import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 BUKA GEMBOK CORS DI SINI 🔥
  app.enableCors({
    origin: [
      'https://bsnetops.vercel.app', // Domain Vercel kamu (JANGAN ADA TANDA '/' DI AKHIR)
      'http://localhost:5173',       // Izin untuk testing lokal di laptopmu
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Gunakan port dari environment Railway atau fallback ke 3000
  await app.listen(process.env.PORT || 3000);
}
bootstrap();