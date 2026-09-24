# Print-Gen

> Design once. Generate hundreds.

A lightweight, browser-based tool for batch-generating PDF pages from spreadsheets.
Lay out a single page, drop in an `.xlsx` or `.csv`, and export every row as its own
PDF page — with images, custom fonts, outlines, and per-cell text styling.

**No backend. No uploads. Everything runs in your browser.**

---

## Features

- **Visual editor** — drag, drop, resize text fields and images directly on the canvas.
- **Data binding** — click a spreadsheet column to bind it to a text field.
- **Custom page sizes** — A4, A3, Letter, 1080p, 720p, Square, or enter your own in
  `mm`, `cm`, `in`, `px`, or `pt`.
- **Rich text styling** — font family, size (auto-fitted), color, bold, italic,
  alignment, and outline (thickness + color).
- **RTL support** — automatic Arabic / Hebrew detection with `direction: rtl`.
- **Templates** — save your layout (with images, fonts, colors, outlines) to
  `localStorage` and reload it later.
- **Zoom & pan** — fit-to-screen, keyboard shortcuts, `Ctrl/Cmd + scroll` centered
  on the cursor.
- **PDF export** — with a live progress bar and per-row console log. Cancellable.
- **Dark mode** — respects `prefers-color-scheme` on first load, remembers your choice.
- **Fully offline** — once loaded, nothing hits the network except the initial CDN
  scripts (see [Going fully offline](#going-fully-offline)).

---

## Getting started

### Option 1 — Just open it
git clone https://github.com/<your-username>/print-gen.git
cd print-gen

text

Then open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).

### Option 2 — Serve locally (recommended for font fidelity)

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
Serving locally avoids some CORS quirks with file:// URLs when loading fonts.
```

### Usage
Create a canvas — pick a preset (A4, A3, 1080p…) or enter your own size.

Add objects — click Field to bind a spreadsheet column, Static for
fixed text, or Image to place a picture.

Load data — drop an .xlsx / .csv anywhere on the editor, or use the
+ button in the Data files panel.

Bind columns — click a column pill in the top bar to attach it to the
selected field (or create a new one).

Style — use the style bar to set font, color, outline, bold/italic, alignment.

Export — click Export PDF. Watch the progress bar and console, then
download your multi-page PDF.

### Keyboard shortcuts
Action	Shortcut
Delete selected object	Del / Backspace
Duplicate selected object	Ctrl/Cmd + D
Move object by 1 px	Arrow keys
Move object by 10 px	Shift + Arrow keys
Deselect / close modal	Esc
Zoom in / out	Ctrl/Cmd + scroll

### Project structure
text
print-gen/
├── index.html      # Markup — landing screen + editor
├── styles.css      # All styling (light + dark theme)
├── script.js       # Application logic (state, editor, export, templates)
├── LICENSE
├── README.md
└── .gitignore
Three files, zero build step. Edit and refresh.

Going fully offline
By default, three libraries are loaded from CDNs:

### Library	Purpose
SheetJS (xlsx.full.min.js)	Parse .xlsx / .csv files
jsPDF (jspdf.umd.min.js)	Build the output PDF
dom-to-image-more	Rasterize the DOM page to JPEG for embedding
To remove the network dependency:

### How it works (short version)
The canvas is a <div> sized in CSS pixels, containing absolutely-positioned
.obj elements (text or image).

Auto-fit text: for each text box, a hidden probe measures the wrapping height
at various font sizes via binary search — the largest size that fits without
overflowing is applied.

Export: for each row, the app updates the bound text, waits one animation
frame, rasterizes the page with dom-to-image-more at up to 2.5× scale, and
embeds the JPEG into a jsPDF document sized to match the canvas.

Templates are stored as JSON in localStorage — images are inlined as
data URLs, so a template file can get large if it contains photos.

### Browser support
Browser	Status
Chrome / Edge (Chromium)	✅ Tested
Firefox	✅ Tested
Safari	⚠️ Mostly works — dom-to-image-more can be flaky with complex SVGs
Mobile	❌ Not designed for touch
Known limitations
Very large images embedded in templates may exceed localStorage's ~5 MB quota.
If that happens, remove the image or use smaller source files.

Arabic / RTL shaping depends on the browser's text engine; results may vary on
older Safari versions.

Export is raster-based (JPEG), not vector. Text is not selectable in the PDF.

### Contributing
Contributions are welcome. By submitting a pull request you agree to license your
contribution under the same terms as this project (GPL-3.0-or-later).

### Fork the repo.

Create a branch: git checkout -b feature/my-feature.

Commit your changes: git commit -am 'Add my feature'.

Push: git push origin feature/my-feature.

Open a Pull Request.
