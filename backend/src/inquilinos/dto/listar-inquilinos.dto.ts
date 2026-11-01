import { IsIn, IsOptional } from 'class-validator';

export class ListarInquilinosDto {
  @IsOptional()
  @IsIn(['true', 'false', 'todos'], {
    message: 'O filtro "ativos" deve ser true, false ou todos',
  })
  ativos?: 'true' | 'false' | 'todos';
}
