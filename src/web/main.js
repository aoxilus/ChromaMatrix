/**
 * ChromaMatrix - Main Web Application Controller
 * Connects Encoder Studio (with AES-256-GCM Encryption), Vision Decoder,
 * Sheet Capacity Report, Fidelity Benchmark, and Theory Visualizer.
 * 
 * 🥑 by aoxilus (https://github.com/aoxilus) · CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
 */

import {
  PALETTE_MODES,
  getPalette,
  analyzePaletteSeparation,
  rgbToLab,
  deltaE2000,
  encodeChromaMatrix,
  matrixToSvg,
  matrixToRgbaBuffer,
  detectCornerFiducials,
  rectifyMatrix,
  decodeChromaMatrix,
  BENCHMARK_MODES,
  generateBenchmarkTarget,
  benchmarkTargetToSvg,
  benchmarkTargetToRgbaBuffer,
  analyzeBenchmarkScan,
  encryptPayload,
  decryptPayload,
  isPayloadEncrypted,
  PAPER_SIZES,
  generateCapacityReport,
  CELL_TYPES
} from '../core/index.js';

import { CameraManager } from './camera.js';
import { initI18n, setLang, t } from './i18n.js?v=wiki-20260924';

// Application State
const state = {
  activeTab: 'studio',
  encoder: {
    text: '',
    mode: PALETTE_MODES.PALETTE_16,
    eccRatio: 0.25,
    dotShape: 'circle',
    cellSize: 16,
    isEncrypted: false,
    password: '',
    currentMatrix: null
  },
  decoder: {
    sourceImage: null,
    corners: null,
    dragCornerIdx: -1,
    cameraManager: null,
    lastDecodedRaw: null
  },
  benchmark: {
    mode: BENCHMARK_MODES.TEST_64,
    currentTarget: null,
    currentReport: null
  },
  capacity: {
    paperKey: 'LETTER',
    eccRatio: 0.25
  }
};

// DOM References
const DOM = {
  tabs: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),

  // Studio Elements
  presetSelector: document.getElementById('preset-selector'),
  inputText: document.getElementById('input-text'),
  btnUploadFileEncoder: document.getElementById('btn-upload-file-encoder'),
  fileInputEncoder: document.getElementById('file-input-encoder'),
  paletteMode: document.getElementById('palette-mode'),
  eccLevel: document.getElementById('ecc-level'),
  dotShape: document.getElementById('dot-shape'),
  cellSize: document.getElementById('cell-size'),
  cellSizeVal: document.getElementById('cell-size-val'),
  studioPaletteBar: document.getElementById('studio-palette-bar'),
  matrixPreviewStage: document.getElementById('matrix-canvas-wrapper'),
  btnDownloadPng: document.getElementById('btn-download-png'),
  btnDownloadSvg: document.getElementById('btn-download-svg'),
  btnOpenNewTab: document.getElementById('btn-open-newtab'),
  btnCopyImage: document.getElementById('btn-copy-image'),
  btnPrintSheet: document.getElementById('btn-print-sheet'),

  // Stats
  statGridSize: document.getElementById('stat-grid-size'),
  statPayloadLen: document.getElementById('stat-payload-len'),
  statCodewordLen: document.getElementById('stat-codeword-len'),
  statDotCount: document.getElementById('stat-dot-count'),

  // Inspector
  chipColor: document.getElementById('chip-color'),
  chipTitle: document.getElementById('chip-title'),
  chipCoords: document.getElementById('chip-coords'),
  chipColorInfo: document.getElementById('chip-color-info'),

  // Decoder Elements
  btnModeUpload: document.getElementById('btn-mode-upload'),
  btnModeCamera: document.getElementById('btn-mode-camera'),
  dropZoneDecoder: document.getElementById('decoder-drop-zone'),
  fileInputDecoder: document.getElementById('file-input-decoder'),
  btnBrowseFile: document.getElementById('btn-browse-file'),
  cameraPanel: document.getElementById('camera-panel'),
  webcamVideo: document.getElementById('webcam-video'),
  btnCaptureFrame: document.getElementById('btn-capture-frame'),
  btnStopCamera: document.getElementById('btn-stop-camera'),
  btnLoadSampleClean: document.getElementById('btn-load-sample-clean'),
  btnLoadSampleNoisy: document.getElementById('btn-load-sample-noisy'),
  canvasSourceQuad: document.getElementById('canvas-source-quad'),
  canvasRectifiedDots: document.getElementById('canvas-rectified-dots'),
  resultStatusBadge: document.getElementById('result-status-badge'),
  decStatGrid: document.getElementById('dec-stat-grid'),
  decStatMode: document.getElementById('dec-stat-mode'),
  decStatEcc: document.getElementById('dec-stat-ecc'),
  decStatDeltaE: document.getElementById('dec-stat-deltae'),
  decodedTextOutput: document.getElementById('decoded-text-output'),
  btnCopyDecoded: document.getElementById('btn-copy-decoded'),
  btnSaveDecoded: document.getElementById('btn-save-decoded'),

  // Capacity Elements
  capacityPaperSelect: document.getElementById('capacity-paper-select'),
  capacityEccSelect: document.getElementById('capacity-ecc-select'),
  capacityTableContainer: document.getElementById('capacity-table-container'),

  // Benchmark Elements
  benchmarkTestMode: document.getElementById('benchmark-test-mode'),
  btnGenBenchmarkTarget: document.getElementById('btn-gen-benchmark-target'),
  dropZoneBenchmark: document.getElementById('benchmark-drop-zone'),
  fileInputBenchmark: document.getElementById('file-input-benchmark'),
  btnBrowseBenchmark: document.getElementById('btn-browse-benchmark'),
  btnRunSyntheticBenchmark: document.getElementById('btn-run-synthetic-benchmark'),
  benchRatingBadge: document.getElementById('bench-rating-badge'),
  benchRecommendationTitle: document.getElementById('bench-recommendation-title'),
  benchRecommendationDesc: document.getElementById('bench-recommendation-desc'),
  benchStatCount: document.getElementById('bench-stat-count'),
  benchStatDrift: document.getElementById('bench-stat-drift'),
  benchStatSep: document.getElementById('bench-stat-sep'),
  benchStatConfused: document.getElementById('bench-stat-confused'),
  patchGridDisplay: document.getElementById('patch-grid-display'),

  // Language
  langSelector: document.getElementById('lang-selector'),

  // Theory
  theoryPaletteExplorer: document.getElementById('theory-palette-explorer')
};

