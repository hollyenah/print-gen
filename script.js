/* ══════════════════════════════════════════════════════════
   Print-Gen — application logic (rewrite)
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

/*─────────────────── ICONS ───────────────────*/
const P = {
  plus:      '<path d="M12 5v14M5 12h14"/>',
  text:      '<path d="M5 6h14M12 6v13M9 19h6"/>',
  staticText:'<path d="M5 5h14M5 12h9M5 19h12"/>',
  image:     '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5L5 20"/>',
  download:  '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/>',
  save:      '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  trash:     '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  back:      '<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>',
  zoomIn:    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  zoomOut:   '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/>',
  fit:       '<path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/>',
  x:         '<path d="M18 6 6 18M6 6l12 12"/>',
  chevL:     '<path d="m15 18-6-6 6-6"/>',
  chevR:     '<path d="m9 18 6-6-6-6"/>',
  bold:      '<path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z"/>',
  italic:    '<path d="M19 4h-9M14 20H5M15 4 9 20"/>',
  alignL:    '<path d="M4 6h16M4 12h10M4 18h13"/>',
  alignC:    '<path d="M4 6h16M7 12h10M6 18h12"/>',
  alignR:    '<path d="M4 6h16M10 12h10M7 18h13"/>',
  front:     '<path d="M4 4h16M12 20V9m0 0-5 5m5-5 5 5"/>',
  up:        '<path d="M12 20V5m0 0-5 5m5-5 5 5"/>',
  down:      '<path d="M12 4v15m0 0-5-5m5 5 5-5"/>',
  back2:     '<path d="M4 20h16M12 4v11m0 0-5-5m5 5 5-5"/>',
  file:      '<path d="M14 3v5h5"/><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2Z"/>',
  sun:       '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon:      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
};
const svg = (n, c) =>
  `<svg class="ico ${c || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg>`;

function hydrateIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = svg(el.dataset.icon);
  });
}

/*─────────────────── CONSTANTS ───────────────────*/
const UNIT_PX = { px: 1, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, pt: 96 / 72 };

const PRESETS = [
  { name: 'A4 Portrait',  w: 210,  h: 297,  unit: 'mm' },
  { name: 'A4 Landscape', w: 297,  h: 210,  unit: 'mm' },
  { name: 'A3 Portrait',  w: 297,  h: 420,  unit: 'mm' },
  { name: 'A3 Landscape', w: 420,  h: 297,  unit: 'mm' },
  { name: 'US Letter',    w: 8.5,  h: 11,   unit: 'in' },
  { name: '1080p',        w: 1920, h: 1080, unit: 'px' },
  { name: '720p',         w: 1280, h: 720,  unit: 'px' },
  { name: 'Square',       w: 1080, h: 1080, unit: 'px' }
];

/* Font catalog — every family declares the weights it actually ships.
   Google = loaded from fonts.googleapis.com at <head>; System = OS fonts. */
const FONT_FAMILIES = [
  { family: 'Inter',           group: 'Sans-serif', weights: [400,500,600,700,900], italic: true },
  { family: 'Roboto',          group: 'Sans-serif', weights: [300,400,500,700,900], italic: true },
  { family: 'Open Sans',       group: 'Sans-serif', weights: [400,600,700,800],     italic: true },
  { family: 'Lato',            group: 'Sans-serif', weights: [400,700,900],         italic: true },
  { family: 'Montserrat',      group: 'Sans-serif', weights: [400,500,700,900],     italic: true },
  { family: 'Poppins',         group: 'Sans-serif', weights: [400,500,700,900],     italic: true },
  { family: 'Oswald',          group: 'Display',    weights: [400,500,700],         italic: false },
  { family: 'Playfair Display',group: 'Serif',      weights: [400,700,900],         italic: true },
  { family: 'Merriweather',    group: 'Serif',      weights: [400,700,900],         italic: true },
  { family: 'Noto Sans Arabic',group: 'Arabic',     weights: [400,700],             italic: false },
  { family: 'Cairo',           group: 'Arabic',     weights: [400,600,700,900],     italic: false },
  { family: 'Tajawal',         group: 'Arabic',     weights: [400,500,700,900],     italic: false },
  { family: 'Amiri',           group: 'Arabic',     weights: [400,700],             italic: false },
  { family: 'Arial',           group: 'System',     weights: [400,700,900],         italic: true },
  { family: 'Helvetica',       group: 'System',     weights: [400,700],             italic: true },
  { family: 'Georgia',         group: 'System',     weights: [400,700],             italic: true },
  { family: 'Times New Roman', group: 'System',     weights: [400,700],             italic: true },
  { family: 'Courier New',     group: 'System',     weights: [400,700],             italic: true },
  { family: 'Verdana',         group: 'System',     weights: [400,700],             italic: false },
  { family: 'Impact',          group: 'System',     weights: [400],                 italic: false },
];

const WEIGHT_LABEL = {
  300: 'Light', 400: 'Regular', 500: 'Medium',
  600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'
};

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;
const LS_TPL   = 'printgen.templates.v2';
const LS_THEME = 'printgen.theme';
const LINE_H   = 1.15;

/*─────────────────── STATE ───────────────────*/
const state = {
  doc: { w: 794, h: 1123, name: 'A4 Portrait' },
  boxes: [],
  files: [],
  activeFile: -1,
  row: 0,
  zoom: 1,
  selectedId: null,
  zTop: 1,
  seq: 0,
  clipboard: null,
  exporting: false,
  cancelled: false,
};

