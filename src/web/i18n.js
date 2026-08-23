/**
 * ChromaMatrix - Internationalization (i18n) Module
 * Provides instant live switching between English (EN) and Spanish (ES).
 * 
 * 🥑 by aoxilus (https://github.com/aoxilus) · CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
 */

export const translations = {
  en: {
    // Header & Navigation
    'app.title': 'ChromaMatrix',
    'app.badge': 'Color-Dot Optical Data Encoder',
    'nav.studio': 'Matrix Studio (Encoder)',
    'nav.decoder': 'Scan & Decode (Instant)',
    'nav.capacity': 'Capacity Report',
    'nav.benchmark': 'Color Fidelity Lab',
    'nav.theory': 'Color Science',
    'lang.toggle': '🌐 Language',

    // Version Mode Toggle
    'mode.v1.label': '⚡ V1 — Digital',
    'mode.v1.tooltip': 'V1 Digital: PC → PC perfect lossless transfer via SVG/PNG. All palettes, unlimited density, zero hardware constraints.',
    'mode.v2.label': '🖨️ V2 — Paper (Phase 2)',
    'mode.v2.tooltip': 'V2 Paper: Physical print & scan. Coming soon — EUV & photo-grade printers, adaptive CIELAB calibration, 8-color safe palette.',
    'mode.v1.badge': 'V1 · Digital · Perfect',
    'mode.v2.badge': 'V2 · Paper · Phase 2',
    'mode.v2.warning': '⚠️ V2 Paper Mode is Phase 2 (Future). Palettes are currently optimized for lossless digital transfer. EUV or photo-grade printers recommended for physical output.',

    // Studio Tab
    'studio.header.title': 'Optical Data Matrix Generator',
    'studio.header.subtitle': 'V1 Digital — Perfect lossless PC-to-PC encoding via SVG / PNG. All palettes, zero hardware constraints.',
    'studio.preset.label': '🎯 Encoding Preset',
    'preset.v1.perfect': '⚡ [V1] PC → PC Perfect · PALETTE_256 · 8 bits/dot · Zero-loss',
    'preset.v1.high': '⚡ [V1] PC → PC High Density · PALETTE_64 · 6 bits/dot · Base64',
    'preset.v1.balanced': '⚡ [V1] PC → PC Balanced · PALETTE_16 · 4 bits/dot · 1 Nibble',
    'preset.v1.text': '⚡ [V1] PC → PC Plain Text · ASCII-95 · 1 dot = 1 char',
    'preset.v2.euv': '🖨️ [V2] EUV / Photo Printer · PALETTE_16 · 0.5mm — Phase 2',
    'preset.v2.phone': '🖨️ [V2] Any Printer + Phone · PALETTE_8 · 1.0mm — Phase 2',
    'preset.v2.sticker': '🖨️ [V2] UV Sticker · PALETTE_8 · 0.9mm · 35% ECC — Phase 2',
    'preset.custom': '⚙️ Custom Manual Configuration...',
    // Legacy fallbacks
    'preset.sticker': '🏷️ [V2] Outdoor UV Ink & Sticker Tag (35% ECC)',
    'preset.backup': '📄 [V2] Paper Cold Storage Backup (25% ECC)',
    'preset.fastphone': '📱 [V2] Fast Mobile Phone Scan (16-Color)',
    'preset.density': '⚡ [V1] Maximum Density (ASCII-95 / 1 Dot = 1 Char)',

    'studio.payload.label': 'Payload Data (Text / Keys / Seed Phrase / Binary)',
    'studio.btn.upload': 'Upload File...',
    'studio.payload.placeholder': 'Type or paste data, recovery keys, source code, or any binary payload...',
    'studio.palette.label': 'Color Palette Mode',
    'opt.palette16': '16 Colors (4 bits/dot - 1 Nibble) — V1 Balanced',
    'opt.palette8': '8 Colors (3 bits/dot) — V2 Paper Safe / V1 Fast',
    'opt.ascii95': 'ASCII-95 (1 Dot = 1 Exact ASCII Char) — V1 Text',
    'opt.palette64': '64 Colors (6 bits/dot - Base64) — V1 High Density',
    'opt.palette256': '256 Colors (8 bits/dot) — V1 Maximum',
    'studio.ecc.label': 'Error Correction (RS-ECC)',
    'opt.ecc15': '15% ECC (Low Redundancy)',
    'opt.ecc25': '25% ECC (Standard)',
    'opt.ecc35': '35% ECC (Heavy-Duty)',
    'opt.ecc50': '50% ECC (Maximum Resilience)',
    'studio.shape.label': 'Dot Geometry',
    'opt.circle': 'Circular Dots',
    'opt.rounded': 'Rounded Squares',
    'opt.square': 'Solid Squares',
    'studio.size.label': 'Dot Render Size (px)',
    'studio.swatches.label': 'Calibrated Palette Swatches (Black & White reserved for alignment)',
    'stat.gridSize': 'Grid Size',
    'stat.payloadLen': 'Data Payload',
    'stat.codewordLen': 'RS Codewords',
    'stat.dotCount': 'Total Symbols',
    'studio.btn.downloadPng': 'Download PNG',
    'studio.btn.downloadSvg': 'Export SVG',
    'studio.btn.openTab': 'Open in Tab',
    'studio.btn.copyImage': 'Copy Image',
    'studio.btn.printSheet': 'Print Matrix',
    'inspector.title': 'Dot & Color Inspector',
    'inspector.hoverTip': 'Hover over any dot on the matrix canvas to inspect its exact coordinates, hex code, and CIELAB color values.',

    // Decoder Tab
    'decoder.header.title': 'Vision Decoder & Live Camera Reader',
    'decoder.header.subtitle': 'Drop an image, paste from clipboard (Ctrl+V), or aim your camera to extract data instantly with Reed-Solomon recovery.',
    'decoder.mode.upload': '📁 File Upload / Paste',
    'decoder.mode.camera': '📷 Live Camera / Webcam',
    'decoder.dropzone.title': 'Drag & Drop ChromaMatrix Image Here',
    'decoder.dropzone.subtitle': 'or click to browse from device, or paste directly with <b>Ctrl + V</b>',
    'decoder.btn.browse': 'Select Image File',
    'decoder.btn.capture': '📸 Capture & Decode Frame',
    'decoder.btn.stopCamera': 'Stop Camera',
    'decoder.btn.sampleClean': 'Load Clean Sample',
    'decoder.btn.sampleNoisy': 'Load Distorted Photo Sample',
    'decoder.label.sourceQuad': 'Perspective Registration (Drag 4 corner handles)',
    'decoder.label.rectified': 'Rectified & Sampled Dot Matrix',
    'decoder.label.output': 'Decoded Payload Data',
    'decoder.btn.copy': 'Copy Text',
    'decoder.btn.save': 'Save to .txt',
    'decStat.grid': 'Grid Dimensions',
    'decStat.mode': 'Palette Mode',
    'decStat.ecc': 'Errors Corrected',
    'decStat.deltaE': 'Average ΔE',

    // Capacity Tab
    'capacity.header.title': 'Physical Paper & Sticker Capacity Report',
    'capacity.header.subtitle': 'Calculated printable byte density for cold storage archival and physical sticker labels.',
    'capacity.paper.label': 'Sheet / Substrate Format:',
    'capacity.ecc.label': 'Target ECC Level:',
    'capacity.th.pitch': 'Dot Pitch (Size)',
    'capacity.th.grid': 'Grid Size',
    'capacity.th.totalDots': 'Total Dots',
    'capacity.th.netBytes': 'Net Usable Bytes',
    'capacity.th.pages': 'Approx. Book Pages',
    'capacity.th.medium': 'Optimal Substrate / Scanner Device',

    // Benchmark Tab
    'benchmark.header.title': 'Printer & Camera Fidelity Benchmark Lab',
    'benchmark.header.subtitle': 'Measure printer color gamut fidelity, physical tint shifts (ΔE), confusion matrix, and get automatic palette recommendations.',
    'benchmark.mode.label': 'Test Suite Mode:',
    'benchmark.btn.generate': 'Generate Benchmark Sheet',
    'benchmark.btn.synthetic': 'Run Synthetic Noise Benchmark',
    'benchmark.dropzone.title': 'Drop Scanned Benchmark Target Here',
    'benchStat.patches': 'Color Patches Evaluated',
    'benchStat.drift': 'Average Color Drift',
    'benchStat.sep': 'Minimum Separation',
    'benchStat.confused': 'Confused Swatch Pairs',

    // Theory Tab
    'theory.header.title': 'Color Science & CIELAB Calibration Theory',
    'theory.header.subtitle': 'Why ChromaMatrix uses perceptual CIELAB ΔE distance rather than Euclidean RGB.'
  },

  es: {
    // Header & Navigation
    'app.title': 'ChromaMatrix',
    'app.badge': 'Codificador Óptico de Datos por Puntos de Color',
    'nav.studio': 'Estudio de Matriz (Codificador)',
    'nav.decoder': 'Escanear y Decodificar (Instantáneo)',
    'nav.capacity': 'Reporte de Capacidad',
    'nav.benchmark': 'Laboratorio de Fidelidad de Color',
    'nav.theory': 'Ciencia del Color',
    'lang.toggle': '🌐 Idioma',

    // Version Mode Toggle
    'mode.v1.label': '⚡ V1 — Digital',
    'mode.v1.tooltip': 'V1 Digital: PC → PC transferencia perfecta sin pérdida vía SVG/PNG. Todas las paletas, densidad ilimitada, sin límites de hardware.',
    'mode.v2.label': '🖨️ V2 — Papel (Fase 2)',
    'mode.v2.tooltip': 'V2 Papel: Impresión física y escaneo. Próximamente — impresoras EUV y fotográficas, calibración CIELAB adaptativa, paleta segura de 8 colores.',
    'mode.v1.badge': 'V1 · Digital · Perfecto',
    'mode.v2.badge': 'V2 · Papel · Fase 2',
    'mode.v2.warning': '⚠️ El Modo Papel V2 es Fase 2 (Futuro). Las paletas están optimizadas para transferencia digital sin pérdida. Se recomiendan impresoras EUV o fotográficas para salida física.',

    // Studio Tab
    'studio.header.title': 'Generador de Matrices de Datos Ópticos',
    'studio.header.subtitle': 'V1 Digital — Codificación PC a PC perfecta y sin pérdida vía SVG / PNG. Todas las paletas, sin límites de hardware.',
    'studio.preset.label': '🎯 Perfil de Codificación',
    'preset.v1.perfect': '⚡ [V1] PC → PC Perfecto · PALETTE_256 · 8 bits/punto · Sin pérdida',
    'preset.v1.high': '⚡ [V1] PC → PC Alta Densidad · PALETTE_64 · 6 bits/punto · Base64',
    'preset.v1.balanced': '⚡ [V1] PC → PC Balanceado · PALETTE_16 · 4 bits/punto · 1 Nibble',
    'preset.v1.text': '⚡ [V1] PC → PC Texto Plano · ASCII-95 · 1 punto = 1 carácter',
    'preset.v2.euv': '🖨️ [V2] Impresora EUV / Fotográfica · PALETTE_16 · 0.5mm — Fase 2',
    'preset.v2.phone': '🖨️ [V2] Cualquier Impresora + Celular · PALETTE_8 · 1.0mm — Fase 2',
    'preset.v2.sticker': '🖨️ [V2] Sticker UV · PALETTE_8 · 0.9mm · 35% ECC — Fase 2',
    'preset.custom': '⚙️ Configuración Manual Personalizada...',
    // Legacy fallbacks
    'preset.sticker': '🏷️ [V2] Tinta UV y Etiquetas Adhesivas (35% ECC)',
    'preset.backup': '📄 [V2] Respaldo de Almacenamiento en Frío (25% ECC)',
    'preset.fastphone': '📱 [V2] Escaneo Rápido con Móvil (16 Colores)',
    'preset.density': '⚡ [V1] Máxima Densidad (ASCII-95 / 1 Punto = 1 Carácter)',

    'studio.payload.label': 'Datos de Carga Útil (Texto / Claves / Semilla / Binario)',
    'studio.btn.upload': 'Subir Archivo...',
    'studio.payload.placeholder': 'Escribe o pega datos, claves de recuperación, código fuente o cualquier carga binaria...',
    'studio.palette.label': 'Modo de Paleta de Color',
    'opt.palette16': '16 Colores (4 bits/punto - 1 Nibble) — V1 Balanceado',
    'opt.palette8': '8 Colores (3 bits/punto) — V2 Papel / V1 Rápido',
    'opt.ascii95': 'ASCII-95 (1 Punto = 1 Carácter ASCII) — V1 Texto',
    'opt.palette64': '64 Colores (6 bits/punto - Base64) — V1 Alta Densidad',
    'opt.palette256': '256 Colores (8 bits/punto) — V1 Máximo',
    'studio.ecc.label': 'Corrección de Errores (RS-ECC)',
    'opt.ecc15': '15% ECC (Baja Redundancia)',
    'opt.ecc25': '25% ECC (Estándar)',
    'opt.ecc35': '35% ECC (Resistencia Alta)',
    'opt.ecc50': '50% ECC (Máxima Resiliencia)',
    'studio.shape.label': 'Geometría del Punto',
    'opt.circle': 'Puntos Circulares',
    'opt.rounded': 'Cuadrados Redondeados',
    'opt.square': 'Cuadrados Sólidos',
    'studio.size.label': 'Tamaño de Renderizado (px)',
    'studio.swatches.label': 'Muestras de Paleta Calibradas (Blanco y Negro reservados para alineación)',
    'stat.gridSize': 'Dimensiones',
    'stat.payloadLen': 'Carga Útil',
    'stat.codewordLen': 'Codewords RS',
    'stat.dotCount': 'Símbolos Totales',
    'studio.btn.downloadPng': 'Descargar PNG',
    'studio.btn.downloadSvg': 'Exportar SVG',
    'studio.btn.openTab': 'Abrir en Pestaña',
    'studio.btn.copyImage': 'Copiar Imagen',
    'studio.btn.printSheet': 'Imprimir Matriz',
    'inspector.title': 'Inspector de Puntos y Color',
    'inspector.hoverTip': 'Pasa el cursor sobre cualquier punto de la matriz para inspeccionar sus coordenadas, código hexadecimal y valores de color CIELAB.',

    // Decoder Tab
    'decoder.header.title': 'Decodificador de Visión y Lector de Cámara',
    'decoder.header.subtitle': 'Arrastra una imagen, pega desde el portapapeles (Ctrl+V) o apunta tu cámara para extraer datos al instante con recuperación Reed-Solomon.',
    'decoder.mode.upload': '📁 Subir Archivo / Pegar',
    'decoder.mode.camera': '📷 Cámara en Vivo / Webcam',
    'decoder.dropzone.title': 'Arrastra y Suelta la Imagen ChromaMatrix Aquí',
    'decoder.dropzone.subtitle': 'o haz clic para explorar en tu dispositivo, o pega directo con <b>Ctrl + V</b>',
    'decoder.btn.browse': 'Seleccionar Archivo de Imagen',
    'decoder.btn.capture': '📸 Capturar y Decodificar Cuadro',
    'decoder.btn.stopCamera': 'Detener Cámara',
    'decoder.btn.sampleClean': 'Cargar Muestra Limpia',
    'decoder.btn.sampleNoisy': 'Cargar Foto de Muestra con Ruido',
    'decoder.label.sourceQuad': 'Registro de Perspectiva (Arrastra los 4 controladores de esquina)',
    'decoder.label.rectified': 'Matriz de Puntos Rectificada y Muestreada',
    'decoder.label.output': 'Datos Decodificados',
    'decoder.btn.copy': 'Copiar Texto',
    'decoder.btn.save': 'Guardar en .txt',
    'decStat.grid': 'Dimensiones de Matriz',
    'decStat.mode': 'Modo de Paleta',
    'decStat.ecc': 'Errores Corregidos',
    'decStat.deltaE': 'Promedio ΔE',

    // Capacity Tab
    'capacity.header.title': 'Reporte de Capacidad en Papel Físico y Stickers',
    'capacity.header.subtitle': 'Cálculo de densidad imprimible en bytes para almacenamiento en frío y etiquetas físicas.',
    'capacity.paper.label': 'Formato de Hoja / Sustrato:',
    'capacity.ecc.label': 'Nivel de ECC Objetivo:',
    'capacity.th.pitch': 'Paso de Punto (Tamaño)',
    'capacity.th.grid': 'Cuadrícula',
    'capacity.th.totalDots': 'Puntos Totales',
    'capacity.th.netBytes': 'Bytes Útiles Netos',
    'capacity.th.pages': 'Páginas Aprox. de Libro',
    'capacity.th.medium': 'Sustrato Óptimo / Dispositivo Lector',

    // Benchmark Tab
    'benchmark.header.title': 'Laboratorio de Fidelidad de Impresora y Cámara',
    'benchmark.header.subtitle': 'Mide la fidelidad del gamut de tu impresora, desplazamientos cromáticos (ΔE), matriz de confusión y recibe recomendaciones de paleta.',
    'benchmark.mode.label': 'Modo de Prueba:',
    'benchmark.btn.generate': 'Generar Hoja de Prueba',
    'benchmark.btn.synthetic': 'Ejecutar Prueba de Ruido Sintético',
    'benchmark.dropzone.title': 'Arrastra el Objetivo de Prueba Escaneado Aquí',
    'benchStat.patches': 'Muestras Evaluadas',
    'benchStat.drift': 'Desviación Promedio',
    'benchStat.sep': 'Separación Mínima',
    'benchStat.confused': 'Pares Confundidos',

    // Theory Tab
    'theory.header.title': 'Ciencia del Color y Teoría de Calibración CIELAB',
    'theory.header.subtitle': 'Por qué ChromaMatrix utiliza distancia perceptual CIELAB ΔE en lugar del espacio euclidiano RGB.'
  }
};