// ==========================================
// 1. Initialization & Navigation
// ==========================================
function init() {
  initI18n();

  // Language switcher
  if (DOM.langSelector) {
    DOM.langSelector.addEventListener('change', (e) => {
      setLang(e.target.value);
      renderStudioPaletteBar();
      renderStudioMatrix();
      if (state.activeTab === 'wiki') {
        renderCapacityTable();
        renderTheoryExplorer();
      }
    });
  }

  initTabs();
  initStudio();
  initDecoder();
  initCapacity();
  initBenchmark();
  initTheory();

  renderStudioMatrix();
}

function switchTab(tabId) {
  if (tabId === 'capacity' || tabId === 'theory') tabId = 'wiki';
  const validTabs = ['studio', 'decoder', 'wiki', 'benchmark'];
  if (!validTabs.includes(tabId)) tabId = 'studio';

  DOM.tabs.forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  DOM.tabPanels.forEach(p => {
    const isWikiPanel = tabId === 'wiki' && (p.id === 'tab-wiki' || p.id === 'tab-theory');
    p.classList.toggle('active', p.id === `tab-${tabId}` || isWikiPanel);
  });

  state.activeTab = tabId;
  window.location.hash = '#' + tabId;

  if (tabId === 'wiki') {
    renderCapacityTable();
    renderTheoryExplorer();
  }
}

function initTabs() {
  DOM.tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Handle URL hash on initial page load
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) {
    switchTab(hash);
  }

  // Handle browser forward/back buttons
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '').toLowerCase();
    if (newHash && newHash !== state.activeTab) {
      switchTab(newHash);
    }
  });
}

