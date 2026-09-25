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
    'app.badge': 'Color-dot data',
    'nav.studio': 'Encode',
    'nav.decoder': 'Decode',
    'nav.wiki': 'Wiki',
    'nav.benchmark': 'Print test',
    'lang.toggle': '🌐 Language',
    'theme.light': 'Light',
    'theme.dark': 'Dark',

    // Studio Tab
    'studio.header.title': 'Encode a color matrix',
    'studio.header.subtitle': 'Turn data into color dots for digital or paper output.',
    'studio.preset.label': 'Encoding preset',
    'preset.custom': '⚙️ Custom configuration',
    // Legacy fallbacks
    'preset.sticker': '🏷️ Outdoor UV sticker (35% ECC)',
    'preset.backup': '📄 Paper cold storage (25% ECC)',
    'preset.fastphone': '📱 Fast phone scan (16 colors)',
    'preset.density': 'Maximum density (ASCII-95 / binary-safe base95)',

    'studio.payload.label': 'Data to encode',
    'studio.btn.upload': 'Choose file',
    'studio.payload.placeholder': 'Paste text or choose a file...',
    'studio.palette.label': 'Color palette',
    'studio.compression.label': 'Payload compression',
    'opt.palette16': '16 colors · 4 bits/dot',
    'opt.palette8': '8 colors · 3 bits/dot · separated spectra',
    'opt.ascii95': 'ASCII-95 · binary-safe base95',
    'opt.palette64': '64 colors · 6 bits/dot',
    'opt.palette256': '256 colors · 8 bits/dot',
    'opt.compression.none': 'Natural · no compression',
    'opt.compression.gzip': 'GZIP · compatible',
    'opt.compression.brotli': 'Brotli · default · smallest payload',
    'studio.ecc.label': 'Error correction',
    'opt.ecc15': '15% ECC',
    'opt.ecc25': '25% ECC',
    'opt.ecc35': '35% ECC',
    'opt.ecc50': '50% ECC · maximum',
    'studio.shape.label': 'Dot shape',
    'opt.circle': 'Circles',
    'opt.rounded': 'Rounded squares',
    'opt.square': 'Squares',
    'studio.size.label': 'Dot size (px)',
    'studio.previewSize.label': 'On-screen matrix size',
    'studio.swatches.label': 'Calibration palette',
    'stat.gridSize': 'Grid',
    'stat.payloadLen': 'Payload',
    'stat.codewordLen': 'ECC bytes',
    'stat.dotCount': 'Symbols',
    'studio.btn.downloadPng': 'PNG',
    'studio.btn.downloadSvg': 'SVG',
    'studio.btn.openTab': 'Open',
    'studio.btn.copyImage': 'Copy',
    'studio.btn.printSheet': 'Print',
    'inspector.title': 'Matrix preview',
    'inspector.hoverTip': 'Hover a dot for its color and coordinates.',

    // Decoder Tab
    'decoder.header.title': 'Decode a matrix',
    'decoder.header.subtitle': 'Upload, paste, or use your camera.',
    'decoder.mode.upload': 'Upload / paste',
    'decoder.mode.camera': 'Camera',
    'decoder.dropzone.title': 'Drop or select a matrix image',
    'decoder.dropzone.subtitle': 'You can also paste with <b>Ctrl + V</b>.',
    'decoder.btn.browse': 'Select image',
    'decoder.btn.capture': 'Capture',
    'decoder.btn.stopCamera': 'Stop',
    'decoder.btn.sampleClean': 'Clean',
    'decoder.btn.sampleNoisy': 'Noisy',
    'decoder.samples.label': 'Samples:',
    'decoder.tip.corners': 'Corners are detected automatically. Adjust them if needed.',
    'decoder.label.sourceQuad': 'Source image',
    'decoder.label.rectified': 'Rectified matrix',
    'decoder.label.output': 'Decoded data',
    'decoder.btn.copy': 'Copy Text',
    'decoder.btn.save': 'Save .txt',
    'decStat.grid': 'Grid',
    'decStat.mode': 'Palette Mode',
    'decStat.ecc': 'Corrections',
    'decStat.deltaE': 'Average ΔE',

    // Wiki Tab
    'wiki.header.title': 'ChromaMatrix Wiki',
    'wiki.header.subtitle': 'Purpose, workflow, calibration, and capacity.',
    'wiki.purpose.title': 'Purpose',
    'wiki.purpose.text': 'Store text or files as color dots that can be printed, scanned, and recovered offline.',
    'wiki.workflow.title': 'How it works',
    'wiki.workflow.text': 'Encode data, print the matrix, scan it, then decode it with calibration and error correction.',
    'wiki.capacity.title': 'What capacity means',
    'wiki.capacity.text': 'Smaller dots and more colors store more data, but require better printing, lighting, and scanning.',
    'wiki.compression.title': 'Payload compression',
    'wiki.compression.text': 'Brotli or GZIP compresses the payload before Reed-Solomon, reducing the matrix size while preserving automatic decompression during decode.',
    'wiki.color.title': 'Color & calibration',
    'wiki.color.subtitle': 'How the reader handles color drift.',
    'capacity.paper.label': 'Paper',
    'capacity.ecc.label': 'ECC',
    'capacity.th.pitch': 'Dot Pitch (Size)',
    'capacity.th.grid': 'Grid Size',
    'capacity.th.totalDots': 'Total Dots',
    'capacity.th.netBytes': 'Net Usable Bytes',
    'capacity.th.pages': 'Approx. Book Pages',
    'capacity.th.medium': 'Optimal Substrate / Scanner Device',

    // Benchmark Tab
    'benchmark.header.title': 'Printer calibration',
    'benchmark.header.subtitle': 'Measure color drift before trusting a scan.',
    'benchmark.mode.label': 'Test mode:',
    'benchmark.btn.generate': 'Generate',
    'benchmark.btn.synthetic': 'Simulate print and lighting noise',
    'benchmark.dropzone.title': 'Drop or select the scan',
    'benchmark.step.generate': '1. Generate a target',
    'benchmark.step.scan': '2. Scan the target',
    'benchStat.patches': 'Patches',
    'benchStat.drift': 'Avg. drift',
    'benchStat.sep': 'Min. separation',
    'benchStat.confused': 'Confused pairs',

    // Theory Tab
  },

  es: {
    // Header & Navigation
    'app.title': 'ChromaMatrix',
    'app.badge': 'Datos por puntos de color',
    'nav.studio': 'Codificar',
    'nav.decoder': 'Decodificar',
    'nav.wiki': 'Wiki',
    'nav.benchmark': 'Prueba de impresión',
    'lang.toggle': '🌐 Idioma',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',

    // Studio Tab
    'studio.header.title': 'Codificar una matriz de color',
    'studio.header.subtitle': 'Convierte datos en puntos de color para salida digital o papel.',
    'studio.preset.label': 'Perfil de codificación',
    'preset.custom': '⚙️ Configuración personalizada',
    // Legacy fallbacks
    'preset.sticker': '🏷️ Sticker UV (35% ECC)',
    'preset.backup': '📄 Almacenamiento en frío (25% ECC)',
    'preset.fastphone': '📱 Escaneo móvil rápido (16 colores)',
    'preset.density': 'Máxima densidad (ASCII-95 / base95 binario seguro)',

    'studio.payload.label': 'Datos a codificar',
    'studio.btn.upload': 'Elegir archivo',
    'studio.payload.placeholder': 'Pega texto o elige un archivo...',
    'studio.palette.label': 'Paleta de color',
    'studio.compression.label': 'Compresión del payload',
    'opt.palette16': '16 colores · 4 bits/punto',
    'opt.palette8': '8 colores · 3 bits/punto · espectros separados',
    'opt.ascii95': 'ASCII-95 · base95 binario seguro',
    'opt.palette64': '64 colores · 6 bits/punto',
    'opt.palette256': '256 colores · 8 bits/punto',
    'opt.compression.none': 'Natural · sin compresión',
    'opt.compression.gzip': 'GZIP · compatible',
    'opt.compression.brotli': 'Brotli · predeterminado · payload más pequeño',
    'studio.ecc.label': 'Corrección de errores',
    'opt.ecc15': '15% ECC',
    'opt.ecc25': '25% ECC',
    'opt.ecc35': '35% ECC',
    'opt.ecc50': '50% ECC · máximo',
    'studio.shape.label': 'Forma del punto',
    'opt.circle': 'Círculos',
    'opt.rounded': 'Cuadrados redondeados',
    'opt.square': 'Cuadrados',
    'studio.size.label': 'Tamaño del punto (px)',
    'studio.previewSize.label': 'Tamaño de matriz en pantalla',
    'studio.swatches.label': 'Paleta de calibración',
    'stat.gridSize': 'Matriz',
    'stat.payloadLen': 'Carga',
    'stat.codewordLen': 'Bytes ECC',
    'stat.dotCount': 'Símbolos',
    'studio.btn.downloadPng': 'PNG',
    'studio.btn.downloadSvg': 'SVG',
    'studio.btn.openTab': 'Abrir',
    'studio.btn.copyImage': 'Copiar',
    'studio.btn.printSheet': 'Imprimir',
    'inspector.title': 'Vista previa',
    'inspector.hoverTip': 'Pasa sobre un punto para ver su color y coordenadas.',

    // Decoder Tab
    'decoder.header.title': 'Decodificar una matriz',
    'decoder.header.subtitle': 'Sube, pega o usa la cámara.',
    'decoder.mode.upload': 'Subir / pegar',
    'decoder.mode.camera': 'Cámara',
    'decoder.dropzone.title': 'Suelta o selecciona una imagen',
    'decoder.dropzone.subtitle': 'También puedes pegar con <b>Ctrl + V</b>.',
    'decoder.btn.browse': 'Seleccionar imagen',
    'decoder.btn.capture': 'Capturar',
    'decoder.btn.stopCamera': 'Detener',
    'decoder.btn.sampleClean': 'Limpia',
    'decoder.btn.sampleNoisy': 'Ruidosa',
    'decoder.samples.label': 'Muestras:',
    'decoder.tip.corners': 'Las esquinas se detectan automáticamente. Ajústalas si hace falta.',
    'decoder.label.sourceQuad': 'Imagen fuente',
    'decoder.label.rectified': 'Matriz rectificada',
    'decoder.label.output': 'Datos decodificados',
    'decoder.btn.copy': 'Copiar Texto',
    'decoder.btn.save': 'Guardar .txt',
    'decStat.grid': 'Matriz',
    'decStat.mode': 'Modo de Paleta',
    'decStat.ecc': 'Correcciones',
    'decStat.deltaE': 'Promedio ΔE',

    // Wiki Tab
    'wiki.header.title': 'Wiki de ChromaMatrix',
    'wiki.header.subtitle': 'Propósito, flujo, calibración y capacidad.',
    'wiki.purpose.title': 'Propósito',
    'wiki.purpose.text': 'Guarda texto o archivos como puntos de color para imprimirlos, escanearlos y recuperarlos sin conexión.',
    'wiki.workflow.title': 'Cómo funciona',
    'wiki.workflow.text': 'Codifica, imprime la matriz, escanéala y decodifica con calibración y corrección de errores.',
    'wiki.capacity.title': 'Qué significa capacidad',
    'wiki.capacity.text': 'Puntos pequeños y más colores guardan más datos, pero requieren mejor impresión, luz y escaneo.',
    'wiki.compression.title': 'Compresión del payload',
    'wiki.compression.text': 'Brotli o GZIP comprime el payload antes de Reed-Solomon, reduciendo el tamaño de la matriz y descomprimiéndolo automáticamente al decodificar.',
    'wiki.color.title': 'Color y calibración',
    'wiki.color.subtitle': 'Cómo el lector compensa cambios de color.',
    'capacity.paper.label': 'Papel',
    'capacity.ecc.label': 'ECC',
    'capacity.th.pitch': 'Paso de Punto (Tamaño)',
    'capacity.th.grid': 'Cuadrícula',
    'capacity.th.totalDots': 'Puntos Totales',
    'capacity.th.netBytes': 'Bytes Útiles Netos',
    'capacity.th.pages': 'Páginas Aprox. de Libro',
    'capacity.th.medium': 'Sustrato Óptimo / Dispositivo Lector',

    // Benchmark Tab
    'benchmark.header.title': 'Calibración de impresora',
    'benchmark.header.subtitle': 'Mide el cambio de color antes de confiar en un escaneo.',
    'benchmark.mode.label': 'Modo de prueba:',
    'benchmark.btn.generate': 'Generar',
    'benchmark.btn.synthetic': 'Simular ruido de impresión y luz',
    'benchmark.dropzone.title': 'Suelta o selecciona el escaneo',
    'benchmark.step.generate': '1. Genera una prueba',
    'benchmark.step.scan': '2. Escanea la prueba',
    'benchStat.patches': 'Muestras',
    'benchStat.drift': 'Desviación media',
    'benchStat.sep': 'Separación mínima',
    'benchStat.confused': 'Pares confundidos',

  }
};

let currentLang = 'en';

export function getLang() { return currentLang; }

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('chromamatrix_lang', lang);
    applyTranslations();
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

}

export function initI18n() {
  const savedLang = localStorage.getItem('chromamatrix_lang') || 'en';
  currentLang = translations[savedLang] ? savedLang : 'en';
  applyTranslations();
}
