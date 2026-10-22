// Clickphile on-screen keyboard. Used on web pages (injected on demand) and on the new tab page.
// window.ClickphileKeyboard({ getTarget, theme, onClose }) -> { open, close, toggle, isOpen }
(function () {
  'use strict';
  if (window.ClickphileKeyboard) return;

  const LAYERS = {
    abc: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '@@bksp'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@@enter'],
      ['@@shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '-', '.'],
      ['@@sym', '@@left', '@@space', '@@right', '/', '@@com'],
    ],
    sym: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '@@bksp'],
      ['@', '#', '$', '%', '&', '*', '(', ')', '!', '?'],
      ['_', '=', '+', ':', ';', '"', "'", '\\', '|', '@@enter'],
      ['[', ']', '{', '}', '<', '>', '~', '`', '^', ','],
      ['@@abc', '@@left', '@@space', '@@right', '/', '@@com'],
    ],
  };

  const SPECIAL = {
    bksp: { label: '⌫', flex: 1.6, repeat: true },
    enter: { label: '⏎', flex: 1.6, accent: true },
    shift: { label: '⇧', flex: 1.6 },
    sym: { label: '?123', flex: 1.6 },
    abc: { label: 'ABC', flex: 1.6 },
    left: { label: '←', repeat: true },
    right: { label: '→', repeat: true },
    space: { label: 'space', flex: 5, plain: true },
    com: { label: '.com', flex: 1.4 },
  };

  const MIN_W = 340, MAX_W = 1000;

  const DARK_VARS = `--bg: rgba(18,22,36,.68); --key: rgba(255,255,255,.1); --keyh: rgba(255,255,255,.2);
    --fn: rgba(255,255,255,.05); --fg: #f4f6ff; --bd: rgba(255,255,255,.14); --sh: 0 24px 60px rgba(0,0,0,.5);`;

  const CSS = `
    :host { all: initial; }
    .kb {
      --u: calc(var(--w) / 100);
      --bg: rgba(255,255,255,.74); --key: rgba(255,255,255,.95); --keyh: #ffffff;
      --fn: rgba(0,0,0,.06); --fg: #111827; --bd: rgba(0,0,0,.1); --accent: #4f7cff;
      --sh: 0 24px 60px rgba(15,23,42,.3);
      position: fixed; left: 0; top: 0; width: var(--w); box-sizing: border-box;
      padding: calc(var(--u) * 1.3); border-radius: calc(var(--u) * (var(--rk, 1.5) + 1.1));
      background: var(--bg); color: var(--fg);
      -webkit-backdrop-filter: blur(var(--blur, 22px)) saturate(1.5); backdrop-filter: blur(var(--blur, 22px)) saturate(1.5);
      border: 1px solid var(--bd); box-shadow: var(--sh), inset 0 1px 0 rgba(255,255,255,.12);
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483647; user-select: none; -webkit-user-select: none;
      animation: pop .16s ease-out;
    }
    @keyframes pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
    .kb.dark { ${DARK_VARS} }
    .bar { display: flex; align-items: center; justify-content: space-between; cursor: grab; touch-action: none;
           padding: 0 calc(var(--u) * .6) calc(var(--u) * .9); font-size: max(10px, calc(var(--u) * 1.65));
           font-weight: 600; letter-spacing: .02em; opacity: .8; }
    .bar:active { cursor: grabbing; }
    .brand { display: flex; align-items: center; gap: .5em; }
    .dot { width: .7em; height: .7em; border-radius: 50%; background: linear-gradient(135deg, #4f7cff, #a46bff); }
    .row { display: flex; gap: calc(var(--u) * 0.9); margin-bottom: calc(var(--u) * 0.9); }
    .row:last-child { margin-bottom: 0; }
    button {
      all: unset; box-sizing: border-box; flex: 1 1 0; min-width: 0;
      height: max(26px, calc(var(--u) * 6.3)); display: flex; align-items: center; justify-content: center;
      border-radius: calc(var(--u) * var(--rk, 1.5)); background: var(--key); border: 1px solid var(--bd); cursor: pointer;
      font-size: max(11px, calc(var(--u) * 2.4)); font-weight: 500;
      transition: background .08s, transform .05s;
    }
    button:hover { background: var(--keyh); }
    button:active { transform: scale(.95); background: var(--accent); color: #fff; }
    button.fn { background: var(--fn); }
    button.fn:hover { background: var(--keyh); }
    button.go { background: var(--accent); color: #fff; border-color: transparent; }
    button.go:hover { filter: brightness(1.1); }
    button.on { background: var(--accent); color: #fff; border-color: transparent; }
    .bar button { flex: none; width: calc(var(--u) * 3.6); height: calc(var(--u) * 3.6); min-width: 22px; min-height: 22px;
                  background: transparent; border: 0; font-size: max(11px, calc(var(--u) * 1.9)); border-radius: 50%; }
    .bar button:hover { background: var(--fn); }
    .grip { position: absolute; right: calc(var(--u) * .5); bottom: calc(var(--u) * .5); width: calc(var(--u) * 3);
            height: calc(var(--u) * 3); min-width: 16px; min-height: 16px; cursor: nwse-resize; opacity: .45; touch-action: none;
            background: linear-gradient(135deg, transparent 0 46%, currentColor 46% 53%, transparent 53% 66%,
                        currentColor 66% 73%, transparent 73% 86%, currentColor 86% 93%, transparent 93%);
            border-bottom-right-radius: calc(var(--u) * 2); }
    .grip:hover { opacity: .9; }
  `;

  function isTextInput(el) {
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  }
  function ensureFocus(el) {
    if (el.ownerDocument.activeElement !== el) el.focus();
  }

  function insertText(el, text) {
    const doc = el.ownerDocument;
    ensureFocus(el);
    if (doc.execCommand('insertText', false, text)) return;
    if (!isTextInput(el)) return;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    const s = el.selectionStart ?? el.value.length;
    const e = el.selectionEnd ?? s;
    setter.call(el, el.value.slice(0, s) + text + el.value.slice(e));
    try { el.setSelectionRange(s + text.length, s + text.length); } catch (_) {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function backspace(el) {
    ensureFocus(el);
    el.ownerDocument.execCommand('delete');
  }

  function moveCaret(el, dir) {
    ensureFocus(el);
    if (isTextInput(el)) {
      try {
        const s = el.selectionStart, e = el.selectionEnd;
        let p = s !== e ? (dir < 0 ? s : e) : s + dir;
        p = Math.max(0, Math.min(el.value.length, p));
        el.setSelectionRange(p, p);
      } catch (_) {}
    } else {
      const sel = el.ownerDocument.defaultView.getSelection();
      if (sel && sel.modify) sel.modify('move', dir < 0 ? 'backward' : 'forward', 'character');
    }
  }

  function pressEnter(el) {
    ensureFocus(el);
    const init = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, composed: true };
    const fire = (type) => el.dispatchEvent(new KeyboardEvent(type, init));
    // If the site handles Enter itself (chat boxes, search suggest), let it.
    if (!fire('keydown')) { fire('keyup'); return; }
    if (!fire('keypress')) { fire('keyup'); return; }
    fire('keyup');

    const singleLine = el instanceof HTMLInputElement || (el instanceof HTMLTextAreaElement && el.rows <= 1);
    if (singleLine) {
      if (el.form) el.form.requestSubmit();
      return;
    }
    if (el instanceof HTMLTextAreaElement) insertText(el, '\n');
    else el.ownerDocument.execCommand('insertParagraph');
  }

  // Saved size/position, shared across every site.
  const LOOK_DEFAULTS = { kbTheme: 'auto', kbAccent: '#4f7cff', kbOpacity: 0.74, kbBlur: 22, kbRound: 1.5 };
  const store = {
    load() {
      try {
        return chrome.storage.local.get(['kbLayout', 'settings']).then(
          (r) => ({ layout: r.kbLayout || null, look: Object.assign({}, LOOK_DEFAULTS, r.settings || {}) }),
          () => ({ layout: null, look: LOOK_DEFAULTS }));
      } catch (_) { return Promise.resolve({ layout: null, look: LOOK_DEFAULTS }); }
    },
    save(v) { try { chrome.storage.local.set({ kbLayout: v }); } catch (_) {} },
  };

  // Turns the look settings into CSS variables on an element. Shared with the popup preview.
  function applyLook(el, s, fallbackTheme) {
    let theme = s.kbTheme;
    if (theme !== 'dark' && theme !== 'light') {
      theme = fallbackTheme || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    el.classList.toggle('dark', theme === 'dark');
    const a = Math.min(1, Math.max(0.25, Number(s.kbOpacity) || 0.74));
    el.style.setProperty('--bg', theme === 'dark' ? `rgba(18,22,36,${a})` : `rgba(255,255,255,${a})`);
    if (/^#[0-9a-f]{6}$/i.test(s.kbAccent)) el.style.setProperty('--accent', s.kbAccent);
    el.style.setProperty('--blur', Math.min(40, Math.max(0, Number(s.kbBlur) || 0)) + 'px');
    const r = Number(s.kbRound);
    el.style.setProperty('--rk', String(Number.isFinite(r) ? Math.min(3, Math.max(0, r)) : 1.5));
  }

  window.ClickphileKeyboardLook = applyLook;

  window.ClickphileKeyboard = function (opts) {
    const getTarget = opts.getTarget;
    const onClose = opts.onClose || (() => {});

    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = CSS;

    const kb = document.createElement('div');
    kb.className = 'kb';
    const bar = document.createElement('div');
    bar.className = 'bar';
    const brand = document.createElement('span');
    brand.className = 'brand';
    const dot = document.createElement('i');
    dot.className = 'dot';
    brand.append(dot, document.createTextNode('Clickphile'));
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close';
    bar.append(brand, closeBtn);
    const rows = document.createElement('div');
    const grip = document.createElement('div');
    grip.className = 'grip';
    grip.title = 'Drag to resize';
    kb.append(bar, rows, grip);
    root.append(style, kb);

    let layer = 'abc';
    let shift = false;
    let width = 0, left = 0, top = 0;
    let saved = null;
    let look = LOOK_DEFAULTS;
    const ready = store.load().then((v) => { saved = v.layout; look = v.look; applyLook(kb, look, opts.theme); });
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.settings) {
          look = Object.assign({}, LOOK_DEFAULTS, changes.settings.newValue || {});
          applyLook(kb, look, opts.theme);
          if (host.isConnected) clampPos();
        }
      });
    } catch (_) {}

    function render() {
      rows.textContent = '';
      for (const row of LAYERS[layer]) {
        const r = document.createElement('div');
        r.className = 'row';
        for (const k of row) {
          const sp = k.startsWith('@@') ? SPECIAL[k.slice(2)] : null;
          const b = document.createElement('button');
          b.dataset.key = k;
          b.textContent = sp ? sp.label : shift ? k.toUpperCase() : k;
          b.style.flexGrow = String(sp && sp.flex ? sp.flex : 1);
          if (sp && !sp.plain) b.classList.add('fn');
          if (sp && sp.accent) b.classList.add('go');
          if (k === '@@shift' && shift) b.classList.add('on');
          r.append(b);
        }
        rows.append(r);
      }
    }

    function clampPos() {
      const h = kb.offsetHeight;
      left = Math.max(4, Math.min(window.innerWidth - width - 4, left));
      top = Math.max(4, Math.min(window.innerHeight - h - 4, top));
      kb.style.left = left + 'px';
      kb.style.top = top + 'px';
    }
    function setWidth(w) {
      width = Math.max(MIN_W, Math.min(MAX_W, window.innerWidth - 8, Math.round(w)));
      kb.style.setProperty('--w', width + 'px');
    }
    function persist() {
      store.save({ w: width, fx: left / window.innerWidth, fy: top / window.innerHeight });
    }
    function place() {
      // Default size scales with window height so it never swamps a short window.
      const dflt = Math.max(380, Math.min(620, window.innerHeight * 0.72, window.innerWidth * 0.94));
      setWidth(saved && saved.w ? saved.w : dflt);
      if (saved && typeof saved.fx === 'number') {
        left = saved.fx * window.innerWidth;
        top = saved.fy * window.innerHeight;
      } else {
        left = (window.innerWidth - width) / 2;
        top = window.innerHeight - kb.offsetHeight - 16;
      }
      clampPos();
    }

    function press(k) {
      const el = getTarget();
      if (!el || !el.isConnected) return;
      if (k.startsWith('@@')) {
        switch (k.slice(2)) {
          case 'bksp': return backspace(el);
          case 'enter': return pressEnter(el);
          case 'space': return insertText(el, ' ');
          case 'left': return moveCaret(el, -1);
          case 'right': return moveCaret(el, 1);
          case 'com': return insertText(el, '.com');
          case 'shift': shift = !shift; return render();
          case 'sym': layer = 'sym'; shift = false; return render();
          case 'abc': layer = 'abc'; return render();
        }
        return;
      }
      insertText(el, shift ? k.toUpperCase() : k);
      if (shift) { shift = false; render(); }
    }

    // Press on mousedown (snappier) and keep focus in the page's text box.
    let delay = null, repeat = null;
    const stopRepeat = () => { clearTimeout(delay); clearInterval(repeat); delay = repeat = null; };

    rows.addEventListener('mousedown', (ev) => {
      const b = ev.target.closest && ev.target.closest('button');
      if (!b) return;
      ev.preventDefault();
      if (ev.button !== 0) return;
      const k = b.dataset.key;
      press(k);
      const sp = k.startsWith('@@') ? SPECIAL[k.slice(2)] : null;
      if (sp && sp.repeat) {
        delay = setTimeout(() => { repeat = setInterval(() => press(k), 60); }, 400);
        window.addEventListener('mouseup', stopRepeat, { once: true });
      }
    });

    // Drag by the title bar (pointer capture keeps the drag alive over iframes).
    let drag = null;
    bar.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      if (ev.target.closest && ev.target.closest('button')) return;
      bar.setPointerCapture(ev.pointerId);
      drag = { dx: ev.clientX - left, dy: ev.clientY - top };
    });
    bar.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      left = ev.clientX - drag.dx;
      top = ev.clientY - drag.dy;
      clampPos();
    });
    const endDrag = () => { if (drag) { drag = null; persist(); } };
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);

    // Resize by the corner grip.
    let rs = null;
    grip.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      grip.setPointerCapture(ev.pointerId);
      rs = { x: ev.clientX, y: ev.clientY, w: width, h: kb.offsetHeight };
    });
    grip.addEventListener('pointermove', (ev) => {
      if (!rs) return;
      const dx = ev.clientX - rs.x, dy = ev.clientY - rs.y;
      setWidth(rs.w + (dx + dy * (rs.w / rs.h)) / 2);
      clampPos();
    });
    const endResize = () => { if (rs) { rs = null; persist(); } };
    grip.addEventListener('pointerup', endResize);
    grip.addEventListener('pointercancel', endResize);

    closeBtn.addEventListener('click', () => api.close());
    window.addEventListener('resize', () => { if (host.isConnected) { setWidth(width); clampPos(); } });

    render();

    const api = {
      isOpen: () => host.isConnected,
      open() {
        return ready.then(() => {
          if (!host.isConnected) { document.documentElement.append(host); place(); }
        });
      },
      close() {
        if (host.isConnected) { host.remove(); onClose(); }
      },
      toggle() { return host.isConnected ? api.close() : api.open(); },
    };
    return api;
  };
})();
