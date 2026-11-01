import { Module } from '@nestjs/common';
import { PagamentosModule } from '../pagamentos/pagamentos.module.js';
import { PainelController } from './painel.controller.js';
import { PainelService } from './painel.service.js';

@Module({
  imports: [PagamentosModule],
  controllers: [PainelController],
  providers: [PainelService],
})
export class PainelModule {}
