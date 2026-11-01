import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { ImoveisModule } from './imoveis/imoveis.module.js';
import { InquilinosModule } from './inquilinos/inquilinos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ImoveisModule,
    InquilinosModule,
  ],
})
export class AppModule {}