// ==========================================
// 2. Matrix Studio (Encoder) Controller
// ==========================================
function initStudio() {
  DOM.inputText.addEventListener('input', () => renderStudioMatrix());

  DOM.presetSelector.addEventListener('change', (e) => {
    const val = e.target.value;

    // Maximum density
    if (val === 'maximum') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_256;
      DOM.eccLevel.value = '0.15';
      DOM.dotShape.value = 'square';
      DOM.cellSize.value = '14';
      DOM.cellSizeVal.textContent = '14 px';
    } else if (val === 'dense') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_64;
      DOM.eccLevel.value = '0.15';
      DOM.dotShape.value = 'rounded';
      DOM.cellSize.value = '16';
      DOM.cellSizeVal.textContent = '16 px';
    } else if (val === 'balanced') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_16;
      DOM.eccLevel.value = '0.25';
      DOM.dotShape.value = 'circle';
      DOM.cellSize.value = '18';
      DOM.cellSizeVal.textContent = '18 px';
    } else if (val === 'text') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_ASCII_95;
      DOM.eccLevel.value = '0.15';
      DOM.dotShape.value = 'rounded';
      DOM.cellSize.value = '16';
      DOM.cellSizeVal.textContent = '16 px';

    // Paper presets
    } else if (val === 'photo') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_16;
      DOM.eccLevel.value = '0.25';
      DOM.dotShape.value = 'circle';
      DOM.cellSize.value = '18';
      DOM.cellSizeVal.textContent = '18 px';
    } else if (val === 'phone') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_8;
      DOM.eccLevel.value = '0.35';
      DOM.dotShape.value = 'circle';
      DOM.cellSize.value = '22';
      DOM.cellSizeVal.textContent = '22 px';
    } else if (val === 'sticker') {
      DOM.paletteMode.value = PALETTE_MODES.PALETTE_8;
      DOM.eccLevel.value = '0.35';
      DOM.dotShape.value = 'circle';
      DOM.cellSize.value = '20';
      DOM.cellSizeVal.textContent = '20 px';

    }

    renderStudioPaletteBar();
    renderStudioMatrix();
  });

  DOM.btnUploadFileEncoder.addEventListener('click', () => DOM.fileInputEncoder.click());
  DOM.fileInputEncoder.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        DOM.inputText.value = evt.target.result;
        renderStudioMatrix();
      };
      reader.readAsText(file);
    }
  });

  DOM.paletteMode.addEventListener('change', () => {
    renderStudioPaletteBar();
    renderStudioMatrix();
  });
  DOM.eccLevel.addEventListener('change', () => renderStudioMatrix());
  DOM.dotShape.addEventListener('change', () => renderStudioMatrix());

  DOM.cellSize.addEventListener('input', (e) => {
    DOM.cellSizeVal.textContent = `${e.target.value} px`;
    renderStudioMatrix();
  });

  DOM.btnDownloadPng.addEventListener('click', downloadMatrixPng);
  DOM.btnDownloadSvg.addEventListener('click', downloadMatrixSvg);
  DOM.btnOpenNewTab.addEventListener('click', openMatrixInNewTab);
  DOM.btnCopyImage.addEventListener('click', copyMatrixImageToClipboard);
  DOM.btnPrintSheet.addEventListener('click', () => window.print());

  renderStudioPaletteBar();
}

function renderStudioPaletteBar() {
  const mode = DOM.paletteMode.value;
  const palette = getPalette(mode);
  DOM.studioPaletteBar.innerHTML = '';

  palette.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch-item';
    swatch.style.backgroundColor = color.hex;
    swatch.title = `${color.name} (${color.hex})`;
    swatch.addEventListener('click', () => inspectColor(color));
    DOM.studioPaletteBar.appendChild(swatch);
  });
}

async function renderStudioMatrix() {
  const text = DOM.inputText.value || ' ';
  const mode = DOM.paletteMode.value;
  const eccRatio = parseFloat(DOM.eccLevel.value);
  const cellSize = parseInt(DOM.cellSize.value, 10);
  const dotShape = DOM.dotShape.value;

  try {
    const payloadBytes = new TextEncoder().encode(text);
    const matrix = encodeChromaMatrix(payloadBytes, { mode, eccRatio });
    state.encoder.currentMatrix = matrix;

    DOM.statGridSize.textContent = `${matrix.gridSize} x ${matrix.gridSize}`;
    DOM.statPayloadLen.textContent = `${matrix.rawByteLength} B`;
    DOM.statCodewordLen.textContent = `${matrix.totalCodewordBytes} B`;
    DOM.statDotCount.textContent = `${matrix.symbolCount} dots`;

    const svgString = matrixToSvg(matrix, { cellSize, dotShape, margin: 2 });
    DOM.matrixPreviewStage.innerHTML = svgString;

    attachSvgDotEvents(matrix, cellSize);
  } catch (err) {
    console.error('Failed to encode matrix:', err);
  }
}

function attachSvgDotEvents(matrix, cellSize) {
  const svg = DOM.matrixPreviewStage.querySelector('svg');
  if (!svg) return;

  const margin = 2;
  const palette = getPalette(matrix.mode);

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const scaleX = (matrix.gridSize + margin * 2) * cellSize / rect.width;
    const scaleY = (matrix.gridSize + margin * 2) * cellSize / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const gx = Math.floor(mouseX / cellSize) - margin;
    const gy = Math.floor(mouseY / cellSize) - margin;

    if (gx >= 0 && gx < matrix.gridSize && gy >= 0 && gy < matrix.gridSize) {
      const cell = matrix.grid[gy][gx];
      inspectCell(cell, gx, gy, palette);
    }
  });
}

