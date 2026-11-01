import { Module } from '@nestjs/common';
import { PagamentosModule } from '../pagamentos/pagamentos.module.js';
import { InquilinosController } from './inquilinos.controller.js';
import { InquilinosService } from './inquilinos.service.js';

@Module({
  imports: [PagamentosModule],
  controllers: [InquilinosController],
  providers: [InquilinosService],
})
export class InquilinosModule {}
