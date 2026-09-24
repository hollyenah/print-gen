/*
   Print-Gen — application logic
 */
(function () {
'use strict';

/*─ ICONS─ */
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
  alert:     '<path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
  sun:  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
};
const svg = (n, c) =>
  `<svg class="ico ${c || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg>`;

function hydrateIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = svg(el.dataset.icon);
  });
}

function boot() {
  hydrateIcons();
  buildFontSelect();
  renderPresets();
  renderTemplates();
  wireEvents();
  resetModalConfirm();
  applyTheme(currentTheme());

  createDoc(794, 1123, 'A4 Portrait');
  el.colStrip.innerHTML = '<span class="col-hint">Load a spreadsheet to see its columns</span>';
}

/*─ CONSTANTS─ */
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

const FONTS = [
  { g: 'Sans-serif', list: ['Inter', 'Arial', 'Helvetica', 'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Tahoma', 'Trebuchet MS', 'Verdana'] },
  { g: 'Serif',      list: ['Georgia', 'Times New Roman', 'Garamond', 'Playfair Display', 'Merriweather'] },
  { g: 'Monospace',  list: ['Roboto Mono', 'Courier New', 'Consolas'] },
  { g: 'Display',    list: ['Impact', 'Comic Sans MS'] },
  { g: 'Arabic',     list: ['Noto Sans Arabic', 'Cairo', 'Tajawal', 'Amiri'] }
];

const LS_KEY = 'printgen.templates.v1';
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;

/*─ STATE─ */
const state = {
  doc: { w: 794, h: 1123, name: 'A4 Portrait' },
  boxes: [],
  files: [],
  activeFile: -1,
  row: 0,
  zoom: 1,
  selected: null,
  zTop: 1,
  seq: 0,
  exporting: false,
  cancelled: false
};

/*─ DOM─ */
const $ = s => document.querySelector(s);
const el = {
  landing: $('#landing'), editor: $('#editor'),
  page: $('#page'), stage: $('#canvasStage'), scroll: $('#canvasScroll'),
  presetGrid: $('#presetGrid'), templateList: $('#templateList'), tplCount: $('#tplCount'),
  docBadge: $('#docBadge'), colStrip: $('#colStrip'), stylebar: $('#stylebar'),
  sbText: $('#sbText'), sbStatic: $('#sbStatic'), staticInput: $('#staticInput'),
  fontSelect: $('#fontSelect'), textColor: $('#textColor'),
  strokeW: $('#strokeW'), strokeColor: $('#strokeColor'),
  boldBtn: $('#boldBtn'), italicBtn: $('#italicBtn'), alignBtn: $('#alignBtn'),
  fileList: $('#fileList'), rowList: $('#rowList'), navCounter: $('#navCounter'),
  fileInput: $('#fileInput'), imgInput: $('#imgInput'),
  zoomValue: $('#zoomValue'), dropHint: $('#dropHint'),
  modal: $('#modal'), modalTitle: $('#modalTitle'), modalSetup: $('#modalSetup'),
  modalProgress: $('#modalProgress'), modalRows: $('#modalRows'), modalSize: $('#modalSize'),
  pdfName: $('#pdfName'), barFill: $('#barFill'), barLabel: $('#barLabel'),
  exportLog: $('#exportLog'), modalCancel: $('#modalCancel'),
  modalConfirm: $('#modalConfirm'), modalClose: $('#modalClose')
};

/*
   LANDING
 */
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
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function setTemplates(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); }
  catch { alert('Storage is full — remove an old template or use smaller images.'); }
}

