(async () => {
  const $ = (id) => document.getElementById(id);
  const q = $('q');
  const S = await ClickphileSettings.get();

  // ---------- background ----------
  const bg = $('bg');
  function paintScene() {
    if (!S.scenic) { bg.className = 'plain'; bg.style.backgroundImage = ''; return; }
    bg.className = '';
    bg.style.backgroundImage = 'url("' + ClickphileScenes.toDataUri(ClickphileScenes.generate().svg) + '")';
    bg.style.animation = 'none'; void bg.offsetWidth; bg.style.animation = '';
  }
  paintScene();
  $('newScene').addEventListener('click', () => {
    if (!S.scenic) return;
    paintScene();
  });
  if (!S.scenic) $('newScene').classList.add('off');

  // ---------- clock + greeting ----------
  function tick() {
    const d = new Date();
    $('clock').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
    $('date').textContent = d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const h = d.getHours();
    $('greet').textContent = h < 5 ? 'Still up?' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night';
  }
  tick();
  setInterval(tick, 10000);

  // ---------- smart search / address box ----------
  const URL_RE = /^(?:https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(?::\d+)?(?:[\/?#]\S*)?$/i;
  $('f').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = q.value.trim();
    if (!text) return;
    if (URL_RE.test(text)) {
      location.href = /^https?:\/\//i.test(text) ? text : 'https://' + text;
      return;
    }
    // Uses the browser's own default search engine.
    if (chrome.search && chrome.search.query) {
      chrome.search.query({ text, disposition: 'CURRENT_TAB' });
    } else {
      location.href = 'https://www.google.com/search?q=' + encodeURIComponent(text);
    }
  });
  q.focus();

  // ---------- shortcut tiles ----------
  const shortcuts = $('shortcuts');
  const tilesEl = $('tiles');

  function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return url; } }
  function favicon(url) {
    return chrome.runtime.getURL('/_favicon/') + '?pageUrl=' + encodeURIComponent(url) + '&size=32';
  }

  async function loadTiles(src) {
    try {
      if (src === 'bookmarks') {
        const tree = await chrome.bookmarks.getTree();
        const out = [];
        const walk = (nodes) => {
          for (const n of nodes) {
            if (n.url && /^https?:/i.test(n.url)) out.push({ title: n.title, url: n.url });
            else if (n.children) walk(n.children);
          }
        };
        // Bookmarks bar first, then the rest.
        const roots = tree[0] ? tree[0].children || [] : [];
        walk(roots);
        return out.slice(0, 10);
      }
      const top = await chrome.topSites.get();
      return top.filter((t) => /^https?:/i.test(t.url)).slice(0, 10);
    } catch (_) { return []; }
  }

  function renderTiles(items) {
    tilesEl.textContent = '';
    if (!items.length) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = S.tileSource === 'bookmarks' ? 'No bookmarks yet.' : 'Visit a few sites and they will show up here.';
      tilesEl.append(p);
      return;
    }
    for (const it of items) {
      const a = document.createElement('a');
      a.className = 'tile';
      a.href = it.url;
      const ico = document.createElement('div');
      ico.className = 'ico';
      const letter = (hostOf(it.url)[0] || '?').toUpperCase();
      const img = new Image();
      img.alt = '';
      img.onerror = () => { ico.textContent = letter; };
      img.src = favicon(it.url);
      ico.append(img);
      const lbl = document.createElement('div');
      lbl.className = 'lbl';
      lbl.textContent = it.title || hostOf(it.url);
      lbl.title = it.url;
      a.append(ico, lbl);
      tilesEl.append(a);
    }
  }

  function markChips() {
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.src === S.tileSource));
  }
  async function showSource(src) {
    S.tileSource = src;
    markChips();
    renderTiles(await loadTiles(src));
  }
  if (S.showTiles) {
    shortcuts.hidden = false;
    document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
      ClickphileSettings.set({ tileSource: c.dataset.src });
      showSource(c.dataset.src);
    }));
    showSource(S.tileSource);
  }

  // ---------- on-screen keyboard ----------
  const kbBtn = $('kbToggle');
  if (!S.kbOnNewTab) {
    kbBtn.hidden = true;
  } else {
    const kb = window.ClickphileKeyboard({
      getTarget: () => q,
      theme: 'dark',
      onClose: () => kbBtn.classList.add('off'),
    });
    kb.open();
    kbBtn.addEventListener('click', () => {
      kbBtn.classList.toggle('off', kb.isOpen());
      kb.toggle();
      q.focus();
    });
  }
})();
