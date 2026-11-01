import { Module } from '@nestjs/common';
import { GeracaoMensalService } from './geracao-mensal.service.js';
import { PagamentosController } from './pagamentos.controller.js';
import { PagamentosService } from './pagamentos.service.js';

@Module({
  controllers: [PagamentosController],
  providers: [GeracaoMensalService, PagamentosService],
  exports: [GeracaoMensalService],
})
export class PagamentosModule {}