function inspectCell(cell, gx, gy, palette) {
  DOM.chipColor.style.backgroundColor = cell.color;
  let typeName = 'DATA';
  if (cell.type === CELL_TYPES.FINDER) typeName = 'FINDER (Reserved)';
  else if (cell.type === CELL_TYPES.TIMING) typeName = 'TIMING TRACK';
  else if (cell.type === CELL_TYPES.CALIBRATION) typeName = 'CALIBRATION SWATCH';
  else if (cell.type === CELL_TYPES.HEADER) typeName = 'HEADER METADATA';

  let title = `Cell at (${gx}, ${gy})`;
  if (cell.symbolIndex >= 0 && palette[cell.symbolIndex]) {
    title = `${palette[cell.symbolIndex].name}`;
  }

  DOM.chipTitle.textContent = title;
  DOM.chipCoords.textContent = `Grid Pos: (${gx}, ${gy}) | Type: ${typeName}`;

  const lab = rgbToLab(
    parseInt(cell.color.slice(1, 3), 16),
    parseInt(cell.color.slice(3, 5), 16),
    parseInt(cell.color.slice(5, 7), 16)
  );

  DOM.chipColorInfo.textContent = `HEX: ${cell.color} | CIELAB: L*${lab.L.toFixed(0)} a*${lab.a.toFixed(0)} b*${lab.b.toFixed(0)}`;
}

function inspectColor(color) {
  DOM.chipColor.style.backgroundColor = color.hex;
  DOM.chipTitle.textContent = color.name;
  DOM.chipCoords.textContent = `Palette Index: #${color.index}`;
  DOM.chipColorInfo.textContent = `HEX: ${color.hex} | CIELAB: L*${color.lab.L.toFixed(0)} a*${color.lab.a.toFixed(0)} b*${color.lab.b.toFixed(0)}`;
}

function triggerFileDownload(blobOrUrl, filename) {
  let url = blobOrUrl;
  let isBlob = false;
  if (blobOrUrl instanceof Blob) {
    url = URL.createObjectURL(blobOrUrl);
    isBlob = true;
  }

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
    if (isBlob) {
      URL.revokeObjectURL(url);
    }
  }, 1000);
}

function downloadMatrixSvg() {
  if (!state.encoder.currentMatrix) return;
  const svg = matrixToSvg(state.encoder.currentMatrix, {
    cellSize: parseInt(DOM.cellSize.value, 10),
    dotShape: DOM.dotShape.value
  });
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  triggerFileDownload(blob, `chromamatrix_${Date.now()}.svg`);
}

function downloadMatrixPng() {
  if (!state.encoder.currentMatrix) return;
  const buffer = matrixToRgbaBuffer(state.encoder.currentMatrix, {
    cellSize: parseInt(DOM.cellSize.value, 10),
    dotShape: DOM.dotShape.value
  });

  const canvas = document.createElement('canvas');
  canvas.width = buffer.width;
  canvas.height = buffer.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(buffer.width, buffer.height);
  imgData.data.set(buffer.data);
  ctx.putImageData(imgData, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;
    triggerFileDownload(blob, `chromamatrix_${Date.now()}.png`);
  }, 'image/png');
}

