(async () => {
  const $ = (id) => document.getElementById(id);
  let S = await ClickphileSettings.get();

  const toggles = ['contextMenu', 'kbOnNewTab', 'scenic', 'showTiles'];

  function paint() {
    for (const k of toggles) $(k).checked = !!S[k];
    document.querySelectorAll('#srcRow .seg button').forEach((b) => b.classList.toggle('on', b.dataset.src === S.tileSource));
    $('srcRow').classList.toggle('disabled', !S.showTiles);
  }
  paint();

  // ---------- keyboard look ----------
  const LOOK_KEYS = ['kbTheme', 'kbAccent', 'kbOpacity', 'kbBlur', 'kbRound'];
  function paintLook() {
    window.ClickphileKeyboardLook($('prev'), S);
    document.querySelectorAll('#themeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.theme === S.kbTheme));
    document.querySelectorAll('#swatches button').forEach((b) => b.classList.toggle('on', b.dataset.c.toLowerCase() === S.kbAccent.toLowerCase()));
    $('accent').value = S.kbAccent;
    $('kbOpacity').value = S.kbOpacity; $('oOpacity').textContent = Math.round(S.kbOpacity * 100) + '%';
    $('kbBlur').value = S.kbBlur;       $('oBlur').textContent = S.kbBlur;
    $('kbRound').value = S.kbRound;     $('oRound').textContent = Number(S.kbRound).toFixed(1);
  }
  paintLook();
  async function setLook(patch) { S = await ClickphileSettings.set(patch); paintLook(); }

  document.querySelectorAll('#themeSeg button').forEach((b) => b.addEventListener('click', () => setLook({ kbTheme: b.dataset.theme })));
  document.querySelectorAll('#swatches button').forEach((b) => b.addEventListener('click', () => setLook({ kbAccent: b.dataset.c })));
  $('accent').addEventListener('input', (e) => setLook({ kbAccent: e.target.value }));
  $('kbOpacity').addEventListener('input', (e) => setLook({ kbOpacity: Number(e.target.value) }));
  $('kbBlur').addEventListener('input', (e) => setLook({ kbBlur: Number(e.target.value) }));
  $('kbRound').addEventListener('input', (e) => setLook({ kbRound: Number(e.target.value) }));
  $('resetLook').addEventListener('click', () => {
    const d = {};
    for (const k of LOOK_KEYS) d[k] = ClickphileSettings.DEFAULTS[k];
    setLook(d);
  });

  for (const k of toggles) {
    $(k).addEventListener('change', async () => {
      S = await ClickphileSettings.set({ [k]: $(k).checked });
      paint();
    });
  }
  document.querySelectorAll('#srcRow .seg button').forEach((b) => b.addEventListener('click', async () => {
    S = await ClickphileSettings.set({ tileSource: b.dataset.src });
    paint();
  }));

  // Open the keyboard for whichever text box is focused on the current page.
  $('openHere').addEventListener('click', async () => {
    const hint = $('hint');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || tab.id == null) throw new Error('no tab');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ['keyboard.js', 'content.js'],
      });
      await chrome.tabs.sendMessage(tab.id, { type: 'clickphile-toggle' });
      window.close();
    } catch (_) {
      hint.hidden = false;
      hint.textContent = 'Click inside a text box on a normal web page first. Browser pages and the new tab page are off limits to extensions.';
    }
  });

  // Chrome-style extensions can't switch their own new tab override off, so link to the manager.
  $('manage').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id }).catch(() => {});
  });
})();
