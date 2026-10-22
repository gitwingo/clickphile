// Shared settings, stored locally in the browser. Nothing leaves your machine.
(function (g) {
  'use strict';
  const DEFAULTS = {
    contextMenu: true,   // "Type with mouse" in the right-click menu
    kbOnNewTab: true,    // on-screen keyboard on the new tab page
    scenic: true,        // scenic background on the new tab page
    showTiles: true,     // shortcut tiles on the new tab page
    tileSource: 'top',   // 'top' | 'bookmarks'
    // keyboard look
    kbTheme: 'auto',     // 'auto' | 'dark' | 'light'
    kbAccent: '#4f7cff', // highlight colour (Enter key, pressed key, shift)
    kbOpacity: 0.74,     // panel opacity, 0.25 - 1
    kbBlur: 22,          // backdrop blur in px, 0 - 40
    kbRound: 1.5,        // corner roundness, 0 - 3
  };
  async function get() {
    try {
      const r = await chrome.storage.local.get('settings');
      return Object.assign({}, DEFAULTS, r.settings || {});
    } catch (_) { return Object.assign({}, DEFAULTS); }
  }
  // Writes are queued so rapid changes (sliders, quick clicks) never overwrite each other.
  let queue = Promise.resolve();
  function set(patch) {
    queue = queue.then(async () => {
      const next = Object.assign(await get(), patch);
      try { await chrome.storage.local.set({ settings: next }); } catch (_) {}
      return next;
    });
    return queue;
  }
  g.ClickphileSettings = { DEFAULTS, get, set };
})(globalThis);
