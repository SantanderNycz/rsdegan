/* ============================================================
   motion.ts — Lenis (smooth scroll) + reveals/parallax (GSAP)
   Substitui o IntersectionObserver/scroll manual do protótipo.

   - Lenis sincronizado com o ticker do GSAP e o ScrollTrigger.
   - Reveals de secção (.rv) em lote, com stagger.
   - Nav ganha fundo (.stuck) aos 60% do viewport; fio de progresso.
   - Silhuetas: fade-in + parallax por secção.
   - prefers-reduced-motion: sem Lenis, sem scrub; conteúdo estático.
   ============================================================ */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initMotion(): void {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');
  const prog = document.getElementById('prog');
  // Sem hero (páginas internas): nav fica sempre com fundo.
  const hasHero = !!document.getElementById('topo');

  /* ---------- Movimento reduzido: sem scroll suave nem scrub ---------- */
  if (prefersReduced) {
    document.querySelectorAll('.silh').forEach((s) => s.classList.add('in'));
    if (nav && !hasHero) {
      nav.classList.add('stuck');
    } else if (nav) {
      const onScroll = () => nav.classList.toggle('stuck', scrollY > innerHeight * 0.6);
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    return;
  }

  // A partir daqui o JS controla o movimento: esconde os .rv até revelar.
  document.documentElement.classList.add('js-motion');

  /* ---------- Lenis ---------- */
  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  if (import.meta.env.DEV) {
    (window as unknown as { __lenis?: unknown; __ST?: unknown }).__lenis = lenis;
    (window as unknown as { __lenis?: unknown; __ST?: unknown }).__ST = ScrollTrigger;
  }

  // Âncoras do nav usam o scroll do Lenis.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0 });
    });
  });

  /* ---------- Reveals de secção ----------
     Por elemento (não batch): revela de forma fiável mesmo quando a página
     carrega já com o elemento no viewport (deep-link / refresh a meio).
     Stagger subtil por posição dentro do contentor. */
  const revealTargets = gsap.utils.toArray<HTMLElement>('.rv');
  revealTargets.forEach((el) => {
    const siblings = Array.from(el.parentElement?.querySelectorAll(':scope > .rv') ?? [el]);
    const idx = siblings.indexOf(el);
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      delay: (idx % 4) * 0.09,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });

  /* ---------- Nav.stuck aos 60% do viewport (só quando há hero) ---------- */
  if (nav && hasHero) {
    ScrollTrigger.create({
      start: () => innerHeight * 0.6,
      onEnter: () => nav.classList.add('stuck'),
      onLeaveBack: () => nav.classList.remove('stuck'),
    });
  } else if (nav) {
    nav.classList.add('stuck');
  }

  /* ---------- Fio de progresso ---------- */
  if (prog) {
    const setProg = gsap.quickSetter(prog, 'scaleX');
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setProg(self.progress),
    });
  }

  /* ---------- Silhuetas: só fade-in ----------
     As silhuetas agora são âncoras de borda/emenda que atravessam limites de
     secção (dragão na emenda; espada da direita a descer do mapa para "onde
     comprar"). O parallax por scrub deslocava-as e podia sobrepô-las ao mapa —
     ficam estáveis, apenas com o fade-in. */
  gsap.utils.toArray<HTMLElement>('.silh').forEach((s) => {
    const trigger = s.closest('section') ?? s;
    ScrollTrigger.create({
      trigger,
      start: 'top 85%',
      onEnter: () => s.classList.add('in'),
    });
  });

  // Recalcular quando as fontes/imagens mudarem a altura da página.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}
