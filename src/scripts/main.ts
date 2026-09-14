/* ============================================================
   main.ts — ponto de entrada do cliente.
   Orquestra neve, hero, movimento global e interações de UI.
   ============================================================ */
import { initSnow } from './snow';
import { initHero } from './hero';
import { initMotion } from './motion';
import { initMenu, initToast, initContactForm } from './ui';
import { initMap } from './map';

export function boot(): void {
  const run = () => {
    // Neve devolve null sob prefers-reduced-motion.
    const snow = initSnow();
    initHero({ snow });
    initMotion();
    initMenu();
    initToast();
    initContactForm();
    initMap();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
