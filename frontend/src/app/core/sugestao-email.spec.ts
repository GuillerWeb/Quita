import { distancia, sugerirEmail } from './sugestao-email';

describe('sugerirEmail (D-22)', () => {
  it.each([
    // erros de digitação no nome do provedor
    ['ana@gmial.com', 'ana@gmail.com'],
    ['ana@gmai.com', 'ana@gmail.com'],
    ['ana@gnail.com', 'ana@gmail.com'],
    ['ana@gmaill.com', 'ana@gmail.com'],
    ['ana@hotmial.com', 'ana@hotmail.com'],
    ['ana@hotmal.com', 'ana@hotmail.com'],
    ['ana@hotamil.com', 'ana@hotmail.com'],
    ['ana@outlok.com', 'ana@outlook.com'],
    ['ana@outloo.com', 'ana@outlook.com'],
    ['ana@yaho.com.br', 'ana@yahoo.com.br'],
    ['ana@yahho.com.br', 'ana@yahoo.com.br'],
    ['ana@iclod.com', 'ana@icloud.com'],
    ['ana@icoud.com', 'ana@icloud.com'],
    // final errado
    ['ana@gmail.con', 'ana@gmail.com'],
    ['ana@gmail.co', 'ana@gmail.com'],
    ['ana@gmail.com.br', 'ana@gmail.com'],
    ['ana@gmail', 'ana@gmail.com'],
    ['ana@hotmail.cm', 'ana@hotmail.com'],
    ['ana@outlook.con', 'ana@outlook.com'],
    ['ana@icloud.co', 'ana@icloud.com'],
    ['ana@yahoo.com.bt', 'ana@yahoo.com.br'],
    // maiúsculas e espaços no domínio
    ['Ana.Souza@GMIAL.COM ', 'Ana.Souza@gmail.com'],
  ])('%s → %s', (digitado, sugerido) => {
    expect(sugerirEmail(digitado)).toBe(sugerido);
  });

  it.each([
    'ana@gmail.com',
    'ana@hotmail.com',
    'ana@outlook.com',
    'ana@yahoo.com.br',
    'ana@icloud.com',
    // domínios reais parecidos com os comuns
    'ana@hotmail.com.br',
    'ana@outlook.com.br',
    'ana@yahoo.com',
    'ana@ymail.com',
    'ana@email.com',
    'ana@mail.com',
    'ana@live.com',
    // outros provedores e e-mails corporativos
    'ana@uol.com.br',
    'ana@bol.com.br',
    'ana@terra.com.br',
    'ana@empresa.com.br',
    'ana@prefeitura.mt.gov.br',
    // incompletos
    'ana',
    'ana@',
    '@gmail.com',
    '',
  ])('%s → sem sugestão', (digitado) => {
    expect(sugerirEmail(digitado)).toBeNull();
  });

  it('distância conta troca de letras vizinhas como 1', () => {
    expect(distancia('gmial', 'gmail')).toBe(1);
    expect(distancia('gmail', 'gmail')).toBe(0);
    expect(distancia('', 'abc')).toBe(3);
  });
});