function openMatrixInNewTab() {
  if (!state.encoder.currentMatrix) return;
  const buffer = matrixToRgbaBuffer(state.encoder.currentMatrix, {
    cellSize: parseInt(DOM.cellSize.value, 10),
    dotShape: DOM.dotShape.value
  });

  const canvas = document.createElement('canvas');
  canvas.width = buffer.width;
  canvas.height = buffer.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(buffer.width, buffer.height);
  imgData.data.set(buffer.data);
  ctx.putImageData(imgData, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  const newWin = window.open();
  if (newWin) {
    newWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>ChromaMatrix Preview (${buffer.width}x${buffer.height})</title></head>
        <body style="margin:0; background:#0B0F19; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; color:#FFFFFF;">
          <h3 style="margin-bottom:12px;">ChromaMatrix Preview (${buffer.width} x ${buffer.height} px)</h3>
          <img src="${dataUrl}" style="background:#FFFFFF; padding:16px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.8); max-width:90vw; max-height:80vh; object-fit:contain;"/>
          <p style="margin-top:12px; color:#9CA3AF; font-size:14px;">Right click image to "Save Image As..." or copy directly.</p>
        </body>
      </html>
    `);
    newWin.document.close();
  }
}

async function copyMatrixImageToClipboard() {
  if (!state.encoder.currentMatrix) return;
  const buffer = matrixToRgbaBuffer(state.encoder.currentMatrix, {
    cellSize: parseInt(DOM.cellSize.value, 10),
    dotShape: DOM.dotShape.value
  });

  const canvas = document.createElement('canvas');
  canvas.width = buffer.width;
  canvas.height = buffer.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(buffer.width, buffer.height);
  imgData.data.set(buffer.data);
  ctx.putImageData(imgData, 0, 0);

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('ChromaMatrix image copied to clipboard!');
    } catch {
      alert('Clipboard write not permitted by browser permissions. You can use "Open in Tab" or "Download PNG".');
    }
  }, 'image/png');
}

// ==========================================
// 3. Scan & Decode (Vision) Controller
// ==========================================
function initDecoder() {
  DOM.btnModeUpload.addEventListener('click', () => {
    DOM.btnModeUpload.classList.add('active');
    DOM.btnModeCamera.classList.remove('active');
    DOM.dropZoneDecoder.style.display = 'block';
    DOM.cameraPanel.style.display = 'none';
    if (state.decoder.cameraManager) state.decoder.cameraManager.stopCamera();
  });

  DOM.btnModeCamera.addEventListener('click', async () => {
    DOM.btnModeCamera.classList.add('active');
    DOM.btnModeUpload.classList.remove('active');
    DOM.dropZoneDecoder.style.display = 'none';
    DOM.cameraPanel.style.display = 'flex';

    if (!state.decoder.cameraManager) {
      state.decoder.cameraManager = new CameraManager(DOM.webcamVideo);
    }
    try {
      await state.decoder.cameraManager.startCamera();
    } catch {
      alert('Could not access webcam device.');
    }
  });

  DOM.btnCaptureFrame.addEventListener('click', () => {
    if (!state.decoder.cameraManager) return;
    const frameData = state.decoder.cameraManager.captureFrame(800);
    if (frameData) {
      processInputImage(frameData);
    }
  });

  DOM.btnStopCamera.addEventListener('click', () => {
    if (state.decoder.cameraManager) state.decoder.cameraManager.stopCamera();
  });

  DOM.dropZoneDecoder.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropZoneDecoder.classList.add('drag-over');
  });

  DOM.dropZoneDecoder.addEventListener('dragleave', () => {
    DOM.dropZoneDecoder.classList.remove('drag-over');
  });

  DOM.dropZoneDecoder.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropZoneDecoder.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  // Make entire drop zone clickable
  DOM.dropZoneDecoder.addEventListener('click', () => {
    DOM.fileInputDecoder.value = '';
    DOM.fileInputDecoder.click();
  });

  DOM.btnBrowseFile.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.fileInputDecoder.value = '';
    DOM.fileInputDecoder.click();
  });

  DOM.fileInputDecoder.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });

  // Global Clipboard Paste (Ctrl+V) anywhere on page
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          switchTab('decoder');
          handleImageFile(file);
          break;
        }
      }
    }
  });

  if (DOM.btnLoadSampleClean) DOM.btnLoadSampleClean.addEventListener('click', loadSampleClean);
  if (DOM.btnLoadSampleNoisy) DOM.btnLoadSampleNoisy.addEventListener('click', loadSampleNoisy);

  if (DOM.btnCopyDecoded) {
    DOM.btnCopyDecoded.addEventListener('click', () => {
      navigator.clipboard.writeText(DOM.decodedTextOutput.textContent);
      alert('Decoded text copied to clipboard!');
    });
  }

  if (DOM.btnSaveDecoded) {
    DOM.btnSaveDecoded.addEventListener('click', () => {
      const text = DOM.decodedTextOutput.textContent;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      triggerFileDownload(blob, `decoded_data_${Date.now()}.txt`);
    });
  }

  initCanvasCornerDragging();
}

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      processInputImage(imgData);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function loadSampleClean() {
  const text = 'Clean Sample: ChromaMatrix Optical Data on Paper';
  const matrix = encodeChromaMatrix(text, { mode: PALETTE_MODES.PALETTE_16 });
  const buffer = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2 });
  processInputImage(buffer);
}

function loadSampleNoisy() {
  const text = 'Noisy Photo: 4-Corner Homography Unwarping & Self-Calibrating Swatches';
  const matrix = encodeChromaMatrix(text, { mode: PALETTE_MODES.PALETTE_16, eccRatio: 0.3 });
  const buffer = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2 });

  const noisy = {
    width: buffer.width,
    height: buffer.height,
    data: new Uint8ClampedArray(buffer.data)
  };

  for (let y = 0; y < noisy.height; y++) {
    for (let x = 0; x < noisy.width; x++) {
      const idx = (y * noisy.width + x) * 4;
      const lightFactor = 1.0 - (x / noisy.width) * 0.18 + (y / noisy.height) * 0.12;
      noisy.data[idx] = Math.min(255, Math.max(0, Math.round(noisy.data[idx] * lightFactor + 8 + (Math.random() - 0.5) * 12)));
      noisy.data[idx + 1] = Math.min(255, Math.max(0, Math.round(noisy.data[idx + 1] * lightFactor + 4 + (Math.random() - 0.5) * 12)));
      noisy.data[idx + 2] = Math.min(255, Math.max(0, Math.round(noisy.data[idx + 2] * lightFactor - 6 + (Math.random() - 0.5) * 12)));
    }
  }

  processInputImage(noisy);
}

async function loadSampleEncrypted() {
  const secretText = 'CONFIDENTIAL: High-security paper payload protected with AES-256-GCM encryption!';
  const plainBytes = new TextEncoder().encode(secretText);
  const password = 'secretpassword';
  const encryptedBytes = await encryptPayload(plainBytes, password);

  const matrix = encodeChromaMatrix(encryptedBytes, { mode: PALETTE_MODES.PALETTE_16 });
  const buffer = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2 });

  DOM.decoderPassword.value = password;
  processInputImage(buffer);
}

function processInputImage(imageData) {
  state.decoder.sourceImage = imageData;
  const det = detectCornerFiducials(imageData);
  state.decoder.corners = det.corners;

  drawSourceQuadCanvas();
  runDecoder();
}

function drawSourceQuadCanvas() {
  if (!state.decoder.sourceImage || !state.decoder.corners) return;

  const canvas = DOM.canvasSourceQuad;
  const ctx = canvas.getContext('2d');
  const img = state.decoder.sourceImage;

  canvas.width = img.width;
  canvas.height = img.height;

  const imgData = ctx.createImageData(img.width, img.height);
  imgData.data.set(img.data);
  ctx.putImageData(imgData, 0, 0);

  const pts = state.decoder.corners;
  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  ctx.lineTo(pts[1].x, pts[1].y);
  ctx.lineTo(pts[2].x, pts[2].y);
  ctx.lineTo(pts[3].x, pts[3].y);
  ctx.closePath();
  ctx.stroke();

  const labels = ['TL', 'TR', 'BR', 'BL'];
  const colors = ['#E6194B', '#FFDD00', '#00A859', '#00C8FF'];

  pts.forEach((pt, i) => {
    ctx.fillStyle = colors[i];
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(labels[i], pt.x + 12, pt.y + 4);
  });
}

async function runDecoder() {
  if (!state.decoder.sourceImage || !state.decoder.corners) return;

  const result = decodeChromaMatrix(state.decoder.sourceImage, {
    corners: state.decoder.corners
  });

  if (result.success) {
    state.decoder.lastDecodedRaw = result.data;

    DOM.resultStatusBadge.className = 'result-status success';
    DOM.resultStatusBadge.querySelector('.status-text').textContent = 'Matrix Decoded Instantly (100% Restored)';

    DOM.decStatGrid.textContent = `${result.gridSize} x ${result.gridSize}`;
    DOM.decStatMode.textContent = result.mode;
    DOM.decStatEcc.textContent = `${result.correctedErrors} bytes`;
    DOM.decStatDeltaE.textContent = `${result.avgDeltaE.toFixed(2)} ΔE`;

    // Direct instant output
    const text = new TextDecoder('utf-8', { fatal: false }).decode(result.data);
    DOM.decodedTextOutput.textContent = text;

    drawRectifiedCanvas(result.rectifiedImage, result.cellSamples, result.gridSize);
  } else {
    DOM.resultStatusBadge.className = 'result-status error';
    DOM.resultStatusBadge.querySelector('.status-text').textContent = result.error;
    DOM.decodedTextOutput.textContent = 'Decoding failed: Adjust corner handles or ensure image is in focus.';
  }
}

async function decryptAndDisplayPayload(dataBytes, password) {
  if (isPayloadEncrypted(dataBytes)) {
    if (!password) {
      DOM.decodedTextOutput.textContent = '🔒 ENCRYPTED PAYLOAD (AES-256-GCM)\n----------------------------------------\nThis ChromaMatrix is protected by encryption.\nPlease enter the password above and click "Decrypt" to unlock the contents.';
      DOM.resultStatusBadge.querySelector('.status-text').textContent = '🔒 Encrypted ChromaMatrix (Password Required)';
      return;
    }

    const decResult = await decryptPayload(dataBytes, password);
    if (decResult.success) {
      const plainText = new TextDecoder('utf-8', { fatal: false }).decode(decResult.data);
      DOM.decodedTextOutput.textContent = `🔓 DECRYPTED CONTENT (AES-256-GCM Verified):\n----------------------------------------\n${plainText}`;
      DOM.resultStatusBadge.querySelector('.status-text').textContent = '🔓 Decrypted with AES-256-GCM (100% Authenticated)';
    } else {
      DOM.decodedTextOutput.textContent = `❌ ${decResult.error}\nPlease check your password.`;
    }
  } else {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(dataBytes);
    DOM.decodedTextOutput.textContent = text;
  }
}

function drawRectifiedCanvas(rectifiedImage, cellSamples, gridSize) {
  const canvas = DOM.canvasRectifiedDots;
  const ctx = canvas.getContext('2d');

  canvas.width = rectifiedImage.width;
  canvas.height = rectifiedImage.height;

  const imgData = ctx.createImageData(rectifiedImage.width, rectifiedImage.height);
  imgData.data.set(rectifiedImage.data);
  ctx.putImageData(imgData, 0, 0);

  if (cellSamples) {
    const cellSize = rectifiedImage.width / gridSize;
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1;

    cellSamples.forEach(s => {
      const cx = (s.gx + 0.5) * cellSize;
      const cy = (s.gy + 0.5) * cellSize;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}

function initCanvasCornerDragging() {
  const canvas = DOM.canvasSourceQuad;

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      scaleX
    };
  }

  function startDrag(e) {
    if (!state.decoder.corners) return;
    const pos = getCanvasCoords(e);
    let nearestIdx = -1;
    let minDist = 35 * pos.scaleX; // 35 screen pixels grab radius

    state.decoder.corners.forEach((pt, i) => {
      const dist = Math.hypot(pt.x - pos.x, pt.y - pos.y);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    });

    state.decoder.dragCornerIdx = nearestIdx;
    if (nearestIdx >= 0 && e.cancelable) e.preventDefault();
  }

  function moveDrag(e) {
    if (state.decoder.dragCornerIdx < 0 || !state.decoder.corners) return;
    const pos = getCanvasCoords(e);
    state.decoder.corners[state.decoder.dragCornerIdx] = {
      x: Math.max(0, Math.min(canvas.width, pos.x)),
      y: Math.max(0, Math.min(canvas.height, pos.y))
    };
    drawSourceQuadCanvas();
    if (e.cancelable) e.preventDefault();
  }

  function endDrag() {
    if (state.decoder.dragCornerIdx >= 0) {
      state.decoder.dragCornerIdx = -1;
      runDecoder();
    }
  }

  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);

  canvas.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('touchend', endDrag);
}

// ==========================================
// 4. Capacity Report Controller
// ==========================================
function initCapacity() {
  DOM.capacityPaperSelect.addEventListener('change', (e) => {
    state.capacity.paperKey = e.target.value;
    renderCapacityTable();
  });

  DOM.capacityEccSelect.addEventListener('change', (e) => {
    state.capacity.eccRatio = parseFloat(e.target.value);
    renderCapacityTable();
  });

  renderCapacityTable();
}

function renderCapacityTable() {
  const report = generateCapacityReport(state.capacity.paperKey, state.capacity.eccRatio);
  const container = DOM.capacityTableContainer;

  let html = `
    <table class="capacity-table">
      <thead>
        <tr>
          <th>Capture & Scanner Tier</th>
          <th>Dot Pitch</th>
          <th>Grid Dimensions</th>
          <th>8-Color (3-bit)</th>
          <th>16-Color (4-bit / 1 Nibble)</th>
          <th>ASCII-95 (1 Dot = 1 Char)</th>
          <th>256-Color (8-bit)</th>
          <th>Book Pages</th>
        </tr>
      </thead>
      <tbody>
  `;

  report.tiers.forEach(t => {
    const res8 = t.results[PALETTE_MODES.PALETTE_8];
    const res16 = t.results[PALETTE_MODES.PALETTE_16];
    const resAscii = t.results[PALETTE_MODES.PALETTE_ASCII_95];
    const res256 = t.results[PALETTE_MODES.PALETTE_256];

    html += `
      <tr>
        <td>
          <strong>${t.tier.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-muted);">${t.tier.reliability}</span>
        </td>
        <td><span class="capacity-badge">${t.tier.recommendedDotPitchMm} mm</span></td>
        <td style="font-family:var(--font-mono);">${res16.gridDimensions}</td>
        <td style="font-family:var(--font-mono); color:var(--accent-yellow);">${res8.netPayloadBytes.toLocaleString()} B</td>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan);">${res16.netPayloadBytes.toLocaleString()} B</td>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-emerald);">${resAscii.approxCharacters.toLocaleString()} chars</td>
        <td style="font-family:var(--font-mono); color:var(--accent-purple);">${res256.netPayloadBytes.toLocaleString()} B</td>
        <td><strong>~${res16.approxTypedPages}</strong> pages</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// ==========================================
// 5. Benchmark Lab Controller
// ==========================================
function initBenchmark() {
  DOM.btnGenBenchmarkTarget.addEventListener('click', generateAndDisplayBenchmarkTarget);

  DOM.dropZoneBenchmark.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropZoneBenchmark.classList.add('drag-over');
  });
  DOM.dropZoneBenchmark.addEventListener('dragleave', () => {
    DOM.dropZoneBenchmark.classList.remove('drag-over');
  });
  DOM.dropZoneBenchmark.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropZoneBenchmark.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBenchmarkFile(e.dataTransfer.files[0]);
    }
  });

  DOM.btnBrowseBenchmark.addEventListener('click', () => DOM.fileInputBenchmark.click());
  DOM.fileInputBenchmark.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleBenchmarkFile(e.target.files[0]);
    }
  });

  DOM.btnRunSyntheticBenchmark.addEventListener('click', runSyntheticBenchmarkSimulation);
}

