import { Module } from '@nestjs/common';
import { GeracaoMensalService } from './geracao-mensal.service.js';

@Module({
  providers: [GeracaoMensalService],
  exports: [GeracaoMensalService],
})
export class PagamentosModule {}
