# Clickphile Privacy Policy

_Last updated: 22 October 2026_

Clickphile does not collect, store on any server, sell, or share your personal data. It has no accounts, no analytics, no ads, and makes no network requests of its own.

## What stays on your device
- **Settings and keyboard layout** (theme, colours, size, position, toggles) are saved with the browser's local extension storage (`chrome.storage.local`). They never leave your browser.
- **New tab page data.** To show shortcut tiles, the extension reads your most-visited sites (`topSites`) or your bookmarks (`bookmarks`) and the matching site icons from the browser's own icon cache (`favicon`). This data is displayed on the page and is never stored by or sent anywhere by Clickphile.
- **What you type.** The on-screen keyboard inserts the characters you click into the text box you chose. It does not record, log, or transmit them. It runs on a page only after you ask for it (right-click menu or toolbar button).
- **Searches.** When you search from the new tab page, the query is handed to your browser's default search engine through the browser's `search` API, exactly as if you had typed it in the address bar. Clickphile does not see or keep it.

## Permissions
| Permission | Why |
|---|---|
| `activeTab`, `scripting` | Show the keyboard on the current page, only when you ask. |
| `contextMenus` | The "Type with mouse" right-click entry. |
| `search` | Run new tab searches with your default search engine. |
| `storage` | Save your settings locally. |
| `topSites`, `bookmarks`, `favicon` | Show shortcut tiles on the new tab page. |

## Remote code
Clickphile does not load or run remote code.

## Contact
Questions or concerns: open an issue at https://github.com/gitwingo/clickphile/issues