/*─────────────────── DOM ───────────────────*/
const $ = s => document.querySelector(s);
const el = {
  landing: $('#landing'), editor: $('#editor'),
  page: $('#page'), stage: $('#canvasStage'), scroll: $('#canvasScroll'),
  presetGrid: $('#presetGrid'), templateList: $('#templateList'), tplCount: $('#tplCount'),
  docBadge: $('#docBadge'), colStrip: $('#colStrip'), stylebar: $('#stylebar'),
  sbText: $('#sbText'),
  fontSelect: $('#fontSelect'), textColor: $('#textColor'),
  strokeW: $('#strokeW'), strokeColor: $('#strokeColor'),
  boldBtn: $('#boldBtn'), italicBtn: $('#italicBtn'), alignBtn: $('#alignBtn'),
  fileList: $('#fileList'), rowList: $('#rowList'), navCounter: $('#navCounter'),
  fileInput: $('#fileInput'), imgInput: $('#imgInput'),
  zoomValue: $('#zoomValue'), dropHint: $('#dropHint'),
  modal: $('#modal'), modalTitle: $('#modalTitle'), modalSetup: $('#modalSetup'),
  modalProgress: $('#modalProgress'), modalRows: $('#modalRows'), modalSize: $('#modalSize'),
  pdfName: $('#pdfName'), pdfQuality: $('#pdfQuality'),
  barFill: $('#barFill'), barLabel: $('#barLabel'),
  exportLog: $('#exportLog'), modalCancel: $('#modalCancel'),
  modalConfirm: $('#modalConfirm'), modalClose: $('#modalClose')
};

/*─────────────────── TEXT MEASUREMENT (offscreen canvas) ───────────────────*/
const measure = document.createElement('canvas').getContext('2d');

function fontString(b, size) {
  const style = b.italic ? 'italic ' : '';
  const weight = b.weight || 400;
  return `${style}${weight} ${size}px "${b.family || 'Inter'}", sans-serif`;
}

function wrapText(ctx, text, maxW) {
  const out = [];
  for (const para of text.split('\n')) {
    if (!para) { out.push(''); continue; }
    const words = para.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (!line || ctx.measureText(test).width <= maxW) line = test;
      else { out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}

/* Find the largest font size where `text` fits inside (w × h). */
function fitText(b, text) {
  if (!text) { b._fitSize = 12; return 12; }
  const W = b.w, H = b.h;
  if (W <= 2 || H <= 2) { b._fitSize = 4; return 4; }

  // Longest word = hard lower bound for the font size
  const words = text.split(/\s+/).filter(Boolean);
  let maxWordRatio = 0;
  measure.font = fontString(b, 100);
  for (const w of words) {
    const r = measure.measureText(w).width;
    if (r > maxWordRatio) maxWordRatio = r;
  }
  const hardCap = maxWordRatio > 0 ? Math.floor(100 * W / maxWordRatio) : 600;
  const hi0 = Math.max(4, Math.min(600, hardCap));
  const hCap = Math.max(4, Math.floor(H / LINE_H));

  let lo = 4, hi = Math.min(hi0, hCap), best = 4;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    measure.font = fontString(b, mid);
    const lines = wrapText(measure, text, W);
    const height = lines.length * mid * LINE_H;
    if (height <= H) { best = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  b._fitSize = best;
  return best;
}

/*─────────────────── THEME ───────────────────*/
function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(LS_THEME, t); } catch (e) {}
  const icon = t === 'dark' ? 'sun' : 'moon';
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.innerHTML = svg(icon);
    b.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  });
}
function toggleTheme() {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

/*─────────────────── LANDING ───────────────────*/
function renderPresets() {
  el.presetGrid.innerHTML = '';
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'preset';
    const ratio = p.w / p.h;
    const shapeW = ratio >= 1 ? 26 : Math.round(26 * ratio);
    const shapeH = ratio >= 1 ? Math.round(26 / ratio) : 26;
    b.innerHTML = `
      <span class="preset-shape" style="width:${shapeW}px;height:${shapeH}px"></span>
      <span class="preset-name">${p.name}</span>
      <span class="preset-size">${p.w} × ${p.h} ${p.unit}</span>`;
    b.onclick = () => openEditor(p.w * UNIT_PX[p.unit], p.h * UNIT_PX[p.unit], p.name);
    el.presetGrid.appendChild(b);
  });
}

function getTemplates() {
  try { return JSON.parse(localStorage.getItem(LS_TPL) || '[]'); }
  catch { return []; }
}
function setTemplates(list) {
  try { localStorage.setItem(LS_TPL, JSON.stringify(list)); }
  catch { alert('Storage is full — remove an old template or use smaller images.'); }
}

function renderTemplates() {
  const list = getTemplates();
  el.tplCount.textContent = list.length ? `${list.length} saved` : '';
  el.templateList.innerHTML = '';
  if (!list.length) {
    el.templateList.innerHTML = '<div class="empty-note">No templates yet. Build a layout and hit "Save template".</div>';
    return;
  }
  list.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tpl-item';
    item.innerHTML = `
      <div class="tpl-thumb"></div>
      <div class="tpl-meta">
        <div class="tpl-name"></div>
        <div class="tpl-info">${Math.round(t.w)} × ${Math.round(t.h)} px · ${t.boxes.length} object${t.boxes.length !== 1 ? 's' : ''}</div>
      </div>
      <button class="tpl-del" title="Delete">${svg('trash')}</button>`;
    item.querySelector('.tpl-name').textContent = t.name;
    item.querySelector('.tpl-del').onclick = e => {
      e.stopPropagation();
      if (!confirm(`Delete template "${t.name}"?`)) return;
      setTemplates(getTemplates().filter(x => x.id !== t.id));
      renderTemplates();
    };
    item.onclick = () => loadTemplate(t);
    el.templateList.appendChild(item);
  });
}

function createDoc(w, h, name) {
  // Wipe everything
  state.boxes.forEach(b => b.el && b.el.remove());
  state.boxes = [];
  state.selectedId = null;
  state.zTop = 1;
  state.doc = { w: Math.round(w), h: Math.round(h), name: name || 'Custom' };
  el.page.style.width  = state.doc.w + 'px';
  el.page.style.height = state.doc.h + 'px';
  el.docBadge.textContent = `${state.doc.name} · ${state.doc.w} × ${state.doc.h} px`;
  updateStageSize();
  hideStylebar();
}

function openEditor(w, h, name, skipReset) {
  if (!skipReset) createDoc(w, h, name);
  el.landing.classList.remove('active');
  el.editor.classList.add('active');
  requestAnimationFrame(fitZoom);
}

function goLanding() {
  deselect();
  el.editor.classList.remove('active');
  el.landing.classList.add('active');
  renderTemplates();
}

/*─────────────────── ZOOM ───────────────────*/
function updateStageSize() {
  el.stage.style.width  = (state.doc.w * state.zoom) + 'px';
  el.stage.style.height = (state.doc.h * state.zoom) + 'px';
  el.page.style.transform = `scale(${state.zoom})`;
  el.page.style.transformOrigin = '0 0';
  el.page.style.setProperty('--inv-z', String(1 / state.zoom));
  el.zoomValue.textContent = Math.round(state.zoom * 100) + '%';
}

