import { SetMetadata } from '@nestjs/common';

export const ROTA_PUBLICA = 'rotaPublica';

/** Marca a rota como pública (sem JWT). Usado só em cadastro e login. */
export const Publico = () => SetMetadata(ROTA_PUBLICA, true);
