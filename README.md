# Print-Gen

> Design once. Generate hundreds.

A lightweight, browser-based tool for batch-generating PDF pages from spreadsheets.
Lay out a single page, drop in an `.xlsx` or `.csv`, and export every row as its own
PDF page — with images, custom fonts, outlines, and per-cell text styling.

**No backend. No uploads. No build step. Everything runs in your browser.**

---

## Table of contents

- [Features](#features)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Going fully offline](#going-fully-offline)
- [Browser support](#browser-support)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Features

### Editor

- **Visual canvas** — drag, resize, and delete text fields and images directly on the page.
- **Inline text editing** — double-click a static text box and type straight into it.
  `Esc` or click away to exit. Empty boxes are auto-removed.
- **Field binding** — click a spreadsheet column to bind its value to the selected text field.
- **Rich styling** — color, bold, italic, alignment, outline (thickness + color).
- **Images** — resize with aspect-ratio lock (hold `Shift` to distort freely).
- **Z-order** — bring to front / back / move up / down one step.
- **Copy / paste / cut / duplicate** — `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+D`.
- **RTL support** — automatic Arabic / Hebrew detection, per-box.
- **Zoom** — buttons, `Ctrl/Cmd + scroll` centered on the cursor, fit-to-screen.
- **Dark mode** — respects `prefers-color-scheme` on first run, then remembers your choice.

### Data

- **Excel & CSV import** — drag and drop, or pick a file.
- **Multiple files** — switch between sheets at any time.
- **Row navigation** — preview any record on the canvas with prev/next or click.

### Template storage

- Save the entire layout — objects, positions, styles, images, column bindings — as a template.
- Reload with one click from the landing page.
- Stored in `localStorage`; nothing is uploaded anywhere.

### Export

- **Per-row PDF pages** — one page per data row.
- **Live progress bar + console** — see each row render with timestamps.
- **Cancellable** — stop mid-export if needed.
- **Quality presets** — Draft / Standard / High, to trade speed against resolution.
- **Canvas-2D rendering** — pages are drawn directly to a `<canvas>`, then embedded as JPEG.
  No DOM cloning, no SVG round-trip. 10-50× faster than typical DOM-to-image exports.

---

## Getting started

### Option 1 — Just open it

```bash
git clone https://github.com/hollyenah/print-gen.git
cd print-gen
```

Then open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).

### Option 2 — Serve locally (recommended for font fidelity)

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

Serving locally avoids some CORS quirks with `file://` URLs when loading Google Fonts.

---

## Usage

1. **Create a canvas** — pick a preset (A4, A3, Letter, 1080p, 720p, Square…) or enter
   your own size in `mm`, `cm`, `in`, `px`, or `pt`.
2. **Add objects**
   - **Field** — a text box that binds to a spreadsheet column.
   - **Static** — fixed text you type directly into the canvas.
   - **Image** — a picture placed on the page.
3. **Load data** — drop an `.xlsx` / `.csv` anywhere on the editor, or use the
   **+** button in the *Data files* panel.
4. **Bind columns** — click a column pill in the top bar to attach it to the
   selected field (or create a new field on the spot).
5. **Style** — pick a font variant, set color, outline, bold/italic, alignment.
6. **Export** — click **Export PDF**, choose quality, watch the progress, download the result.

---

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Delete selected object | `Del` / `Backspace` |
| Duplicate selected object | `Ctrl/Cmd + D` |
| Copy / Cut / Paste | `Ctrl/Cmd + C` / `X` / `V` |
| Edit static text inline | `F2` or double-click |
| Exit inline edit | `Esc` |
| Move object by 1 px | `Arrow keys` |
| Move object by 10 px | `Shift + Arrow keys` |
| Resize with aspect ratio lock | Corner handle (default for images) |
| Resize without aspect ratio | `Shift` + corner handle |
| Zoom in / out | `Ctrl/Cmd + scroll` |
| Deselect / close modal | `Esc` |

---

## Project structure

```text
print-gen/
├── index.html      # Markup — landing screen + editor
├── styles.css      # All styling (light + dark theme)
├── script.js       # Application logic (state, editor, export, templates)
├── LICENSE         # GPL-3.0
├── README.md
└── .gitignore
```

Three source files, zero build step. Edit and refresh.

---

## How it works

### Canvas model

The **page** is a `<div>` sized in CSS pixels. Every object is an absolutely-positioned
`.pg-obj` element. Editing state (`state.boxes`) is the single source of truth; the DOM
is just a projection of it.

### Auto-fit text

Each text box finds the largest font size that fits both dimensions:

1. A hidden `<canvas>` measures the widest word at 100 px to establish a hard upper bound.
2. A binary search over font sizes wraps the text using `ctx.measureText` and tests
   whether the wrapped height fits inside the box.
3. The winning size is applied to both the DOM and (later) the export canvas.

This keeps text visually identical between the editor preview and the exported PDF.

### Export pipeline

For each row:

1. Update the bound fields' text and re-fit only those boxes.
2. Create an offscreen `<canvas>` at `docWidth × scale`, `docHeight × scale`.
3. Draw the background, then each object in z-order:
   - **Text** — `ctx.fillText` + optional `ctx.strokeText` with round joins.
   - **Images** — `ctx.drawImage` at the box's geometry.
4. Encode as JPEG (`quality: 0.92`), embed into the jsPDF document.

Because everything happens in Canvas 2D, export time scales linearly with rows and
stays well under 100 ms per page for typical layouts.

### Templates

Saved as JSON in `localStorage`. Images are inlined as data URLs, so a template with
a large photo can get big — but it works completely offline and survives page reloads.

---

## Going fully offline

By default, two libraries are loaded from CDNs:

| Library | Purpose |
| --- | --- |
| [SheetJS](https://sheetjs.com/) (`xlsx.full.min.js`) | Parse `.xlsx` / `.csv` files |
| [jsPDF](https://github.com/parallax/jsPDF) (`jspdf.umd.min.js`) | Build the output PDF |

To remove the network dependency:

1. Download each `.min.js` file into a `vendor/` folder.
2. In `index.html`, replace the two `<script src="https://...">` tags with local paths:

   ```html
   <script src="vendor/xlsx.full.min.js"></script>
   <script src="vendor/jspdf.umd.min.js"></script>
   ```

For **identical font rendering** offline, download the `.woff2` files for the fonts
you use (Google Fonts) and self-host them. Fonts are measured against the browser's
text engine during layout, so the local rendering must match what you expect in
the final file.

---

## Browser support

| Browser | Status |
| --- | --- |
| Chrome / Edge (Chromium) | ✅ Tested |
| Firefox | ✅ Tested |
| Safari | ✅ Works — Canvas 2D text is fully supported |
| Mobile | ❌ Not designed for touch |

---

## Known limitations

- Very large images embedded in templates may exceed `localStorage`'s ~5 MB quota.
  If that happens, remove the image or use smaller source files.
- Arabic / RTL shaping depends on the browser's text engine; results may vary on
  older Safari versions.
- Export is raster-based (JPEG), not vector. Text is not selectable in the generated PDF.
- Google Fonts are loaded from the CDN by default — see [Going fully offline](#going-fully-offline)
  if you need a zero-network setup.

---

## Contributing

Contributions are welcome. By submitting a pull request you agree to license your
contribution under the same terms as this project (GPL-3.0-or-later).

1. Fork the repo.
2. Create a branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -am 'Add my feature'`.
4. Push: `git push origin feature/my-feature`.
5. Open a Pull Request.

---

## License

This project is licensed under the **GNU General Public License v3.0 or later**
(GPL-3.0-or-later). See [LICENSE](LICENSE) for the full text.

In short: you are free to use, study, share, and modify this software. Any
modified version you distribute — including derivative works — must also be
released under the GPL and provide its source code.

---

## Author

Made by **Hollyenah**.