function renderTemplates() {
  const list = getTemplates();
  el.tplCount.textContent = list.length ? `${list.length} saved` : '';
  el.templateList.innerHTML = '';
  if (!list.length) {
    el.templateList.innerHTML = '<div class="empty-note">No templates yet. Build a layout and hit “Save template”.</div>';
    return;
  }
  list.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tpl-item';
    item.innerHTML = `
      <div class="tpl-thumb"></div>
      <div class="tpl-meta">
        <div class="tpl-name"></div>
        <div class="tpl-info">${Math.round(t.w)} × ${Math.round(t.h)} px · ${t.boxes.length} object${t.boxes.length !== 1 ? 's' : ''}${t.columns && t.columns.length ? ' · ' + t.columns.length + ' columns' : ''}</div>
      </div>
      <button class="tpl-del" title="Delete">${svg('trash')}</button>`;
    item.querySelector('.tpl-name').textContent = t.name;
    item.querySelector('.tpl-del').onclick = e => {
      e.stopPropagation();
      if (!confirm(`Delete template “${t.name}”?`)) return;
      setTemplates(getTemplates().filter(x => x.id !== t.id));
      renderTemplates();
    };
    item.onclick = () => loadTemplate(t);
    el.templateList.appendChild(item);
  });
}

function createDoc(w, h, name) {
  state.doc = { w: Math.round(w), h: Math.round(h), name: name || 'Custom' };
  state.boxes.forEach(b => b.el && b.el.remove());
  state.boxes = [];
  state.selected = null;
  state.zTop = 1;
  el.page.style.width = state.doc.w + 'px';
  el.page.style.height = state.doc.h + 'px';
  el.docBadge.textContent = `${state.doc.name} · ${state.doc.w} × ${state.doc.h} px`;
  updateStageSize();
  hideStylebar();
}

function openEditor(w, h, name, skipReset) {
  if (!skipReset) createDoc(w, h, name);
  el.landing.classList.remove('active');
  el.editor.classList.add('active');
  requestAnimationFrame(() => { fitZoom(); });
}

function goLanding() {
  deselect();
  el.editor.classList.remove('active');
  el.landing.classList.add('active');
  renderTemplates();
}

/*
   ZOOM
 */
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

/*
   TEXT MEASUREMENT
 */
let wrapProbe = null, wordProbe = null;

function ensureProbes() {
  if (wrapProbe) return;
  wrapProbe = document.createElement('div');
  wrapProbe.style.cssText =
    'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;' +
    'white-space:pre-wrap;overflow-wrap:normal;word-break:normal;line-height:1.15;';
  document.body.appendChild(wrapProbe);

  wordProbe = document.createElement('div');
  wordProbe.style.cssText =
    'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;';
  document.body.appendChild(wordProbe);
}

function fontCss(b) {
  return `font-family:${b.font};font-weight:${b.bold ? 700 : 400};font-style:${b.italic ? 'italic' : 'normal'};`;
}

