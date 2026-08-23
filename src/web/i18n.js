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
    'app.badge': 'Offline Paper & UV Sticker Optical Data',
    'nav.studio': 'Matrix Studio (Encoder)',
    'nav.decoder': 'Scan & Decode (Instant)',
    'nav.capacity': 'Sheet Capacity Report',
    'nav.benchmark': 'Printer & Ink Lab',
    'nav.theory': 'Color Science',
    'lang.toggle': '🌐 Language',

    // Studio Tab
    'studio.header.title': 'Optical Data Matrix Generator',
    'studio.header.subtitle': 'Direct color-dot encoding for offline paper backups, UV ink printing & physical sticker tags',
    'studio.preset.label': '🎯 Target Medium & Reliability Preset',
    'preset.sticker': '🏷️ Outdoor UV Ink & Sticker Tag (Heavy-Duty 35% ECC)',
    'preset.backup': '📄 Paper Cold Storage Backup (Standard 25% ECC)',
    'preset.fastphone': '📱 Fast Mobile Phone Scan (High Speed 16-Color)',
    'preset.density': '💾 Maximum Density (ASCII-95 / 1 Dot = 1 Char)',
    'preset.custom': '⚙️ Custom Manual Configuration...',
    'studio.payload.label': 'Payload Data (Text / Keys / Seed Phrase / Manual)',
    'studio.btn.upload': 'Upload File...',
    'studio.payload.placeholder': 'Type or paste emergency data, recovery keys, offline manual, or backup text...',
    'studio.palette.label': 'Color Palette Mode',
    'opt.palette16': '16 Colors (4 bits/dot - 1 Nibble) - Recommended',
    'opt.palette8': '8 Colors (3 bits/dot) - Maximum Outdoor Contrast',
    'opt.ascii95': 'ASCII-95 (1 Dot = 1 Exact ASCII Character)',
    'opt.palette64': '64 Colors (6 bits/dot - Base64)',
    'opt.palette256': '256 Colors (8 bits/dot - High Density Scan)',
    'studio.ecc.label': 'Error Correction (RS-ECC)',
    'opt.ecc15': '15% ECC (High Cleanliness)',
    'opt.ecc25': '25% ECC (Standard Paper Backup)',
    'opt.ecc35': '35% ECC (Heavy-Duty UV / Stickers)',
    'opt.ecc50': '50% ECC (Maximum Scratch Resilience)',
    'studio.shape.label': 'Dot Geometry',
    'opt.circle': 'Circular Dots (Anti-Bleed UV)',
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
    'app.badge': 'Datos Ópticos en Papel y Stickers UV Offline',
    'nav.studio': 'Estudio de Matriz (Codificador)',
    'nav.decoder': 'Escanear y Decodificar (Instantáneo)',
    'nav.capacity': 'Reporte de Capacidad en Hoja',
    'nav.benchmark': 'Laboratorio de Impresora y Tintas',
    'nav.theory': 'Ciencia del Color',
    'lang.toggle': '🌐 Idioma',

    // Studio Tab
    'studio.header.title': 'Generador de Matrices de Datos Ópticos',
    'studio.header.subtitle': 'Codificación directa de puntos de color para respaldos en papel, impresión con tinta UV y etiquetas físicas',
    'studio.preset.label': '🎯 Medio Objetivo y Perfil de Confiabilidad',
    'preset.sticker': '🏷️ Tinta UV y Etiquetas Adhesivas (Resistente 35% ECC)',
    'preset.backup': '📄 Respaldo de Almacenamiento en Frío (Estándar 25% ECC)',
    'preset.fastphone': '📱 Escaneo Rápido con Móvil (Alta Velocidad 16 Colores)',
    'preset.density': '💾 Máxima Densidad (ASCII-95 / 1 Punto = 1 Carácter)',
    'preset.custom': '⚙️ Configuración Manual Personalizada...',
    'studio.payload.label': 'Datos de Carga Útil (Texto / Claves / Semilla / Manual)',
    'studio.btn.upload': 'Subir Archivo...',
    'studio.payload.placeholder': 'Escribe o pega datos de emergencia, claves de recuperación, manuales offline o texto de respaldo...',
    'studio.palette.label': 'Modo de Paleta de Color',
    'opt.palette16': '16 Colores (4 bits/punto - 1 Nibble) - Recomendado',
    'opt.palette8': '8 Colores (3 bits/punto) - Máximo Contraste Exterior',
    'opt.ascii95': 'ASCII-95 (1 Punto = 1 Carácter ASCII Exacto)',
    'opt.palette64': '64 Colores (6 bits/punto - Base64)',
    'opt.palette256': '256 Colores (8 bits/punto - Escaneo de Alta Densidad)',
    'studio.ecc.label': 'Corrección de Errores (RS-ECC)',
    'opt.ecc15': '15% ECC (Máxima Limpieza)',
    'opt.ecc25': '25% ECC (Respaldo en Papel Estándar)',
    'opt.ecc35': '35% ECC (Uso Rudo UV / Stickers)',
    'opt.ecc50': '50% ECC (Máxima Resistencia a Rayones)',
    'studio.shape.label': 'Geometría del Punto',
    'opt.circle': 'Puntos Circulares (Anti-sangrado UV)',
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

export function getLang() {
  return currentLang;
}

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
  if (langSelect && langSelect.value !== currentLang) {
    langSelect.value = currentLang;
  }
}

export function initI18n() {
  const saved = localStorage.getItem('chromamatrix_lang') || 'en';
  currentLang = translations[saved] ? saved : 'en';
  applyTranslations();
}
