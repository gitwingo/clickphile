// Clickphile background worker.
// Pages are only touched when you ask: the keyboard script is injected on demand (activeTab),
// not loaded into every site you visit.
importScripts('settings.js');

const MENU_ID = 'clickphile-open';

function setMenuVisible(visible) {
  chrome.contextMenus.update(MENU_ID, { visible }, () => void chrome.runtime.lastError);
}

chrome.runtime.onInstalled.addListener(async () => {
  const s = await ClickphileSettings.get();
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'Type with mouse (Clickphile)',
      contexts: ['editable'],
      visible: s.contextMenu,
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) {
    const next = Object.assign({}, ClickphileSettings.DEFAULTS, changes.settings.newValue || {});
    setMenuVisible(next.contextMenu);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || tab?.id == null) return;
  const frameId = info.frameId ?? 0;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [frameId] },
      files: ['keyboard.js', 'content.js'],
    });
    await chrome.tabs.sendMessage(tab.id, { type: 'clickphile-open' }, { frameId });
  } catch (_) { /* restricted page (brave://, web store): nothing to do */ }
});