function setZoom(z, anchor) {
  const old = state.zoom;
  z = Math.max(0.05, Math.min(6, z));
  if (Math.abs(z - old) < 0.0001) return;
  state.zoom = z;
  updateStageSize();
  if (anchor) {
    const r = el.scroll.getBoundingClientRect();
    const cx = anchor.x - r.left + el.scroll.scrollLeft;
    const cy = anchor.y - r.top  + el.scroll.scrollTop;
    const k = z / old;
    el.scroll.scrollLeft = cx * k - (anchor.x - r.left);
    el.scroll.scrollTop  = cy * k - (anchor.y - r.top);
  }
}

function fitZoom() {
  const r = el.scroll.getBoundingClientRect();
  const pad = 112;
  const z = Math.min((r.width - pad) / state.doc.w, (r.height - pad) / state.doc.h);
  state.zoom = Math.max(0.05, Math.min(2, z));
  updateStageSize();
  el.scroll.scrollLeft = (el.scroll.scrollWidth - r.width) / 2;
  el.scroll.scrollTop  = (el.scroll.scrollHeight - r.height) / 2;
}

/*─────────────────── BOX MODEL ───────────────────*/
function newTextBox(partial) {
  return Object.assign({
    id: 'b' + (++state.seq),
    type: 'text',
    x: 60, y: 60, w: 320, h: 100,
    z: ++state.zTop,
    colKey: null,
    staticText: '',
    family: 'Inter',
    weight: 400,
    italic: false,
    color: '#111111',
    align: 'left',
    strokeW: 0,
    strokeColor: '#000000'
  }, partial || {});
}

function newImageBox(src, partial) {
  return Object.assign({
    id: 'b' + (++state.seq),
    type: 'image',
    x: 60, y: 60, w: 300, h: 300,
    z: ++state.zTop,
    src: src
  }, partial || {});
}

function getBox(id) { return state.boxes.find(b => b.id === id); }
function getSelected() { return state.selectedId ? getBox(state.selectedId) : null; }

/* Resolve the visible text of a text box for the current row. */
function textFor(b) {
  if (b.type !== 'text') return '';
  if (b.colKey && state.files[state.activeFile]) {
    const row = state.files[state.activeFile].rows[state.row] || {};
    const v = row[b.colKey];
    return v == null ? '' : String(v);
  }
  return b.staticText || '';
}

/*─────────────────── DOM RENDERING ───────────────────*/
function renderBox(b) {
  const div = document.createElement('div');
  div.className = 'pg-obj';
  div.dataset.box = b.id;
  div.style.zIndex = b.z;
  div.style.left = b.x + 'px';
  div.style.top  = b.y + 'px';
  div.style.width  = b.w + 'px';
  div.style.height = b.h + 'px';

  if (b.type === 'text') {
    const t = document.createElement('div');
    t.className = 'pg-obj-text';
    t.contentEditable = 'false';
    t.spellcheck = false;
    div.appendChild(t);
    b.textEl = t;
  } else {
    const img = document.createElement('img');
    img.draggable = false;
    img.src = b.src;
    div.appendChild(img);
    b.imgEl = img;
  }

  const handles = document.createElement('div');
  handles.className = 'pg-handles';
  for (const d of ['nw','n','ne','w','e','sw','s','se']) {
    const h = document.createElement('div');
    h.className = 'pg-handle h-' + d;
    h.dataset.dir = d;
    handles.appendChild(h);
  }
  div.appendChild(handles);

  const del = document.createElement('button');
  del.className = 'pg-del';
  del.innerHTML = svg('x');
  div.appendChild(del);

  b.el = div;
  el.page.appendChild(div);

  wireBox(b);
  if (b.type === 'text') updateTextDom(b);
  return div;
}

function updateBoxDom(b) {
  if (!b.el) return;
  const s = b.el.style;
  s.left   = b.x + 'px';
  s.top    = b.y + 'px';
  s.width  = b.w + 'px';
  s.height = b.h + 'px';
  s.zIndex = b.z;
}

function updateTextDom(b) {
  if (b.type !== 'text' || !b.textEl) return;
  const t = b.textEl;
  const text = textFor(b);
  const size = fitText(b, text);
  const rtl = ARABIC_RE.test(text);

  let align = b.align;
  if (rtl) {
    if (align === 'left')  align = 'right';
    else if (align === 'right') align = 'left';
  }

  if (t.textContent !== text) t.textContent = text;
  t.style.fontFamily = `"${b.family}", sans-serif`;
  t.style.fontWeight = String(b.weight);
  t.style.fontStyle  = b.italic ? 'italic' : 'normal';
  t.style.fontSize   = size + 'px';
  t.style.color      = b.color;
  t.style.direction  = rtl ? 'rtl' : 'ltr';
  t.style.justifyContent = align === 'left'  ? 'flex-start'
                          : align === 'right' ? 'flex-end'
                          : 'center';
  t.style.textAlign = align;

  if (b.strokeW > 0) {
    t.style.webkitTextStroke = b.strokeW + 'px ' + b.strokeColor;
    t.style.paintOrder = 'stroke fill';
  } else {
    t.style.webkitTextStroke = '';
    t.style.paintOrder = '';
  }
}

/*─────────────────── SELECTION ───────────────────*/
function selectBox(b) {
  const id = b ? b.id : null;
  if (state.selectedId === id) return;
  if (state.selectedId) {
    const prev = getBox(state.selectedId);
    if (prev && prev.el) prev.el.classList.remove('selected');
  }
  state.selectedId = id;
  if (!b) { hideStylebar(); return; }
  b.el.classList.add('selected');
  showStylebar(b);
}

function deselect() { selectBox(null); }

