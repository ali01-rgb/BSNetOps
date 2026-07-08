import { SetMetadata } from '@nestjs/common';

// Menggunakan string metadata 'roles' untuk menyimpan array role yang diizinkan
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);