function fitText(b) {
  const t = b.textEl;
  const text = t.textContent;
  const W = b.w, H = b.h;
  if (!text || W <= 2 || H <= 2) return;

  ensureProbes();
  const base = fontCss(b);

  wordProbe.style.cssText =
    'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;' +
    'white-space:nowrap;font-size:100px;' + base;

  const words = text.split(/\s+/).filter(Boolean);
  let maxWord = 0;
  for (const w of words) {
    wordProbe.textContent = w;
    const ww = wordProbe.offsetWidth;
    if (ww > maxWord) maxWord = ww;
    if (maxWord * W / 100 > 1500) break;
  }
  let hi = maxWord > 0 ? Math.floor(100 * W / maxWord) : 1500;
  hi = Math.max(1, Math.min(hi, 1500));

  wrapProbe.style.cssText =
    'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;' +
    `white-space:pre-wrap;overflow-wrap:normal;word-break:normal;line-height:1.15;width:${W}px;` + base;
  wrapProbe.textContent = text;

  let lo = 1, best = 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    wrapProbe.style.fontSize = mid + 'px';
    if (wrapProbe.offsetHeight <= H) { best = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  t.style.fontSize = best + 'px';
  b.fontSize = best;
}

function fitAll() { state.boxes.forEach(b => b.type === 'text' && fitText(b)); }

/*
   BOXES
 */
function newBox(partial) {
  return Object.assign({
    id: 'b' + (++state.seq),
    type: 'text',
    x: 60, y: 60, w: 300, h: 90,
    z: ++state.zTop,
    colKey: null,
    staticText: null,
    font: 'Arial',
    color: '#111111',
    bold: false,
    italic: false,
    align: 'left',
    strokeW: 0,
    strokeColor: '#000000',
    src: null
  }, partial || {});
}

function createBoxEl(b) {
  const box = document.createElement('div');
  box.className = 'obj';
  box.dataset.id = b.id;

  if (b.type === 'text') {
    const t = document.createElement('div');
    t.className = 'obj-text';
    box.appendChild(t);
    b.textEl = t;
  } else {
    const img = document.createElement('img');
    img.draggable = false;
    img.src = b.src;
    box.appendChild(img);
    b.imgEl = img;
  }

  const handles = document.createElement('div');
  handles.className = 'handles';
  ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].forEach(d => {
    const h = document.createElement('div');
    h.className = 'handle h-' + d;
    h.dataset.dir = d;
    handles.appendChild(h);
  });
  box.appendChild(handles);

  const del = document.createElement('button');
  del.className = 'obj-del';
  del.innerHTML = svg('x');
  del.onmousedown = e => { e.stopPropagation(); e.preventDefault(); removeBox(b); };
  box.appendChild(del);

  b.el = box;
  b.handlesEl = handles;
  return box;
}

function applyGeom(b) {
  const s = b.el.style;
  s.left = b.x + 'px';
  s.top = b.y + 'px';
  s.width = b.w + 'px';
  s.height = b.h + 'px';
  s.zIndex = b.z;
}

function applyTextStyle(b) {
  if (b.type !== 'text') return;
  const t = b.textEl;
  const rtl = ARABIC_RE.test(t.textContent);
  t.style.fontFamily = b.font;
  t.style.color = b.color;
  t.style.fontWeight = b.bold ? '700' : '400';
  t.style.fontStyle = b.italic ? 'italic' : 'normal';
  t.style.direction = rtl ? 'rtl' : 'ltr';
  t.style.textAlign = b.align;
  if (b.strokeW > 0) {
    t.style.webkitTextStroke = b.strokeW + 'px ' + b.strokeColor;
    t.style.paintOrder = 'stroke fill';
  } else {
    t.style.webkitTextStroke = '';
    t.style.paintOrder = '';
  }
}

function refreshText(b) {
  if (b.type !== 'text') return;
  let v = '';
  if (b.staticText !== null) v = b.staticText;
  else if (b.colKey && state.files[state.activeFile]) {
    const row = state.files[state.activeFile].rows[state.row] || {};
    if (row[b.colKey] !== undefined && row[b.colKey] !== null) v = String(row[b.colKey]);
  }
  if (b.textEl.textContent !== v) b.textEl.textContent = v;
  applyTextStyle(b);
  fitText(b);
}

function addBox(b, select) {
  state.boxes.push(b);
  el.page.appendChild(createBoxEl(b));
  applyGeom(b);
  if (b.type === 'text') refreshText(b);
  wireBox(b);
  if (select !== false) selectBox(b);
  return b;
}

function removeBox(b) {
  b.el.remove();
  const i = state.boxes.indexOf(b);
  if (i > -1) state.boxes.splice(i, 1);
  if (state.selected === b) deselect();
}

function wireBox(b) {
  b.el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('handle')) return;
    if (e.target.classList.contains('obj-del')) return;
    e.preventDefault();
    selectBox(b);
    startDrag(e, b);
  });
  b.handlesEl.querySelectorAll('.handle').forEach(h => {
    h.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      startResize(e, b, h.dataset.dir);
    });
  });
}