function showStylebar(b) {
  el.stylebar.classList.add('visible');
  if (b.type === 'image') {
    el.sbText.style.display = 'none';
    return;
  }
  el.sbText.style.display = 'flex';
  el.fontSelect.value = `${b.family}|${b.weight}|${b.italic ? 'italic' : 'normal'}`;
  el.textColor.value  = b.color;
  el.strokeW.value    = b.strokeW;
  el.strokeColor.value = b.strokeColor;
  el.boldBtn.classList.toggle('on', b.weight >= 700);
  el.italicBtn.classList.toggle('on', b.italic);
  el.alignBtn.innerHTML = svg({left:'alignL', center:'alignC', right:'alignR'}[b.align]);
}

function hideStylebar() { el.stylebar.classList.remove('visible'); }

/*─────────────────── INTERACTION ───────────────────*/
function wireBox(b) {
  b.el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('pg-handle')) return;
    if (e.target.classList.contains('pg-del')) return;
    if (b.editing) return;                       // contenteditable mode
    if (e.button !== 0) return;
    e.preventDefault();
    selectBox(b);
    startDrag(e, b);
  });

  b.el.addEventListener('dblclick', e => {
    if (b.type !== 'text') return;
    if (b.colKey) return;                        // bound fields: not editable
    e.preventDefault();
    enterEditMode(b);
  });

  b.el.querySelectorAll('.pg-handle').forEach(h => {
    h.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      startResize(e, b, h.dataset.dir);
    });
  });

  b.el.querySelector('.pg-del').addEventListener('mousedown', e => {
    e.stopPropagation(); e.preventDefault();
    removeBox(b);
  });
}

function startDrag(e, b) {
  const sx = e.clientX, sy = e.clientY;
  const ox = b.x, oy = b.y, z = state.zoom;
  const move = ev => {
    b.x = Math.round(ox + (ev.clientX - sx) / z);
    b.y = Math.round(oy + (ev.clientY - sy) / z);
    b.el.style.left = b.x + 'px';
    b.el.style.top  = b.y + 'px';
  };
  const up = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
}

function startResize(e, b, dir) {
  const sx = e.clientX, sy = e.clientY;
  const ox = b.x, oy = b.y, ow = b.w, oh = b.h, z = state.zoom;
  // Aspect ratio lock: default on for images, off for text.
  // Hold Shift to invert.
  const wantsLock = b.type === 'image' ? !e.shiftKey : e.shiftKey;
  const isCorner = dir === 'nw' || dir === 'ne' || dir === 'sw' || dir === 'se';
  const lock = wantsLock && isCorner;
  const ratio = ow / oh;

  const move = ev => {
    const dx = (ev.clientX - sx) / z;
    const dy = (ev.clientY - sy) / z;
    let x = ox, y = oy, w = ow, h = oh;

    if (dir.includes('e')) w = Math.max(20, ow + dx);
    if (dir.includes('s')) h = Math.max(16, oh + dy);
    if (dir.includes('w')) { w = Math.max(20, ow - dx); x = ox + (ow - w); }
    if (dir.includes('n')) { h = Math.max(16, oh - dy); y = oy + (oh - h); }

    if (lock) {
      if (Math.abs(w - ow) > Math.abs(h - oh)) h = w / ratio;
      else w = h * ratio;
      if (dir.includes('w')) x = ox + (ow - w);
      if (dir.includes('n')) y = oy + (oh - h);
    }

    b.x = Math.round(x); b.y = Math.round(y);
    b.w = Math.round(w); b.h = Math.round(h);
    b.el.style.left   = b.x + 'px';
    b.el.style.top    = b.y + 'px';
    b.el.style.width  = b.w + 'px';
    b.el.style.height = b.h + 'px';
    if (b.type === 'text') updateTextDom(b);
  };
  const up = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
}

/*─────────────────── INLINE EDIT ───────────────────*/
function enterEditMode(b) {
  if (b.type !== 'text' || b.colKey || b.editing) return;
  b.editing = true;
  b.el.classList.add('editing');
  const t = b.textEl;
  t.contentEditable = 'true';

  // Move caret at end + select all so first keystroke replaces
  requestAnimationFrame(() => {
    t.focus();
    const range = document.createRange();
    range.selectNodeContents(t);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });

  const onInput = () => {
    b.staticText = t.textContent || '';
    updateTextDom(b);
  };
  t.addEventListener('input', onInput);

  // Escape to exit
  const onKey = ev => {
    if (ev.key === 'Escape') { ev.preventDefault(); exitEditMode(b); }
  };
  t.addEventListener('keydown', onKey);

  b._editCleanup = () => {
    t.removeEventListener('input', onInput);
    t.removeEventListener('keydown', onKey);
  };
}

function exitEditMode(b) {
  if (!b || !b.editing) return;
  b.editing = false;
  b.el.classList.remove('editing');
  const t = b.textEl;
  b.staticText = t.textContent || '';
  t.contentEditable = 'false';
  b._editCleanup && b._editCleanup();
  b._editCleanup = null;
  // Empty static box? Auto-remove so we don't leave orphans behind.
  if (!b.colKey && !b.staticText.trim()) {
    removeBox(b);
    return;
  }
  updateTextDom(b);
}

/*─────────────────── CLIPBOARD ───────────────────*/
function cloneBoxData(b) {
  const o = {};
  for (const k in b) {
    if (k === 'el' || k === 'textEl' || k === 'imgEl' || k === '_img' ||
        k === '_editCleanup' || k === '_fitSize' || k === 'editing') continue;
    o[k] = b[k];
  }
  return o;
}

function copySelected() {
  const b = getSelected();
  if (!b) return;
  state.clipboard = cloneBoxData(b);
  toast('Copied');
}
function pasteClipboard() {
  if (!state.clipboard) return;
  const data = Object.assign({}, state.clipboard);
  const b = data.type === 'image'
    ? newImageBox(data.src, data)
    : newTextBox(data);
  b.x += 24; b.y += 24;
  b.z = ++state.zTop;
  if (b.type === 'image') {
    const img = new Image();
    img.onload = () => { b._img = img; };
    img.src = b.src;
  }
  state.boxes.push(b);
  renderBox(b);
  selectBox(b);
  toast('Pasted');
}
function cutSelected() {
  const b = getSelected();
  if (!b) return;
  copySelected();
  removeBox(b);
}
function duplicateSelected() {
  const b = getSelected();
  if (!b) return;
  const data = cloneBoxData(b);
  const copy = data.type === 'image'
    ? newImageBox(data.src, data)
    : newTextBox(data);
  copy.x = b.x + 20; copy.y = b.y + 20;
  copy.z = ++state.zTop;
  if (copy.type === 'image') {
    const img = new Image();
    img.onload = () => { copy._img = img; };
    img.src = copy.src;
  }
  state.boxes.push(copy);
  renderBox(copy);
  selectBox(copy);
}

