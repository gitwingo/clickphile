# Clickphile

**Type with just your mouse.** Right-click any text box for an on-screen keyboard, and open every new tab to a calm page with a search box you can fill without touching your keyboard. Built for the lean-back, laptop-on-the-bed, wireless-mouse moments (and anyone who can't or would rather not use a physical keyboard).

Works in Chrome, Brave, Edge and other Chromium browsers. Fully offline: no tracking, no accounts, no network calls.

## Features
- **Right-click → "Type with mouse"** on any text box, search field, chat box or rich editor. Click another box and the keyboard follows.
- **Resizable, draggable keyboard** with letters, symbols, shift, cursor arrows, hold-to-repeat backspace, and a one-click `.com`.
- **Make it yours:** theme (auto / dark / light), accent colour, transparency, blur and corner roundness.
- **Smart new tab:** type a search or a web address and it does the right thing. Uses your browser's default search engine.
- **Shortcut tiles** from your top sites or bookmarks, over a fresh generated scenic background every tab.
- **Private by design:** the keyboard is injected only when you ask for it. See [PRIVACY.md](PRIVACY.md).

## Install
**From the store:**
<p align="center">
  <a href="https://chromewebstore.google.com/detail/clickphile/gnjgmkamojjbcpoipkggkbfpkhgpjffc">
    <img src="https://img.shields.io/badge/Chrome_Web_Store-Install_Now-1a73e8?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Install from Chrome Web Store">
  </a>
</p>

**From source (developer mode):**
1. Download or clone this repo.
2. Open `chrome://extensions` (or `brave://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and choose the `extension/` folder.
4. Reload any tabs that were already open.

## Permissions
| Permission | Why |
|---|---|
| `activeTab`, `scripting` | Show the keyboard on the current page, only when you ask. |
| `contextMenus` | The right-click entry. |
| `search` | New tab searches use your default search engine. |
| `storage` | Save settings locally. |
| `topSites`, `bookmarks`, `favicon` | Shortcut tiles on the new tab page. |

## Known limits
- Extensions cannot type into the browser's own address bar or into `chrome://` / `brave://` pages. That is why the new tab page has its own search box.
- Brave and Chrome show their own footer on the new tab page when an extension replaces it.

## Contributing
Issues and pull requests are welcome.

## License
[MIT](LICENSE) © Gitwingo
