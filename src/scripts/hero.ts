/* ============================================================
   hero.ts — percurso do hero (GSAP + ScrollTrigger + SplitText)
   Substitui o requestAnimationFrame/WAAPI manual do protótipo.

   - Nome revelado letra-a-letra (SplitText) após as fontes carregarem.
   - Percurso ligado ao scroll (scrub) sobre o hero sticky de 158vh:
     parallax da imagem, dissolução do conteúdo aos ~62%, cue a esbater.
   - prefers-reduced-motion: sem percurso, hero estático e legível.
   ============================================================ */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import type { SnowHandles } from './snow';

gsap.registerPlugin(ScrollTrigger, SplitText);

const AR = 1024 / 1536; // proporção da imagem de fundo (largura/altura)

interface HeroOptions {
  snow: SnowHandles | null;
}

export function initHero({ snow }: HeroOptions): void {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = document.getElementById('topo');
  const stage = document.querySelector<HTMLElement>('.stage');
  const img = document.getElementById('bgimg') as HTMLImageElement | null;
  const inner = document.getElementById('heroInner');
  const cue = document.getElementById('cue');
  const title = document.getElementById('title');
  if (!hero || !stage || !img || !inner) return;

  /* ---------- Dimensionar a imagem para cobrir (com margem de percurso) ---------- */
  let travel = 0;
  function layoutBg() {
    const vw = innerWidth;
    const vh = innerHeight;
    let w = vw;
    let h = w / AR;
    if (h < vh) {
      h = vh;
      w = h * AR;
    }
    img!.style.width = `${w}px`;
    img!.style.height = `${h}px`;
    img!.style.marginLeft = `${-w / 2}px`;
    travel = Math.max(0, h - vh);
  }
  layoutBg();
  addEventListener('resize', layoutBg);
  // Recalcula com o tamanho real assim que o layout existir (ex.: aba oculta no boot).
  new ResizeObserver(layoutBg).observe(document.documentElement);

  /* ---------- Movimento reduzido: hero estático ---------- */
  if (prefersReduced) {
    gsap.set([inner, cue], { clearProps: 'all' });
    if (cue) cue.style.opacity = '0.001'; // cue de scroll é decorativo
    return;
  }

  /* ---------- Reveal do nome (SplitText) ---------- */
  const revealTimeline = () => {
    let chars: Element[] = [];
    let split: SplitText | null = null;
    if (title) {
      split = new SplitText(title, { type: 'chars', charsClass: 'ltr' });
      chars = split.chars;
    }

    const tl = gsap.timeline({ delay: 0.35 });
    if (chars.length) {
      tl.from(chars, {
        opacity: 0,
        filter: 'blur(20px)',
        yPercent: 40,
        scale: 1.08,
        duration: 1.6,
        ease: 'expo.out',
        stagger: 0.06,
      });
    }
    tl.fromTo(
      '#rule',
      { width: 0 },
      { width: 130, duration: 1.4, ease: 'expo.out' },
      '-=0.6'
    )
      .from(
        '.eyebrow',
        { opacity: 0, y: 12, duration: 1.1, ease: 'expo.out' },
        '-=1.0'
      )
      .from(
        '.welcome',
        { opacity: 0, y: 12, duration: 1.1, ease: 'expo.out' },
        '-=0.85'
      )
      .from(
        '.hero-cta',
        { opacity: 0, y: 12, duration: 1.1, ease: 'expo.out' },
        '-=0.8'
      )
      .from(
        '#cue',
        { opacity: 0, y: 12, duration: 1.1, ease: 'expo.out' },
        '-=0.6'
      );
  };

  // Esperar as fontes para o SplitText medir corretamente (evita layout shift).
  if (document.fonts?.ready) {
    document.fonts.ready.then(revealTimeline);
  } else {
    revealTimeline();
  }

  /* ---------- Percurso ligado ao scroll ---------- */
  // quickSetters evitam recalcular estilo repetidamente durante o scrub.
  const setImgY = gsap.quickSetter(img, 'y', 'px');
  const setInnerOpacity = gsap.quickSetter(inner, 'opacity');
  const setInnerY = gsap.quickSetter(inner, 'y', 'px');
  const setInnerScale = gsap.quickSetter(inner, 'scale');
  const setCueOpacity = cue ? gsap.quickSetter(cue, 'opacity') : null;

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress; // 0 → 1 ao longo do hero
      setImgY(-p * travel);

      const q = Math.min(1, p / 0.62); // conteúdo dissolve-se aos 62%
      setInnerOpacity(1 - q);
      setInnerY(-q * 60);
      setInnerScale(1 - q * 0.04);

      if (setCueOpacity) setCueOpacity(Math.max(0, 1 - p * 3));
    },
    onToggle: (self) => {
      // Pausa a neve/névoa quando o hero sai do viewport.
      snow?.setVisible(self.isActive);
    },
  });

  // Estado inicial da neve alinhado com a visibilidade do hero.
  snow?.setVisible(true);
}