function generateAndDisplayBenchmarkTarget() {
  const mode = DOM.benchmarkTestMode.value;
  state.benchmark.mode = mode;
  const target = generateBenchmarkTarget(mode);
  state.benchmark.currentTarget = target;

  const svg = benchmarkTargetToSvg(target, { cellSize: 36 });
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  triggerFileDownload(blob, `chromamatrix_calibration_target_${mode}.svg`);

  alert(`Generated Calibration Target for ${mode}!\nPrint the downloaded SVG on your printer, scan or photograph it, and upload it back here.`);
}

function handleBenchmarkFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      analyzeScannedBenchmark(imgData);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function runSyntheticBenchmarkSimulation() {
  const mode = DOM.benchmarkTestMode.value;
  const target = generateBenchmarkTarget(mode);
  const buffer = benchmarkTargetToRgbaBuffer(target, { cellSize: 36, margin: 3 });

  const simulated = {
    width: buffer.width,
    height: buffer.height,
    data: new Uint8ClampedArray(buffer.data)
  };

  for (let i = 0; i < simulated.data.length; i += 4) {
    let r = simulated.data[i] * 0.96 + 6;
    let g = simulated.data[i + 1] * 0.94 + 4;
    let b = simulated.data[i + 2] * 0.88 - 4;
    r += (Math.random() - 0.5) * 8;
    g += (Math.random() - 0.5) * 8;
    b += (Math.random() - 0.5) * 8;

    simulated.data[i] = Math.min(255, Math.max(0, Math.round(r)));
    simulated.data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    simulated.data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  analyzeScannedBenchmark(simulated, target);
}

function analyzeScannedBenchmark(imageData, targetModel) {
  const target = targetModel || generateBenchmarkTarget(DOM.benchmarkTestMode.value);
  const report = analyzeBenchmarkScan(imageData, target);
  state.benchmark.currentReport = report;

  DOM.benchRatingBadge.textContent = `Rating: ${report.reliabilityRating}`;
  DOM.benchRecommendationTitle.textContent = `Recommended: ${report.recommendedMode} (${report.recommendedBitsPerDot} bits/dot)`;
  DOM.benchRecommendationDesc.textContent = `Under your tested printing and lighting conditions, ${report.patchCount} color swatches exhibited an average shift of ${report.avgGamutShiftDeltaE.toFixed(2)} ΔE with ${report.confusionPairCount} potential confusion pairs.`;

  DOM.benchStatCount.textContent = `${report.patchCount}`;
  DOM.benchStatDrift.textContent = `${report.avgGamutShiftDeltaE.toFixed(1)} ΔE`;
  DOM.benchStatSep.textContent = `${report.minPhysicalSeparationDeltaE.toFixed(1)} ΔE`;
  DOM.benchStatConfused.textContent = `${report.confusionPairCount}`;

  DOM.patchGridDisplay.innerHTML = '';
  report.patchResults.forEach(p => {
    const item = document.createElement('div');
    item.className = 'bench-patch-item';
    item.style.backgroundColor = p.measuredHex;
    item.textContent = `Δ${p.deltaE.toFixed(0)}`;
    item.title = `${p.name}\nExpected: ${p.expectedHex}\nMeasured: ${p.measuredHex}\nShift: ΔE ${p.deltaE.toFixed(2)}`;
    DOM.patchGridDisplay.appendChild(item);
  });
}

// ==========================================
// 6. Color Theory & Gamut Visualizer
// ==========================================
function initTheory() {
  renderTheoryExplorer();
}

function renderTheoryExplorer() {
  const container = DOM.theoryPaletteExplorer;
  container.innerHTML = '';

  const modes = [
    { mode: PALETTE_MODES.PALETTE_8, title: '8-Color Palette (3 bits/dot)' },
    { mode: PALETTE_MODES.PALETTE_16, title: '16-Color Palette (4 bits/dot - 1 Nibble)' },
    { mode: PALETTE_MODES.PALETTE_64, title: '64-Color Palette (6 bits/dot - Base64)' },
    { mode: PALETTE_MODES.PALETTE_ASCII_95, title: 'ASCII-95 Palette (1 Dot = 1 Character)' }
  ];

  modes.forEach(m => {
    const analysis = analyzePaletteSeparation(m.mode);
    const palette = getPalette(m.mode);

    const card = document.createElement('div');
    card.className = 'theory-item';
    card.style.marginTop = '16px';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h4 style="font-size:1rem; color:#FFFFFF;">${m.title}</h4>
        <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--accent-cyan);">
          Min ΔE: ${analysis.minDeltaE.toFixed(1)} | Avg ΔE: ${analysis.avgDeltaE.toFixed(1)}
        </span>
      </div>
      <div class="palette-swatch-bar">
        ${palette.map(c => `<div class="swatch-item" style="background-color:${c.hex}; width:20px; height:20px;" title="${c.name}"></div>`).join('')}
      </div>
    `;

    container.appendChild(card);
  });
}

// Start application
window.addEventListener('DOMContentLoaded', init);