/*─────────────────── ADD / REMOVE ───────────────────*/
function addFieldBox(colKey) {
  const b = newTextBox({ colKey: colKey || null, staticText: colKey ? null : '' });
  state.boxes.push(b);
  renderBox(b);
  selectBox(b);
  return b;
}

function addStaticBox() {
  const b = newTextBox();
  state.boxes.push(b);
  renderBox(b);
  selectBox(b);
  // Enter edit mode straight away
  requestAnimationFrame(() => enterEditMode(b));
  return b;
}

function addImageFromSrc(src) {
  const img = new Image();
  img.onload = () => {
    const natW = img.naturalWidth  || 300;
    const natH = img.naturalHeight || 300;
    const maxW = state.doc.w * 0.5;
    const maxH = state.doc.h * 0.5;
    const k = Math.min(maxW / natW, maxH / natH, 1);
    const w = Math.round(natW * k);
    const h = Math.round(natH * k);
    const b = newImageBox(src, {
      x: Math.round((state.doc.w - w) / 2),
      y: Math.round((state.doc.h - h) / 2),
      w, h
    });
    b._img = img;
    state.boxes.push(b);
    renderBox(b);
    selectBox(b);
  };
  img.src = src;
}

function removeBox(b) {
  if (b.el) b.el.remove();
  const i = state.boxes.indexOf(b);
  if (i > -1) state.boxes.splice(i, 1);
  if (state.selectedId === b.id) { state.selectedId = null; hideStylebar(); }
}

/*─────────────────── FILES & DATA ───────────────────*/
function readDataFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        if (!rows.length) return reject(new Error('Empty file'));
        resolve({ name: file.name, rows, columns: Object.keys(rows[0]) });
      } catch (err) { reject(err); }
    };
    r.readAsArrayBuffer(file);
  });
}

function readAsDataURL(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
}

async function ingestFiles(fileList) {
  const arr = Array.from(fileList || []);
  let firstNew = -1;
  for (const f of arr) {
    if (f.type.startsWith('image/')) {
      addImageFromSrc(await readAsDataURL(f));
      continue;
    }
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) continue;
    try {
      const data = await readDataFile(f);
      state.files.push(data);
      if (firstNew < 0) firstNew = state.files.length - 1;
    } catch (err) {
      alert(`Could not read "${f.name}": ${err.message}`);
    }
  }
  if (state.files.length) {
    buildFileList();
    if (firstNew >= 0) switchFile(firstNew);
    else buildColumns();
  }
}

function buildFileList() {
  el.fileList.innerHTML = '';
  if (!state.files.length) {
    el.fileList.innerHTML = '<div class="empty-note">Drop an .xlsx or .csv anywhere</div>';
    return;
  }
  state.files.forEach((f, i) => {
    const d = document.createElement('div');
    d.className = 'file-item' + (i === state.activeFile ? ' active' : '');
    d.innerHTML = `${svg('file')}<span class="file-name"></span><button class="file-del">${svg('x')}</button>`;
    d.querySelector('.file-name').textContent = f.name;
    d.querySelector('.file-name').title = f.name;
    d.querySelector('.file-del').onclick = e => {
      e.stopPropagation();
      removeFile(i);
    };
    d.onclick = () => switchFile(i);
    el.fileList.appendChild(d);
  });
}

function switchFile(i) {
  state.activeFile = i;
  state.row = 0;
  buildFileList();
  buildColumns();
  buildRows();
  refreshAllText();
}

function removeFile(i) {
  state.files.splice(i, 1);
  if (!state.files.length) {
    state.activeFile = -1;
    el.colStrip.innerHTML = '';
    el.rowList.innerHTML = '';
    el.navCounter.textContent = '0 / 0';
    buildFileList();
    refreshAllText();
    return;
  }
  switchFile(Math.min(i, state.files.length - 1));
}

function buildColumns() {
  el.colStrip.innerHTML = '';
  const f = state.files[state.activeFile];
  if (!f) {
    el.colStrip.innerHTML = '<span class="col-hint">Load a spreadsheet to see its columns</span>';
    return;
  }
  f.columns.forEach(c => {
    const b = document.createElement('button');
    b.className = 'col-pill';
    b.textContent = c;
    b.title = 'Bind to selected field — or create a new one';
    b.onclick = () => {
      const sel = getSelected();
      if (sel && sel.type === 'text') {
        sel.colKey = c;
        sel.staticText = null;
        updateTextDom(sel);
        showStylebar(sel);
      } else {
        addFieldBox(c);
      }
    };
    el.colStrip.appendChild(b);
  });
}

function buildRows() {
  el.rowList.innerHTML = '';
  const f = state.files[state.activeFile];
  if (!f) { el.navCounter.textContent = '0 / 0'; return; }
  const frag = document.createDocumentFragment();
  f.rows.forEach((row, i) => {
    const d = document.createElement('div');
    d.className = 'row-item' + (i === state.row ? ' active' : '');
    const vals = Object.values(row).slice(0, 2).map(v => String(v)).filter(Boolean);
    d.textContent = vals.join(' · ') || 'Row ' + (i + 1);
    d.title = d.textContent;
    d.onclick = () => goRow(i);
    frag.appendChild(d);
  });
  el.rowList.appendChild(frag);
  updateCounter();
}

function goRow(i) {
  const f = state.files[state.activeFile];
  if (!f) return;
  state.row = Math.max(0, Math.min(f.rows.length - 1, i));
  el.rowList.querySelectorAll('.row-item').forEach((n, k) =>
    n.classList.toggle('active', k === state.row));
  const act = el.rowList.querySelector('.row-item.active');
  if (act) act.scrollIntoView({ block: 'nearest' });
  updateCounter();
  refreshAllText();
}

function updateCounter() {
  const f = state.files[state.activeFile];
  el.navCounter.textContent = f ? `${state.row + 1} / ${f.rows.length}` : '0 / 0';
}

