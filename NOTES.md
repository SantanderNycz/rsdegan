# Notas de produção — decisões e pendências

## Performance (correção do travamento)

O travamento **não** vinha do Astro (que só corre no build e entrega HTML estático). Vinha da
camada de animação. Corrigido:

- **Neve/névoa (`snow.ts`) reescrita:** sprites pré-renderizados (`drawImage`) em vez de
  `createRadialGradient` a cada frame; **removido o `filter: blur()`** dos canvases (era
  re-rasterizado a cada frame — o maior custo); DPR limitado a 1.5; loop com delta-time e teto
  de ~36fps; menos partículas.
- **Herói:** removido o `filter: blur()` animado no scroll (dissolve agora só com opacidade/escala).
- **Grão:** deixou de usar `mix-blend-mode` sobre canvas em animação (recompunha a cada frame).

Se ainda assim quiseres o scroll 100% nativo (sem Lenis), é um interruptor — posso remover o Lenis
e manter os reveals do GSAP.

## Imagens oficiais (integradas)

Recuperadas do site atual (`wp-content/uploads`) e otimizadas via `astro:assets` (AVIF/WebP + fallback):

- **Capa do livro** → `src/assets/capa-os-dragoes-brancos.png`, na secção "A Obra".
- **Mapa de Elarion** → `src/assets/mapa-elarion.jpg`, a alimentar o **pan/zoom** (já ativo).
- **Retrato do autor** → `src/assets/robson-degan.png`, na página `/biografia`.
- (Disponíveis mas não usadas: imagens de destaque de cada post do blog — o design é text-first;
  digo se quiseres integrá-las.)

## Formulário de contato

Adicionado à secção Contato (campos: nome, e-mail, assunto, mensagem — como no site original).
**Falta 1 passo para enviar de verdade:** criar um form grátis (ex.: formspree.io) e colar o URL em
`src/data/site.ts` → `contact.formEndpoint`. Sem isso, ao submeter mostra um aviso e remete para o
Instagram (não quebra).

## Pendente

- **Passagem real do livro (excerto):** a citação do protótipo era placeholder inventado e **não
  foi usada**. A secção só aparece quando deres uma passagem real —
  `src/pages/index.astro`: `<Excerpt quote={null} … />` → `quote="…"`.

## Conteúdo (decisão: MANTER texto original)

Textos aplicados com fidelidade ao site atual (rsdegan.com). Nav com ordem **A Obra → Biografia**
invertida conforme pedido.

- **/blog** (Jornal de Elarion) — agora no ar (ver secção abaixo).
- **/biografia** — página criada com o texto integral e fiel da bio do site.
- Botão **"Ver mapa ampliado"** (`#mapBtn`) na secção Elarion — foca o mapa interativo (pan/zoom).
- Secção Contato: *"Novidades sobre a saga, bastidores da escrita e o Jornal de Elarion."* (original).

## Jornal de Elarion (blog migrado)

Blog reconstruído como **content collection estática** (Markdown em `src/content/blog/`), sem
WordPress. Índice em `/blog`, posts em `/blog/<slug>`.

- **19 posts publicados**, migrados de rsdegan.com com o texto integral (PT-BR), + 1 rascunho.
- **Redirects 301** dos URLs antigos (raiz) → `/blog/<slug>` em `vercel.json`, para preservar SEO.
- **JSON-LD `BlogPosting`** por post; categorias e datas preservadas; ordenação por data (desc).
- **Rascunho (não publicado):** o quiz *"Qual personagem… você seria?"* era interativo (JS) sem
  textos de resultado no HTML. Ficou como `draft: true` em
  `qual-personagem-de-os-dragoes-brancos-voce-seria.md`. Para publicar como quiz real, é preciso o
  mapeamento respostas → personagens e as descrições de cada resultado.
- **Rever fidelidade (extração condensada):** dois posts curtos vieram um pouco resumidos pela
  ferramenta de extração e valem um cotejo com o original — *"As Raças de Elarion"* e
  *"A Lâmina do Eco Prateado"*. Os restantes 17 estão verbatim.
- Pequenos typos óbvios do original foram corrigidos (ex.: "infancia"→"infância",
  "precesso"→"processo"); a voz e o conteúdo foram mantidos.

## Privacidade (decisão: REMOVER por agora)

- Página `/politica-de-privacidade` e o respetivo link no footer **removidos**. O URL antigo
  redireciona para a home. Recriar quando houver texto definitivo (LGPD).

## Outras notas

- **Domínio**: `https://rsdegan.com` é placeholder. Atualizar em `astro.config.mjs` (`SITE`) e
  `src/data/site.ts` (`site.url`) quando o domínio final estiver definido (afeta canonical, OG, sitemap, JSON-LD).
- **Imagem OG**: gerada automaticamente de `bg.png` (`npm run og`), com fonte serif do sistema.
  Substituir por versão com Cormorant se quiseres fidelidade tipográfica total.
- **Hero `bg.png` tem 1024px de largura**: é ampliada para cobrir ecrãs grandes (como no protótipo).
  Um original de maior resolução melhoraria a nitidez em desktop (opcional).
- **ISBN/data do livro**: adicionar em `src/data/site.ts` (`book.isbn`) para enriquecer o JSON-LD `Book`.
- **Exposição de debug**: `window.__lenis` / `window.__ST` só existem em `import.meta.env.DEV`.

## Validação já feita

- Build de produção OK. Um único `<h1>`, hierarquia `h2`, JSON-LD Person+Book, sitemap, OG, canonical.
- Pipeline de imagem: `bg.png` 2.4MB → AVIF 13–39KB / WebP 28–95KB / JPG 45–169KB (3 larguras).
- 27 ScrollTriggers criados (hero, 20 reveals, silhuetas, nav, progresso); percurso do hero,
  nav.stuck e fio de progresso confirmados a funcionar.
- Fontes self-hosted (sem Google Fonts CDN).

## Por validar em ambiente visível (o painel de browser estava oculto → rAF congelado)

- Animação visual dos reveals e da neve (a lógica está confirmada; falta ver a correr).
- Lighthouse (alvo 95+ Perf/A11y/SEO), teste em mobile real, teste com `prefers-reduced-motion`.
