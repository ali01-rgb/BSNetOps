import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 SOLUSI TOTAL CORS & PREFLIGHT OPTIONS 🔥
  app.enableCors({
    origin: (origin, callback) => {
      // Mengizinkan request dari Vercel, Localhost, atau request tanpa origin (seperti Postman)
      const allowedOrigins = [
        'https://bsnetops.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback izinkan agar tidak kena CORS block
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Authentication',
      'Access-Control-Allow-Origin',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204, // Mengembalikan status 204 No Content untuk HTTP OPTIONS (Preflight)
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Bind ke 0.0.0.0 wajib untuk Railway Container
  console.log(`Application is running on port: ${port}`);
}
bootstrap();