function refreshAllText() {
  // Only re-fit text for field-bound boxes; static text doesn't change.
  for (const b of state.boxes) {
    if (b.type === 'text') updateTextDom(b);
  }
}

/*─────────────────── TEMPLATES ───────────────────*/
function saveTemplate() {
  const f = state.files[state.activeFile];
  const suggested = state.doc.name !== 'Custom' ? state.doc.name : 'My template';
  const name = prompt('Template name:', suggested);
  if (name === null) return;
  const tpl = {
    id: 't' + Date.now(),
    name: name.trim() || 'Untitled',
    w: state.doc.w, h: state.doc.h,
    docName: state.doc.name,
    columns: f ? f.columns.slice() : [],
    boxes: state.boxes.map(cloneBoxData),
    createdAt: Date.now()
  };
  const list = getTemplates();
  list.unshift(tpl);
  setTemplates(list);
  renderTemplates();
  toast('Template saved');
}

function loadTemplate(t) {
  createDoc(t.w, t.h, t.docName || t.name);
  openEditor(t.w, t.h, t.docName || t.name, true);
  requestAnimationFrame(() => {
    for (const bd of t.boxes) {
      const b = bd.type === 'image'
        ? newImageBox(bd.src, bd)
        : newTextBox(bd);
      b.z = bd.z;
      state.zTop = Math.max(state.zTop, bd.z);
      if (b.type === 'image') {
        const img = new Image();
        img.onload = () => { b._img = img; };
        img.src = b.src;
      }
      state.boxes.push(b);
      renderBox(b);
    }
  });
}

/*─────────────────── EXPORT (Canvas 2D — fast) ───────────────────*/
function drawTextBox(ctx, b, text) {
  if (!text) return;
  const size = b._fitSize || fitText(b, text);
  ctx.font = fontString(b, size);

  const rtl = ARABIC_RE.test(text);
  ctx.direction = rtl ? 'rtl' : 'ltr';

  let align = b.align;
  if (rtl) {
    if (align === 'left')  align = 'right';
    else if (align === 'right') align = 'left';
  }
  ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
  ctx.textBaseline = 'top';

  const lines = wrapText(ctx, text, b.w);
  const lineH = size * LINE_H;
  const totalH = lines.length * lineH;
  let y = b.y + (b.h - totalH) / 2;
  const x = align === 'left'  ? b.x
          : align === 'right' ? b.x + b.w
          : b.x + b.w / 2;

  if (b.strokeW > 0) {
    ctx.lineWidth = b.strokeW * 2;
    ctx.strokeStyle = b.strokeColor;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
  }
  ctx.fillStyle = b.color;

  for (const line of lines) {
    if (b.strokeW > 0) ctx.strokeText(line, x, y);
    ctx.fillText(line, x, y);
    y += lineH;
  }
}

function drawImageBox(ctx, b) {
  const img = b._img;
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.drawImage(img, b.x, b.y, b.w, b.h);
}

async function preloadAllImages() {
  const promises = [];
  for (const b of state.boxes) {
    if (b.type === 'image' && !b._img) {
      promises.push(new Promise(res => {
        const img = new Image();
        img.onload = () => { b._img = img; res(); };
        img.onerror = () => res();
        img.src = b.src;
      }));
    }
  }
  return Promise.all(promises);
}

function rasterizeRow(scale) {
  const canvas = document.createElement('canvas');
  canvas.width  = Math.max(1, Math.round(state.doc.w * scale));
  canvas.height = Math.max(1, Math.round(state.doc.h * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  // z-order
  const sorted = state.boxes.slice().sort((a, b) => a.z - b.z);
  for (const b of sorted) {
    if (b.type === 'image') drawImageBox(ctx, b);
    else drawTextBox(ctx, b, textFor(b));
  }
  return canvas.toDataURL('image/jpeg', 0.92);
}

/*─────────────────── EXPORT MODAL ───────────────────*/
function logLine(html) {
  const d = document.createElement('div');
  d.className = 'console-line';
  d.innerHTML = html;
  el.exportLog.appendChild(d);
  while (el.exportLog.children.length > 400) el.exportLog.removeChild(el.exportLog.firstChild);
  el.exportLog.scrollTop = el.exportLog.scrollHeight;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

function openExportModal() {
  const f = state.files[state.activeFile];
  if (!f) { alert('Load a spreadsheet first.'); return; }
  if (!state.boxes.length) { alert('Add at least one object to the page first.'); return; }

  el.modalTitle.textContent = 'Export PDF';
  el.modalSetup.classList.remove('hidden');
  el.modalProgress.classList.add('hidden');
  el.modalConfirm.classList.remove('hidden');
  el.modalCancel.textContent = 'Cancel';
  el.pdfName.value = f.name.replace(/\.[^.]+$/, '') || 'printgen-export';
  el.modalRows.textContent = f.rows.length;
  el.modalSize.textContent = `${state.doc.w} × ${state.doc.h} px`;
  el.exportLog.innerHTML = '';
  el.barFill.style.width = '0%';
  el.barLabel.textContent = 'Preparing…';
  el.modal.classList.add('open');
  setTimeout(() => el.pdfName.focus(), 40);
}

function closeModal() {
  if (state.exporting) return;
  el.modal.classList.remove('open');
}

function resetModalConfirm() {
  el.modalConfirm.onclick = runExport;
  el.modalConfirm.querySelector('span').textContent = 'Generate';
  el.modalCancel.textContent = 'Cancel';
  el.modalConfirm.classList.remove('hidden');
}

async function runExport() {
  const f = state.files[state.activeFile];
  if (!f) return;

  state.exporting = true;
  state.cancelled = false;
  el.modalSetup.classList.add('hidden');
  el.modalProgress.classList.remove('hidden');
  el.modalConfirm.classList.add('hidden');
  el.modalCancel.textContent = 'Cancel';
  deselect();

  const savedRow = state.row;
  const total = f.rows.length;
  const scale = parseFloat(el.pdfQuality.value) || 2;

  // ── PDF setup ──
  const wPt = state.doc.w * 0.75;
  const hPt = state.doc.h * 0.75;
  const orientation = wPt > hPt ? 'landscape' : 'portrait';
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    unit: 'pt',
    format: [Math.min(wPt, hPt), Math.max(wPt, hPt)],
    orientation
  });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  logLine(`<span class="dim">›</span> Page <span class="ok">${state.doc.w}×${state.doc.h}px</span>`);
  logLine(`<span class="dim">›</span> ${total} records · raster ×${scale.toFixed(2)}`);

  await document.fonts.ready;
  await preloadAllImages();

  const t0 = performance.now();

  for (let i = 0; i < total; i++) {
    if (state.cancelled) break;

    state.row = i;

    // Only re-fit text boxes bound to columns (static text doesn't change)
    for (const b of state.boxes) {
      if (b.type === 'text' && b.colKey) fitText(b, textFor(b));
    }

    let dataUrl;
    try {
      dataUrl = rasterizeRow(scale);
    } catch (err) {
      logLine(`<span class="dim">✕ row ${i + 1} failed — ${err.message}</span>`);
      continue;
    }

    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH);

    const pct = Math.round(((i + 1) / total) * 100);
    el.barFill.style.width = pct + '%';
    el.barLabel.textContent = `${i + 1} / ${total}`;

    const row = f.rows[i];
    const label = String(Object.values(row)[0] ?? `Row ${i + 1}`).slice(0, 60);
    const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    logLine(`<span class="dim">${stamp}</span> <span class="ok">✓</span> ${i + 1}/${total} — ${escapeHtml(label)}`);
  }

  state.row = savedRow;
  refreshAllText();
  updateCounter();

  if (state.cancelled) {
    el.barLabel.textContent = 'Cancelled';
    logLine('<span class="dim">› Cancelled by user.</span>');
    state.exporting = false;
    el.modalCancel.textContent = 'Close';
    el.modalConfirm.classList.remove('hidden');
    el.modalConfirm.querySelector('span').textContent = 'Close';
    el.modalConfirm.onclick = () => { el.modal.classList.remove('open'); resetModalConfirm(); };
    return;
  }

  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  logLine(`<span class="dim">›</span> Done in <span class="ok">${secs}s</span>`);

  const name = (el.pdfName.value.trim() || 'printgen-export').replace(/\.pdf$/i, '');
  el.barLabel.textContent = `Saving ${name}.pdf …`;
  await new Promise(r => setTimeout(r, 80));
  pdf.save(name + '.pdf');

  el.barLabel.textContent = `Saved ${total} pages · ${name}.pdf`;
  el.modalCancel.textContent = 'Close';
  el.modalConfirm.classList.remove('hidden');
  el.modalConfirm.querySelector('span').textContent = 'Close';
  el.modalConfirm.onclick = () => { el.modal.classList.remove('open'); resetModalConfirm(); };
  state.exporting = false;
}

