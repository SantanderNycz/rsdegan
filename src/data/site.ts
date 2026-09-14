/* ============================================================
   site.ts — fonte única de conteúdo (PT-BR, verbatim do protótipo)
   Não reescrever nem traduzir para PT-PT.
   ============================================================ */

export const site = {
  name: 'R.S. Degan',
  role: 'Autor de Fantasia Medieval',
  title: 'R.S. Degan — Autor de Fantasia Medieval',
  description:
    'R.S. Degan, autor de Os Dragões Brancos. Uma jornada épica entre reinos ameaçados por sombras antigas.',
  url: 'https://rsdegan.com',
  locale: 'pt_BR',
  instagram: 'https://instagram.com/cronicasdegan',
  instagramHandle: '@cronicasdegan',
  ogImage: '/og/degan-og.jpg',
} as const;

export const book = {
  title: 'Os Dragões Brancos',
  volume: 'Volume I',
  amazon: 'https://www.amazon.com.br/dp/B0F3Q4SQQN',
  uiclap: 'https://loja.uiclap.com/titulo/ua92036/',
  // ISBN/data a preencher quando disponíveis (usados no JSON-LD Book).
  isbn: '',
} as const;

export const nav = [
  { href: '#topo', label: 'Início' },
  { href: '#obra', label: 'A Obra' },
  { href: '#autor', label: 'Biografia' },
  { href: '#elarion', label: 'Elarion' },
  // Rota /blog ainda não existe — mantida conforme o texto original do protótipo.
  { href: '/blog', label: 'Jornal de Elarion' },
  { href: '#contato', label: 'Contato' },
] as const;

export const buys = [
  {
    href: book.amazon,
    title: 'Amazon Kindle',
    meta: 'Edição digital',
    cta: 'Comprar',
  },
  {
    href: book.uiclap,
    title: 'UICLAP',
    meta: 'Livro físico',
    cta: 'Comprar',
  },
] as const;

export const toast = {
  badge: 'Já disponível',
  href: 'https://loja.uiclap.com/titulo/ua92036',
} as const;

export const contact = {
  // Endpoint do formulário. Vazio = o formulário mostra um aviso e remete para o Instagram.
  // Para ativar o envio, criar um form grátis (ex.: formspree.io) e colar o URL aqui,
  // p.ex.: 'https://formspree.io/f/xxxxxxxx'.
  formEndpoint: '',
} as const;