let currentLang = 'en';
let currentVersion = 'v1'; // 'v1' | 'v2'

export function getLang() { return currentLang; }
export function getVersion() { return currentVersion; }

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('chromamatrix_lang', lang);
    applyTranslations();
  }
}

export function setVersion(ver) {
  if (ver === 'v1' || ver === 'v2') {
    currentVersion = ver;
    localStorage.setItem('chromamatrix_version', ver);
    applyVersionMode();
  }
}

export function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations['en'][key] || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.getAttribute('placeholder')) el.setAttribute('placeholder', text);
    } else {
      el.innerHTML = text;
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });

  const langSelect = document.getElementById('lang-selector');
  if (langSelect && langSelect.value !== currentLang) langSelect.value = currentLang;

  applyVersionMode();
}

export function applyVersionMode() {
  const isV2 = currentVersion === 'v2';

  // Update version toggle buttons
  document.querySelectorAll('.version-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.version === currentVersion);
  });

  // Version badge in header
  const badge = document.getElementById('version-badge');
  if (badge) {
    badge.textContent = t(isV2 ? 'mode.v2.badge' : 'mode.v1.badge');
    badge.className = `version-badge ${isV2 ? 'v2' : 'v1'}`;
  }

  // Show/hide V2 warning banner
  const v2Banner = document.getElementById('v2-warning-banner');
  if (v2Banner) {
    v2Banner.style.display = isV2 ? 'flex' : 'none';
    v2Banner.querySelector('[data-i18n="mode.v2.warning"]').innerHTML = t('mode.v2.warning');
  }

  // Update preset selector options to show relevant group
  const presetSelect = document.getElementById('preset-selector');
  if (presetSelect) {
    Array.from(presetSelect.options).forEach(opt => {
      const isV1Opt = opt.value.startsWith('v1-') || opt.value.startsWith('preset-') === false && opt.value.includes('v1');
      const isV2Opt = opt.value.startsWith('v2-') || opt.value.includes('v2');
      // All options stay visible, just auto-select default for mode
    });
    // Auto-select appropriate default when switching version
    if (isV2) {
      presetSelect.value = 'v2-phone';
    } else if (!presetSelect.value.startsWith('v1-')) {
      presetSelect.value = 'v1-balanced';
    }
    presetSelect.dispatchEvent(new Event('change'));
  }

  // Subtitle reflects current version
  const subtitle = document.querySelector('#tab-studio .subtitle[data-i18n="studio.header.subtitle"]');
  if (subtitle) {
    subtitle.innerHTML = t(isV2 ? 'studio.header.subtitle.v2' : 'studio.header.subtitle');
  }
}

export function initI18n() {
  const savedLang = localStorage.getItem('chromamatrix_lang') || 'en';
  const savedVer  = localStorage.getItem('chromamatrix_version') || 'v1';
  currentLang = translations[savedLang] ? savedLang : 'en';
  currentVersion = (savedVer === 'v1' || savedVer === 'v2') ? savedVer : 'v1';
  applyTranslations();
}