/*─────────────────── TOAST ───────────────────*/
let toastTimer = null;
function toast(msg) {
  let t = document.getElementById('pgToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'pgToast';
    t.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(8px);' +
      'background:#1f1e1c;color:#fff;padding:10px 18px;border-radius:99px;font-size:13px;' +
      'font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;pointer-events:none;' +
      'transition:opacity .18s,transform .18s;z-index:500;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(8px)';
  }, 1500);
}

/*─────────────────── FONT SELECT ───────────────────*/
function buildFontSelect() {
  el.fontSelect.innerHTML = '';
  const groups = {};
  for (const f of FONT_FAMILIES) {
    (groups[f.group] = groups[f.group] || []).push(f);
  }
  for (const g of Object.keys(groups)) {
    const og = document.createElement('optgroup');
    og.label = g;
    for (const f of groups[g]) {
      for (const w of f.weights) {
        const o = document.createElement('option');
        o.value = `${f.family}|${w}|normal`;
        o.textContent = `${f.family} ${WEIGHT_LABEL[w] || w}`;
        o.style.fontFamily = `"${f.family}", sans-serif`;
        o.style.fontWeight = String(w);
        og.appendChild(o);
        if (f.italic) {
          const oi = document.createElement('option');
          oi.value = `${f.family}|${w}|italic`;
          oi.textContent = `${f.family} ${WEIGHT_LABEL[w] || w} Italic`;
          oi.style.fontFamily = `"${f.family}", sans-serif`;
          oi.style.fontWeight = String(w);
          oi.style.fontStyle = 'italic';
          og.appendChild(oi);
        }
      }
    }
    el.fontSelect.appendChild(og);
  }
  el.fontSelect.value = 'Inter|400|normal';
}