function startDrag(e, b) {
  const sx = e.clientX, sy = e.clientY;
  const ox = b.x, oy = b.y, z = state.zoom;
  const move = ev => {
    b.x = ox + (ev.clientX - sx) / z;
    b.y = oy + (ev.clientY - sy) / z;
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

  const move = ev => {
    const dx = (ev.clientX - sx) / z;
    const dy = (ev.clientY - sy) / z;
    let x = ox, y = oy, w = ow, h = oh;

    if (dir.includes('e')) w = Math.max(24, ow + dx);
    if (dir.includes('s')) h = Math.max(16, oh + dy);
    if (dir.includes('w')) { w = Math.max(24, ow - dx); x = ox + (ow - w); }
    if (dir.includes('n')) { h = Math.max(16, oh - dy); y = oy + (oh - h); }

    b.x = x; b.y = y; b.w = w; b.h = h;
    b.el.style.left = x + 'px';
    b.el.style.top = y + 'px';
    b.el.style.width = w + 'px';
    b.el.style.height = h + 'px';
    if (b.type === 'text') fitText(b);
  };
  const up = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
}

/*
   SELECTION
 */
function selectBox(b) {
  if (state.selected === b) return;
  if (state.selected) state.selected.el.classList.remove('selected');
  state.selected = b;

  if (!b) { hideStylebar(); return; }
  b.el.classList.add('selected');
  showStylebar(b);
}

function deselect() { selectBox(null); }

function showStylebar(b) {
  el.stylebar.classList.add('visible');
  if (b.type === 'image') {
    el.sbText.style.display = 'none';
    el.sbStatic.classList.remove('visible');
    return;
  }
  el.sbText.style.display = 'flex';
  if (b.staticText !== null) {
    el.sbStatic.classList.add('visible');
    el.staticInput.value = b.staticText;
  } else {
    el.sbStatic.classList.remove('visible');
  }
  el.fontSelect.value = b.font;
  el.textColor.value = b.color;
  el.strokeW.value = b.strokeW;
  el.strokeColor.value = b.strokeColor;
  el.boldBtn.classList.toggle('on', b.bold);
  el.italicBtn.classList.toggle('on', b.italic);
  const ai = { left: 'alignL', center: 'alignC', right: 'alignR' }[b.align];
  el.alignBtn.innerHTML = svg(ai);
}

function hideStylebar() { el.stylebar.classList.remove('visible'); }

/*
   FILES & DATA
 */
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

async function ingestFiles(fileList) {
  const arr = Array.from(fileList || []);
  let firstNew = -1;
  for (const f of arr) {
    if (f.type.startsWith('image/')) {
      const src = await readAsDataURL(f);
      addImageAtCenter(src);
      continue;
    }
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) continue;
    try {
      const data = await readDataFile(f);
      state.files.push(data);
      if (firstNew < 0) firstNew = state.files.length - 1;
    } catch (err) {
      alert(`Could not read “${f.name}”: ${err.message}`);
    }
  }
  if (state.files.length) {
    buildFileList();
    if (firstNew >= 0) switchFile(firstNew);
    else buildColumns();
  }
}

function readAsDataURL(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
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
  refreshAll();
}

function removeFile(i) {
  state.files.splice(i, 1);
  if (!state.files.length) {
    state.activeFile = -1;
    el.colStrip.innerHTML = '';
    el.rowList.innerHTML = '';
    el.navCounter.textContent = '0 / 0';
    buildFileList();
    refreshAll();
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
    b.onclick = () => assignColumn(c);
    el.colStrip.appendChild(b);
  });
}

function assignColumn(col) {
  const sel = state.selected;
  if (sel && sel.type === 'text') {
    sel.staticText = null;
    sel.colKey = col;
    refreshText(sel);
    showStylebar(sel);
    return;
  }
  const b = addBox(newBox({ colKey: col }));
  showStylebar(b);
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
  refreshAll();
}

function updateCounter() {
  const f = state.files[state.activeFile];
  el.navCounter.textContent = f ? `${state.row + 1} / ${f.rows.length}` : '0 / 0';
}

