import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'BSNetOps API Service is running smoothly! 🚀';
  }
}