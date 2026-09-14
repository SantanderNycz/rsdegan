/* ============================================================
   map.ts — mapa de Elarion: pré-visualização + modal com pan/zoom.
   Ilha isolada. Ativa-se apenas quando existe imagem do mapa.

   - A pré-visualização inline é estática (sem zoom direto).
   - "Ver mapa ampliado" ou clicar na pré-visualização abre um <dialog>
     com arrastar (pointer/touch), roda do rato, botões +/−, duplo-clique,
     pinça e teclado (setas/±/0). Fecha por botão, backdrop ou Esc (nativo).
   ============================================================ */

interface Pt {
  x: number;
  y: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export function initMap(): void {
  const modal = document.querySelector<HTMLDialogElement>('[data-map-modal]');
  const viewport = document.querySelector<HTMLElement>('[data-map-viewport]');
  const canvas = document.querySelector<HTMLElement>('[data-map-canvas]');
  const openBtn = document.getElementById('mapBtn');
  const preview = document.querySelector<HTMLElement>('[data-map-open]');

  // Sem mapa interativo (placeholder): o botão do texto não deve saltar ao topo.
  if (!modal || !viewport || !canvas) {
    openBtn?.addEventListener('click', (e) => e.preventDefault());
    return;
  }

  const zoomIn = modal.querySelector<HTMLButtonElement>('[data-map-zoom-in]');
  const zoomOut = modal.querySelector<HTMLButtonElement>('[data-map-zoom-out]');
  const reset = modal.querySelector<HTMLButtonElement>('[data-map-reset]');
  const closeBtn = modal.querySelector<HTMLButtonElement>('[data-map-close]');

  let scale = 1;
  let tx = 0;
  let ty = 0;

  const pointers = new Map<number, Pt>();
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let dragging = false;
  let last: Pt = { x: 0, y: 0 };

  function clamp() {
    const rect = viewport!.getBoundingClientRect();
    const maxX = ((scale - 1) * rect.width) / 2;
    const maxY = ((scale - 1) * rect.height) / 2;
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  }

  function apply() {
    clamp();
    canvas!.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    viewport!.setAttribute('aria-label', `Mapa de Elarion, ampliação ${scale.toFixed(1)}×`);
    viewport!.classList.toggle('is-zoomed', scale > 1);
  }

  function resetView() {
    scale = 1;
    tx = 0;
    ty = 0;
    apply();
  }

  function zoomTo(next: number, originX = 0.5, originY = 0.5) {
    const rect = viewport!.getBoundingClientRect();
    const prev = scale;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    // Manter o ponto sob o cursor estável ao ampliar.
    const cx = (originX - 0.5) * rect.width;
    const cy = (originY - 0.5) * rect.height;
    const ratio = scale / prev;
    tx = cx - (cx - tx) * ratio;
    ty = cy - (cy - ty) * ratio;
    apply();
  }

  /* ---------- Roda do rato ---------- */
  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const ox = (e.clientX - rect.left) / rect.width;
      const oy = (e.clientY - rect.top) / rect.height;
      zoomTo(scale * (e.deltaY < 0 ? 1.12 : 0.89), ox, oy);
    },
    { passive: false }
  );

  /* ---------- Duplo-clique ---------- */
  viewport.addEventListener('dblclick', (e) => {
    const rect = viewport.getBoundingClientRect();
    const ox = (e.clientX - rect.left) / rect.width;
    const oy = (e.clientY - rect.top) / rect.height;
    zoomTo(scale > 1 ? 1 : 2.4, ox, oy);
  });

  /* ---------- Pointer (arrastar + pinça) ---------- */
  viewport.addEventListener('pointerdown', (e) => {
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartScale = scale;
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStartDist > 0) zoomTo((dist / pinchStartDist) * pinchStartScale);
      return;
    }
    if (dragging && scale > 1) {
      tx += e.clientX - last.x;
      ty += e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      apply();
    }
  });

  const endPointer = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStartDist = 0;
    if (pointers.size === 0) dragging = false;
  };
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  /* ---------- Teclado (a11y) — Esc fica com o <dialog> nativo ---------- */
  viewport.addEventListener('keydown', (e) => {
    const step = 40;
    switch (e.key) {
      case '+':
      case '=':
        zoomTo(scale * 1.2);
        break;
      case '-':
      case '_':
        zoomTo(scale / 1.2);
        break;
      case '0':
        resetView();
        break;
      case 'ArrowLeft':
        tx += step;
        apply();
        break;
      case 'ArrowRight':
        tx -= step;
        apply();
        break;
      case 'ArrowUp':
        ty += step;
        apply();
        break;
      case 'ArrowDown':
        ty -= step;
        apply();
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  /* ---------- Botões de zoom ---------- */
  zoomIn?.addEventListener('click', () => zoomTo(scale * 1.3));
  zoomOut?.addEventListener('click', () => zoomTo(scale / 1.3));
  reset?.addEventListener('click', resetView);

  /* ---------- Abrir / fechar o modal ---------- */
  function openModal() {
    if (!modal!.open) modal!.showModal();
    resetView(); // começa sempre sem zoom; rect já é válido com o modal aberto
    viewport!.focus();
  }
  const closeModal = () => modal!.close();

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
  preview?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  // Clique no backdrop (fora do cartão interno) fecha.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  addEventListener('resize', () => {
    if (modal.open) apply();
  });
}