function refreshAll() {
  state.boxes.forEach(b => { if (b.type === 'text') refreshText(b); });
}

/*
   IMAGES
 */
function addImageAtCenter(src) {
  const w = Math.min(300, state.doc.w * 0.35);
  const h = w;
  addBox(newBox({
    type: 'image', src,
    x: Math.round((state.doc.w - w) / 2),
    y: Math.round((state.doc.h - h) / 2),
    w, h
  }));
}

/*
   TEMPLATES
 */
function serializeBoxes() {
  return state.boxes.map(b => ({
    type: b.type,
    x: b.x, y: b.y, w: b.w, h: b.h, z: b.z,
    colKey: b.colKey, staticText: b.staticText,
    font: b.font, color: b.color, bold: b.bold, italic: b.italic,
    align: b.align, strokeW: b.strokeW, strokeColor: b.strokeColor,
    src: b.type === 'image' ? b.src : undefined
  }));
}

function saveTemplate() {
  const f = state.files[state.activeFile];
  const suggested = state.doc.name !== 'Custom' ? state.doc.name : 'My template';
  const name = prompt('Template name:', suggested);
  if (name === null) return;
  const tpl = {
    id: 't' + Date.now(),
    name: (name.trim() || 'Untitled'),
    w: state.doc.w, h: state.doc.h, docName: state.doc.name,
    columns: f ? f.columns.slice() : [],
    boxes: serializeBoxes(),
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
    t.boxes.forEach(bd => {
      const b = newBox(bd);
      b.z = bd.z; state.zTop = Math.max(state.zTop, bd.z);
      addBox(b, false);
    });
    state.zTop = Math.max(state.zTop, t.boxes.length + 1);
    fitAll();
  });
}

/*
   EXPORT
 */
function logLine(html) {
  const d = document.createElement('div');
  d.className = 'console-line';
  d.innerHTML = html;
  el.exportLog.appendChild(d);
  while (el.exportLog.children.length > 400) el.exportLog.removeChild(el.exportLog.firstChild);
  el.exportLog.scrollTop = el.exportLog.scrollHeight;
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

  // page setup
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

  // raster scale
  const maxSide = Math.max(state.doc.w, state.doc.h);
  const scale = Math.max(1, Math.min(2.5, 2200 / maxSide));

  logLine(`<span class="dim">›</span> Page <span class="ok">${state.doc.w}×${state.doc.h}px</span>`);
  logLine(`<span class="dim">›</span> ${total} records · raster ×${scale.toFixed(2)}`);

  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(r));

  const t0 = performance.now();

  for (let i = 0; i < total; i++) {
    if (state.cancelled) break;

    state.row = i;
    refreshAll();

    const row = f.rows[i];
    const label = String(Object.values(row)[0] ?? `Row ${i + 1}`).slice(0, 60);

    // wait for layout + fonts
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    let dataUrl;
    try {
      dataUrl = await domtoimage.toJpeg(el.page, {
        quality: 0.94,
        bgcolor: '#ffffff',
        width: Math.round(state.doc.w * scale),
        height: Math.round(state.doc.h * scale),
        style: { boxShadow: 'none', transform: 'none' }
      });
    } catch (err) {
      logLine(`<span class="dim">✕ row ${i + 1} failed — ${err.message}</span>`);
      continue;
    }

    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH);

    const pct = Math.round(((i + 1) / total) * 100);
    el.barFill.style.width = pct + '%';
    el.barLabel.textContent = `${i + 1} / ${total}`;

    const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    logLine(`<span class="dim">${stamp}</span> <span class="ok">✓</span> ${i + 1}/${total} — ${escapeHtml(label)}`);
  }

  state.row = savedRow;
  refreshAll();
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
  await new Promise(r => setTimeout(r, 120));
  pdf.save(name + '.pdf');

  el.barLabel.textContent = `Saved ${total} pages · ${name}.pdf`;
  el.modalCancel.textContent = 'Close';
  el.modalConfirm.classList.remove('hidden');
  el.modalConfirm.querySelector('span').textContent = 'Close';
  el.modalConfirm.onclick = () => { el.modal.classList.remove('open'); resetModalConfirm(); };
  state.exporting = false;
}

