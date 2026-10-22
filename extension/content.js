// Injected on demand. Finds the text box you are using and shows the keyboard for it.
(() => {
  if (window.__clickphileLoaded) return;
  window.__clickphileLoaded = true;

  const TEXT_TYPES = new Set(['text', 'search', 'url', 'email', 'tel', 'password', 'number', '']);

  function editableFrom(node) {
    let el = node instanceof Element ? node : node && node.parentElement;
    while (el) {
      if (el instanceof HTMLTextAreaElement) return el;
      if (el instanceof HTMLInputElement && TEXT_TYPES.has((el.getAttribute('type') || '').toLowerCase())) return el;
      if (el.isContentEditable) {
        while (el.parentElement && el.parentElement.isContentEditable) el = el.parentElement;
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function deepActive() {
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    return a;
  }

  let current = null;
  let keyboard = null;
  let isOpen = false;

  function ensureKeyboard() {
    if (!keyboard) {
      keyboard = window.ClickphileKeyboard({
        getTarget: () => current,
        onClose: () => { isOpen = false; },
      });
    }
    return keyboard;
  }

  function openFor(el) {
    current = el;
    el.focus();
    ensureKeyboard().open();
    isOpen = true;
  }

  // While the keyboard is open, clicking another text box simply re-targets it.
  document.addEventListener('focusin', (e) => {
    if (!isOpen) return;
    const t = editableFrom(e.composedPath()[0]);
    if (t) current = t;
  }, true);

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg) return;
    if (msg.type === 'clickphile-open') {
      const t = editableFrom(deepActive());
      if (t) openFor(t);
    } else if (msg.type === 'clickphile-toggle') {
      if (isOpen) { keyboard.close(); return; }
      const t = editableFrom(deepActive());
      if (t) openFor(t);
    }
  });
})();
