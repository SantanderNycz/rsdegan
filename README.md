# R.S. Degan — site oficial

Site do autor R.S. Degan (obra *Os Dragões Brancos*). Reconstrução do WordPress/Elementor
para uma base estática, rápida e com identidade — a partir do protótipo `degan-v4.html`.

## Stack

- **Astro** (100% estático, `output: 'static'`) — deploy na **Vercel**.
- **GSAP + ScrollTrigger + SplitText** — percurso do hero e reveals de secção.
- **Lenis** — smooth scroll (sincronizado com o ticker do GSAP).
- **Canvas 2D** — névoa fria + neve em três camadas (`src/scripts/snow.ts`).
- **TypeScript** em toda a lógica de cliente.
- Fontes **self-hosted** via Fontsource (Cormorant Garamond + Inter) — sem CDN externo.
- Imagens via `astro:assets` → **AVIF/WebP** com fallback JPG, três larguras, `<picture>`.

## Scripts

```bash
npm install
npm run dev       # servidor de desenvolvimento (localhost:4321)
npm run build     # gera dist/ (corre o prebuild da imagem OG)
npm run preview   # pré-visualiza o build
npm run og        # regenera a imagem Open Graph a partir de src/assets/bg.png
```

## Estrutura

```
src/
  assets/            bg.png (fonte do hero) · silhouettes/
  components/        Nav · Hero · Silhouette · Excerpt · MapElarion · BuyCard · Footer · Toast · SeoHead
  content/blog/      Jornal de Elarion — 19 posts (Markdown) + 1 rascunho
  content.config.ts  schema da collection do blog
  data/site.ts       fonte única de conteúdo (PT-BR) + metadados SEO
  layouts/Base.astro layout raiz (fontes, estilos, <head>)
  pages/             index.astro · biografia.astro · blog/index.astro · blog/[...slug].astro
  scripts/           snow · hero · motion · map · ui · main (TypeScript)
  styles/global.css  tokens (paleta/tipografia) + primitivas partilhadas
scripts/generate-og.mjs   gera public/og/degan-og.jpg
```

## Acessibilidade / performance

- `prefers-reduced-motion`: sem percurso, sem neve, sem smooth scroll — conteúdo estático e legível.
- Neve pausa o `requestAnimationFrame` quando o hero sai do viewport; menos partículas em mobile.
- Sem JS, o conteúdo é totalmente visível (os estados de reveal só existem sob `.js-motion`).
- Um único `<h1>` (o nome); hierarquia `h2`; JSON-LD `Person` + `Book`; sitemap; Open Graph.

## Pendências (ver NOTES.md)

- Passagem real do livro para a secção de excerto (o placeholder inventado **não** foi usado).
- Arte do mapa de Elarion para ativar o pan/zoom (hoje é um placeholder marcado).
- Domínio final (atualizar `site` em `astro.config.mjs` e `src/data/site.ts`).