function resetModalConfirm() {
  el.modalConfirm.onclick = runExport;
  el.modalConfirm.querySelector('span').textContent = 'Generate';
  el.modalCancel.textContent = 'Cancel';
  el.modalConfirm.classList.remove('hidden');
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/*
   THEME
 */
function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('printgen.theme', t); } catch (e) {}
  const icon = t === 'dark' ? 'sun' : 'moon';
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.innerHTML = svg(icon);
    b.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

function toggleTheme() {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

/*
   TOAST
 */
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
  }, 1800);
}

/*
   WIRING
 */
function buildFontSelect() {
  el.fontSelect.innerHTML = '';
  FONTS.forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.g;
    g.list.forEach(f => {
      const o = document.createElement('option');
      o.value = f;
      o.textContent = f;
      o.style.fontFamily = `'${f}', sans-serif`;
      og.appendChild(o);
    });
    el.fontSelect.appendChild(og);
  });
  el.fontSelect.value = 'Arial';
}

function wireEvents() {
  /* landing */
  $('#createCustom').onclick = () => {
    const w = parseFloat($('#cw').value);
    const h = parseFloat($('#ch').value);
    const u = $('#cu').value;
    if (!(w > 0) || !(h > 0)) { alert('Enter a valid width and height.'); return; }
    const px = UNIT_PX[u];
    openEditor(w * px, h * px, `${w}×${h} ${u}`);
  };

  /* editor top */
  $('#backBtn').onclick = goLanding;
  $('#addTextBtn').onclick = () => showStylebar(addBox(newBox({})));
  $('#addStaticBtn').onclick = () => {
    const b = addBox(newBox({ staticText: '' }));
    showStylebar(b);
    setTimeout(() => { el.staticInput.focus(); el.staticInput.select(); }, 40);
  };
  $('#addImageBtn').onclick = () => el.imgInput.click();
  $('#saveTplBtn').onclick = saveTemplate;
  $('#exportBtn').onclick = openExportModal;
        const tl = document.getElementById('themeLanding');
        const te = document.getElementById('themeEditor');
        if (tl) tl.onclick = toggleTheme;
        if (te) te.onclick = toggleTheme;

  el.imgInput.onchange = async e => {
    const files = e.target.files;
    for (const f of Array.from(files)) addImageAtCenter(await readAsDataURL(f));
    e.target.value = '';
  };
  $('#addFileBtn').onclick = () => el.fileInput.click();
  el.fileInput.onchange = e => { ingestFiles(e.target.files); e.target.value = ''; };

  /* style bar */
  el.staticInput.oninput = () => {
    const b = state.selected;
    if (!b || b.staticText === null) return;
    b.staticText = el.staticInput.value;
    refreshText(b);
  };
  el.fontSelect.onchange = () => {
    const b = state.selected; if (!b) return;
    b.font = el.fontSelect.value;
    refreshText(b);
  };
  el.textColor.oninput = () => {
    const b = state.selected; if (!b) return;
    b.color = el.textColor.value;
    applyTextStyle(b);
  };
  el.strokeW.oninput = () => {
    const b = state.selected; if (!b) return;
    b.strokeW = Math.max(0, parseFloat(el.strokeW.value) || 0);
    applyTextStyle(b);
  };
  el.strokeColor.oninput = () => {
    const b = state.selected; if (!b) return;
    b.strokeColor = el.strokeColor.value;
    applyTextStyle(b);
  };
  el.boldBtn.onclick = () => {
    const b = state.selected; if (!b) return;
    b.bold = !b.bold;
    el.boldBtn.classList.toggle('on', b.bold);
    refreshText(b);
  };
  el.italicBtn.onclick = () => {
    const b = state.selected; if (!b) return;
    b.italic = !b.italic;
    el.italicBtn.classList.toggle('on', b.italic);
    refreshText(b);
  };
  const alignOrder = ['left', 'center', 'right'];
  const alignIcon  = { left: 'alignL', center: 'alignC', right: 'alignR' };
  el.alignBtn.onclick = () => {
    const b = state.selected; if (!b) return;
    b.align = alignOrder[(alignOrder.indexOf(b.align) + 1) % 3];
    el.alignBtn.innerHTML = svg(alignIcon[b.align]);
    applyTextStyle(b);
  };

  /* z-order */
  $('#zFront').onclick = () => { const b = state.selected; if (b) b.el.style.zIndex = ++state.zTop; };
  $('#zUp').onclick    = () => { const b = state.selected; if (b) b.el.style.zIndex = ++state.zTop; };
  $('#zDown').onclick  = () => {
    const b = state.selected; if (!b) return;
    b.el.style.zIndex = Math.max(0, (parseInt(b.el.style.zIndex) || 1) - 1);
  };
  $('#zBack').onclick  = () => { const b = state.selected; if (b) b.el.style.zIndex = 0; };
  $('#deleteBtn').onclick = () => { if (state.selected) removeBox(state.selected); };

  /* rows nav */
  $('#prevBtn').onclick = () => goRow(state.row - 1);
  $('#nextBtn').onclick = () => goRow(state.row + 1);

  /* zoom */
  $('#zoomIn').onclick  = () => setZoom(state.zoom * 1.2);
  $('#zoomOut').onclick = () => setZoom(state.zoom / 1.2);
  $('#zoomFit').onclick = fitZoom;
  el.zoomValue.onclick  = () => { setZoom(1); };

  el.scroll.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(state.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), { x: e.clientX, y: e.clientY });
  }, { passive: false });

  /* page background deselect */
  el.page.addEventListener('mousedown', e => { if (e.target === el.page) deselect(); });
  el.scroll.addEventListener('mousedown', e => {
    if (e.target === el.scroll || e.target === $('#canvasCenter')) deselect();
  });

  /* keyboard */
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select';

    if (e.key === 'Escape') {
      if (el.modal.classList.contains('open')) { if (!state.exporting) closeModal(); return; }
      if (typing) { e.target.blur(); return; }
      deselect();
      return;
    }
    if (typing) return;

    const b = state.selected;
    if (!b) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') return;
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); removeBox(b); return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      const copy = newBox(Object.assign({}, b, { id: undefined }));
      copy.z = ++state.zTop;
      copy.x = b.x + 16; copy.y = b.y + 16;
      addBox(copy);
      return;
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

  /* drag & drop */
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
  window.addEventListener('dragleave', e => {
    if (--dragDepth <= 0) { dragDepth = 0; hideHint(); }
  });
  window.addEventListener('drop', e => {
    e.preventDefault();
    dragDepth = 0; hideHint();
    if (!el.editor.classList.contains('active')) return;
    ingestFiles(e.dataTransfer.files);
  });

  /* modal */
  el.modalClose.onclick = closeModal;
  el.modalCancel.onclick = () => {
    if (state.exporting) { state.cancelled = true; el.barLabel.textContent = 'Cancelling…'; }
    else closeModal();
  };
  el.modalConfirm.onclick = runExport;
  el.modal.addEventListener('mousedown', e => { if (e.target === el.modal) closeModal(); });

  /* resize */
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (el.editor.classList.contains('active')) fitAll(); }, 200);
  });
}

/*
   BOOT
 */
function boot() {
  hydrateIcons();
  buildFontSelect();
  renderPresets();
  renderTemplates();
  wireEvents();
  resetModalConfirm();

  createDoc(794, 1123, 'A4 Portrait');
  el.colStrip.innerHTML = '<span class="col-hint">Load a spreadsheet to see its columns</span>';

  const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();