import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Ini trik sakti biar kita gak capek import modul ini berulang-ulang nanti
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Wajib diexport biar fiturnya bisa dipakai di luar kamar ini
})
export class PrismaModule {}