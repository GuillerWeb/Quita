import { Module } from '@nestjs/common';
import { ImoveisController } from './imoveis.controller.js';
import { ImoveisService } from './imoveis.service.js';

@Module({
  controllers: [ImoveisController],
  providers: [ImoveisService],
})
export class ImoveisModule {}
