/* ============================================================
   snow.ts — névoa fria + neve (canvas 2D) — versão otimizada
   Módulo isolado e reutilizável.

   Otimizações vs. protótipo (eliminam travamento):
   - Sprites pré-renderizados (drawImage) em vez de createRadialGradient
     a cada frame. As bordas suaves do sprite substituem o `filter: blur()`
     dos canvases — que era re-rasterizado a cada frame (custo enorme).
   - DPR limitado a 1.5 (menos pixels a pintar).
   - Loop com delta-time e teto de ~36fps (a neve não precisa de 60fps),
     libertando GPU para o scroll.
   - Pausa fora do viewport do hero; menos partículas em mobile.
   - Respeita prefers-reduced-motion (não inicia).
   ============================================================ */

interface Puff {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  ph: number;
}

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  sw: number;
  ph: number;
  a: number;
}

interface Layer {
  x: CanvasRenderingContext2D;
  f: Flake[];
}

export interface SnowHandles {
  setVisible(visible: boolean): void;
  destroy(): void;
}

interface SnowRefs {
  mist: string;
  snowFar: string;
  snowMid: string;
  snowNear: string;
}

const DEFAULT_REFS: SnowRefs = {
  mist: 'mist',
  snowFar: 'snowFar',
  snowMid: 'snowMid',
  snowNear: 'snowNear',
};

/** Sprite radial reutilizável (branco → transparente). */
function makeSprite(size: number, stops: [number, string][]): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

export function initSnow(refs: Partial<SnowRefs> = {}): SnowHandles | null {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const ids = { ...DEFAULT_REFS, ...refs };
  const get = (id: string) => document.getElementById(id) as HTMLCanvasElement | null;

  const els = [get(ids.mist), get(ids.snowFar), get(ids.snowMid), get(ids.snowNear)];
  if (els.some((e) => !e)) return null;

  const canvases: { c: HTMLCanvasElement; x: CanvasRenderingContext2D }[] = [];
  for (const el of els) {
    const ctx = el!.getContext('2d');
    if (!ctx) return null;
    canvases.push({ c: el!, x: ctx });
  }

  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  const mob = innerWidth < 760;

  // Sprites (uma vez): neve branca suave + névoa azul-fria.
  const flakeSprite = makeSprite(64, [
    [0, 'rgba(230,241,255,1)'],
    [0.45, 'rgba(230,241,255,0.75)'],
    [1, 'rgba(230,241,255,0)'],
  ]);
  const mistSprite = makeSprite(256, [
    [0, 'rgba(176,200,226,1)'],
    [0.5, 'rgba(120,150,186,0.32)'],
    [1, 'rgba(120,150,186,0)'],
  ]);

  // Guarda contra realocações redundantes: mudar canvas.width/height reafeta
  // os buffers (custo alto). Só refaz quando a dimensão real muda — evita a
  // tempestade de realocações quando a barra de URL do mobile aparece/some
  // ou quando a altura do documento oscila (uma das causas do travamento).
  let lastW = 0;
  let lastH = 0;
  function fitAll() {
    const w = Math.round(innerWidth * DPR);
    const h = Math.round(innerHeight * DPR);
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    for (const { c, x } of canvases) {
      c.width = w;
      c.height = h;
      x.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
  }
  fitAll();
  const ro = new ResizeObserver(fitAll);
  ro.observe(document.documentElement);

  const mx = canvases[0].x;
  const puffs: Puff[] = Array.from({ length: mob ? 10 : 16 }, () => ({
    x: Math.random() * innerWidth,
    y: innerHeight * 0.45 + Math.random() * innerHeight * 0.55,
    r: 180 + Math.random() * 300,
    vx: (Math.random() - 0.5) * 0.1,
    vy: -0.03 - Math.random() * 0.07,
    a: 0.03 + Math.random() * 0.03,
    ph: Math.random() * 6.28,
  }));

  function makeFlakes(n: number, dMin: number, dMax: number, aMul: number): Flake[] {
    return Array.from({ length: n }, () => {
      const d = dMin + Math.random() * (dMax - dMin);
      return {
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: 1.4 + d * 4.4, // sprites suaves: raio um pouco maior compensa a falta de blur
        vy: 0.18 + d * 1.15,
        sw: 0.3 + Math.random() * 1.2,
        ph: Math.random() * 6.28,
        a: (0.12 + d * 0.5) * aMul,
      };
    });
  }

  const layers: Layer[] = [
    { x: canvases[1].x, f: makeFlakes(mob ? 30 : 58, 0.05, 0.32, 1.1) },
    { x: canvases[2].x, f: makeFlakes(mob ? 20 : 38, 0.34, 0.66, 1.0) },
    { x: canvases[3].x, f: makeFlakes(mob ? 8 : 16, 0.7, 1.0, 0.9) },
  ];

  let raf = 0;
  let running = false;
  let t = 0;
  let last = 0;
  const interval = 1000 / 36; // teto ~36fps

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (last && now - last < interval) return;
    // dt relativo a 60fps para manter a mesma velocidade percebida
    const dt = last ? Math.min(2.5, (now - last) / (1000 / 60)) : 1;
    last = now;
    t += 0.005 * dt;

    // --- Névoa (sprite azul, aditivo) ---
    mx.clearRect(0, 0, innerWidth, innerHeight);
    mx.globalCompositeOperation = 'lighter';
    for (const p of puffs) {
      p.x += (p.vx + Math.sin(t + p.ph) * 0.14) * dt;
      p.y += p.vy * dt;
      if (p.y + p.r < 0) {
        p.y = innerHeight + p.r;
        p.x = Math.random() * innerWidth;
      }
      mx.globalAlpha = p.a * (0.55 + Math.sin(t * 1.25 + p.ph) * 0.45);
      mx.drawImage(mistSprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    mx.globalAlpha = 1;
    mx.globalCompositeOperation = 'source-over';

    // --- Neve (3 camadas, sprite branco suave) ---
    for (const { x, f } of layers) {
      x.clearRect(0, 0, innerWidth, innerHeight);
      for (const k of f) {
        k.y += k.vy * dt;
        k.x += Math.sin(t * 2.2 + k.ph) * k.sw * 0.5 * dt;
        if (k.y > innerHeight + 6) {
          k.y = -6;
          k.x = Math.random() * innerWidth;
        }
        x.globalAlpha = k.a;
        x.drawImage(flakeSprite, k.x - k.r, k.y - k.r, k.r * 2, k.r * 2);
      }
      x.globalAlpha = 1;
    }
  }
  // Inicia/para o loop por completo conforme a visibilidade — em vez de manter
  // um rAF vazio a acordar a thread 60×/s enquanto se lê o resto da página
  // (a neve só existe no herói). Menos contenção durante o scroll longo.
  function start() {
    if (running) return;
    running = true;
    last = 0; // reinicia o delta ao voltar a ficar visível
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  start();
  addEventListener('resize', fitAll);

  return {
    setVisible(v: boolean) {
      if (v) start();
      else stop();
    },
    destroy() {
      stop();
      removeEventListener('resize', fitAll);
      ro.disconnect();
    },
  };
}
