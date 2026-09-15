/* ============================================================
   ui.ts — interações independentes de movimento
   (menu mobile + aviso). Funcionam mesmo com movimento reduzido.
   ============================================================ */

export function initMenu(): void {
  const burger = document.getElementById('burger');
  const links = document.getElementById('links');
  if (!burger || !links) return;

  const setOpen = (open: boolean) => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? 'Fechar' : 'Menu';
  };

  burger.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName === 'A') setOpen(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) setOpen(false);
  });
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-cform]');
  if (!form) return;
  const note = form.querySelector<HTMLElement>('[data-cform-note]');
  const showNote = (msg: string) => {
    if (note) {
      note.textContent = msg;
      note.hidden = false;
    }
  };

  // Sem endpoint configurado: não submete para lado nenhum — avisa e remete p/ Instagram.
  if (!form.getAttribute('action')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showNote('O envio ainda não está ativo. Fale comigo no Instagram @cronicasdegan enquanto isso.');
    });
    return;
  }

  // Com endpoint (ex.: Formspree): envia via fetch para não sair da página.
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        showNote('Mensagem enviada. Obrigado, respondo assim que puder.');
      } else {
        showNote('Não foi possível enviar agora. Tente novamente ou fale pelo Instagram.');
      }
    } catch {
      showNote('Não foi possível enviar agora. Tente novamente ou fale pelo Instagram.');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

export function initToast(): void {
  const toast = document.getElementById('toast');
  const close = document.getElementById('toastX');
  if (!toast) return;

  const KEY = 'degan-toast-dismissed';
  if (sessionStorage.getItem(KEY)) return;

  const timer = setTimeout(() => toast.classList.add('on'), 6000);
  close?.addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.remove('on');
    sessionStorage.setItem(KEY, '1');
  });
}