/*─────────────────── WIRE EVENTS ───────────────────*/
function wireEvents() {
  /* Landing */
  $('#createCustom').onclick = () => {
    const w = parseFloat($('#cw').value);
    const h = parseFloat($('#ch').value);
    const u = $('#cu').value;
    if (!(w > 0) || !(h > 0)) { alert('Enter a valid width and height.'); return; }
    const px = UNIT_PX[u];
    openEditor(w * px, h * px, `${w}×${h} ${u}`);
  };

  /* Editor top */
  $('#backBtn').onclick = goLanding;
  $('#addFieldBtn').onclick  = () => addFieldBox();
  $('#addStaticBtn').onclick = () => addStaticBox();
  $('#addImageBtn').onclick  = () => el.imgInput.click();
  $('#saveTplBtn').onclick   = saveTemplate;
  $('#exportBtn').onclick    = openExportModal;

  const tl = document.getElementById('themeLanding');
  const te = document.getElementById('themeEditor');
  if (tl) tl.onclick = toggleTheme;
  if (te) te.onclick = toggleTheme;

  el.imgInput.onchange = async e => {
    for (const f of Array.from(e.target.files)) {
      addImageFromSrc(await readAsDataURL(f));
    }
    e.target.value = '';
  };
  $('#addFileBtn').onclick = () => el.fileInput.click();
  el.fileInput.onchange = e => { ingestFiles(e.target.files); e.target.value = ''; };

  /* Style bar */
  el.fontSelect.onchange = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    const [family, weight, style] = el.fontSelect.value.split('|');
    b.family = family;
    b.weight = parseInt(weight, 10);
    b.italic = style === 'italic';
    updateTextDom(b);
    showStylebar(b);
  };
  el.textColor.oninput = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    b.color = el.textColor.value;
    updateTextDom(b);
  };
  el.strokeW.oninput = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    b.strokeW = Math.max(0, parseFloat(el.strokeW.value) || 0);
    updateTextDom(b);
  };
  el.strokeColor.oninput = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    b.strokeColor = el.strokeColor.value;
    updateTextDom(b);
  };
  el.boldBtn.onclick = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    // Toggle between current weight and its bold counterpart (400 <-> 700)
    b.weight = b.weight >= 700 ? 400 : 700;
    // Pick a weight the family actually supports, if needed
    const fam = FONT_FAMILIES.find(f => f.family === b.family);
    if (fam && !fam.weights.includes(b.weight)) {
      b.weight = fam.weights.reduce((p, c) =>
        Math.abs(c - b.weight) < Math.abs(p - b.weight) ? c : p, fam.weights[0]);
    }
    updateTextDom(b);
    showStylebar(b);
  };
  el.italicBtn.onclick = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    b.italic = !b.italic;
    updateTextDom(b);
    showStylebar(b);
  };
  const alignOrder = ['left', 'center', 'right'];
  const alignIcon  = { left: 'alignL', center: 'alignC', right: 'alignR' };
  el.alignBtn.onclick = () => {
    const b = getSelected(); if (!b || b.type !== 'text') return;
    b.align = alignOrder[(alignOrder.indexOf(b.align) + 1) % 3];
    el.alignBtn.innerHTML = svg(alignIcon[b.align]);
    updateTextDom(b);
  };

  /* z-order */
  const bumpZ = () => { const b = getSelected(); if (b) { b.z = ++state.zTop; b.el.style.zIndex = b.z; } };
  $('#zFront').onclick = bumpZ;
  $('#zUp').onclick    = bumpZ;
  $('#zDown').onclick  = () => {
    const b = getSelected(); if (!b) return;
    b.z = Math.max(0, b.z - 1);
    b.el.style.zIndex = b.z;
  };
  $('#zBack').onclick  = () => {
    const b = getSelected(); if (!b) return;
    b.z = 0; b.el.style.zIndex = 0;
  };
  $('#deleteBtn').onclick = () => { const b = getSelected(); if (b) removeBox(b); };

  /* Rows nav */
  $('#prevBtn').onclick = () => goRow(state.row - 1);
  $('#nextBtn').onclick = () => goRow(state.row + 1);

  /* Zoom */
  $('#zoomIn').onclick  = () => setZoom(state.zoom * 1.2);
  $('#zoomOut').onclick = () => setZoom(state.zoom / 1.2);
  $('#zoomFit').onclick = fitZoom;
  el.zoomValue.onclick  = () => setZoom(1);

  el.scroll.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(state.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), { x: e.clientX, y: e.clientY });
  }, { passive: false });

  /* Click empty page = deselect + exit edit */
  el.page.addEventListener('mousedown', e => {
    if (e.target === el.page) {
      const sel = getSelected();
      if (sel && sel.editing) exitEditMode(sel);
      deselect();
    }
  });
  el.scroll.addEventListener('mousedown', e => {
    if (e.target === el.scroll || e.target === $('#canvasCenter')) deselect();
  });

  /* Global mousedown: exit edit if click outside the editing box */
  document.addEventListener('mousedown', e => {
    const sel = getSelected();
    if (sel && sel.editing && !sel.el.contains(e.target)) {
      exitEditMode(sel);
    }
  });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
    const inEdit = e.target.isContentEditable;

    if (e.key === 'Escape') {
      if (el.modal.classList.contains('open')) { if (!state.exporting) closeModal(); return; }
      if (inEdit) { e.target.blur(); return; }
      if (typing) { e.target.blur(); return; }
      deselect();
      return;
    }

    // Copy / cut / paste — work globally, ignore when typing in a form field
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !typing && !inEdit) {
      const k = e.key.toLowerCase();
      if (k === 'c') { e.preventDefault(); copySelected(); return; }
      if (k === 'x') { e.preventDefault(); cutSelected(); return; }
      if (k === 'v') { e.preventDefault(); pasteClipboard(); return; }
      if (k === 'd') { e.preventDefault(); duplicateSelected(); return; }
    }

    if (typing || inEdit) return;

    const b = getSelected();
    if (!b) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); removeBox(b); return;
    }
    if (e.key === 'F2' && b.type === 'text' && !b.colKey) {
      e.preventDefault(); enterEditMode(b); return;
    }
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft')  b.x -= step;
      if (e.key === 'ArrowRight') b.x += step;
      if (e.key === 'ArrowUp')    b.y -= step;
      if (e.key === 'ArrowDown')  b.y += step;
      b.el.style.left = b.x + 'px';
      b.el.style.top  = b.y + 'px';
    }
  });

  /* Drag & drop */
  let dragDepth = 0;
  const showHint = () => el.dropHint.classList.add('visible');
  const hideHint = () => el.dropHint.classList.remove('visible');

  window.addEventListener('dragenter', e => {
    if (!el.editor.classList.contains('active')) return;
    e.preventDefault();
    if (++dragDepth === 1) showHint();
  });
  window.addEventListener('dragover', e => {
    if (!el.editor.classList.contains('active')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  window.addEventListener('dragleave', () => {
    if (--dragDepth <= 0) { dragDepth = 0; hideHint(); }
  });
  window.addEventListener('drop', e => {
    e.preventDefault();
    dragDepth = 0; hideHint();
    if (!el.editor.classList.contains('active')) return;
    ingestFiles(e.dataTransfer.files);
  });

  /* Modal */
  el.modalClose.onclick = closeModal;
  el.modalCancel.onclick = () => {
    if (state.exporting) { state.cancelled = true; el.barLabel.textContent = 'Cancelling…'; }
    else closeModal();
  };
  el.modalConfirm.onclick = runExport;
  el.modal.addEventListener('mousedown', e => { if (e.target === el.modal) closeModal(); });

  /* Resize */
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (!el.editor.classList.contains('active')) return;
      refreshAllText();
    }, 200);
  });
}

/*─────────────────── BOOT ───────────────────*/
function boot() {
  hydrateIcons();
  buildFontSelect();
  renderPresets();
  renderTemplates();
  wireEvents();
  resetModalConfirm();
  applyTheme(currentTheme());

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  createDoc(794, 1123, 'A4 Portrait');
  el.colStrip.innerHTML = '<span class="col-hint">Load a spreadsheet to see its columns</span>';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();