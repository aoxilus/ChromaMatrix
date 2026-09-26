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
    'studio.preset.label': 'Encoding profile (palette + ECC)',
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
    'stat.gridSize': 'Matrix size (W × H)',
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
    'wiki.ecc.title': 'ECC and binary safety',
    'wiki.ecc.text': 'The default is 50% parity. ASCII-95 uses reversible base95 packing for arbitrary bytes; 256 colors maximize digital density but are less reliable in physical captures.',
    'wiki.lab.cielab.title': 'CIELAB distance',
    'wiki.lab.cielab.text': '<strong>ΔE</strong> estimates how different two captured colors look, even under changing light.',
    'wiki.lab.alignment.title': 'Alignment markers',
    'wiki.lab.alignment.text': '<strong>Black</strong> and <strong>white</strong> stay reserved for the four corners and timing tracks.',
    'wiki.lab.swatches.title': 'Calibration swatches',
    'wiki.lab.swatches.text': 'Known colors are printed with the matrix so the reader can measure printer fade and lighting drift.',
    'wiki.lab.rs.title': 'Reed-Solomon ECC',
    'wiki.lab.rs.text': 'Extra symbols help recover data from scratches, stains, and missing cells.',
    'wiki.lab.palette.title': 'Palette separation',
    'wiki.lab.palette.text': 'Click a swatch to compare its ΔE distance to the other colors.',
    'theory.palette8': '8-Color Palette (3 bits/dot)',
    'theory.palette16': '16-Color Palette (4 bits/dot · 1 nibble)',
    'theory.palette64': '64-Color Palette (6 bits/dot · Base64)',
    'theory.paletteAscii95': 'ASCII-95 Palette (binary-safe base95)',
    'theory.minDeltaE': 'Min ΔE',
    'theory.avgDeltaE': 'Avg ΔE',
    'capacity.paper.label': 'Paper',
    'capacity.ecc.label': 'ECC',
    'capacity.th.tier': 'Capture & Scanner Tier',
    'capacity.th.pitch': 'Dot Pitch (Size)',
    'capacity.th.grid': 'Grid Size',
    'capacity.th.totalDots': 'Total Dots',
    'capacity.th.netBytes': 'Net Usable Bytes',
    'capacity.th.pages': 'Approx. Book Pages',
    'capacity.th.medium': 'Optimal Substrate / Scanner Device',
    'capacity.th.palette8': '8-Color (3-bit)',
    'capacity.th.palette16': '16-Color (4-bit / 1 Nibble)',
    'capacity.th.ascii95': 'ASCII-95 (base95)',
    'capacity.th.palette256': '256-Color (8-bit)',
    'capacity.tier.casual_phone.name': 'Smartphone Photo (Handheld ~30cm)',
    'capacity.tier.casual_phone.reliability': 'High (moderate shake and room light)',
    'capacity.tier.macro_phone.name': 'Close-up Macro Camera (~15cm)',
    'capacity.tier.macro_phone.reliability': 'High (steady camera and good light)',
    'capacity.tier.flatbed_300dpi.name': 'Flatbed Scanner (300 DPI)',
    'capacity.tier.flatbed_300dpi.reliability': 'Extremely high (flat focus and even light)',
    'capacity.tier.flatbed_600dpi.name': 'High-Res Flatbed Scanner (600–1200 DPI)',
    'capacity.tier.flatbed_600dpi.reliability': 'Maximum density (precision printing and scanning)',
    'capacity.card.flatbed300.title': 'Flatbed Scanner (300 DPI)',
    'capacity.card.flatbed600.title': 'High-Res Flatbed (600–1200 DPI)',
    'capacity.card.sticker.text': '<strong>Pitch:</strong> 0.90 mm<br><strong>Letter:</strong> ~15.2 KB<br><strong>A4:</strong> ~15.8 KB<br>35% ECC for weather, scratches, and fading.',
    'capacity.card.backup.text': '<strong>Pitch:</strong> 0.50 mm<br><strong>Letter:</strong> ~71 KB<br><strong>A4:</strong> ~74 KB<br>25% ECC for documents, code, and recovery keys.',
    'capacity.card.flatbed300.text': '<strong>Pitch:</strong> 0.25 mm<br><strong>Letter:</strong> ~283 KB<br><strong>A4:</strong> ~295 KB<br>25% ECC; best with a flatbed scanner.',
    'capacity.card.flatbed600.text': '<strong>Pitch:</strong> 0.15 mm<br><strong>Letter:</strong> ~787 KB<br><strong>A4:</strong> ~820 KB<br>Reference capacity with 16 colors; 256 colors is a fragile digital ceiling.',

    // Benchmark Tab
    'benchmark.header.title': 'Printer calibration',
    'benchmark.header.subtitle': 'Measure color drift before trusting a scan.',
    'benchmark.mode.label': 'Test mode:',
    'benchmark.mode.test16': '16 colors · reliable',
    'benchmark.mode.test64': '64 colors · full range',
    'benchmark.mode.test256': '256 colors · dense',
    'benchmark.btn.generate': 'Generate',
    'benchmark.btn.synthetic': 'Simulate print and lighting noise',
    'benchmark.dropzone.title': 'Drop or select the scan',
    'benchmark.step.generate': '1. Generate a target',
    'benchmark.step.scan': '2. Scan the target',
    'benchmark.step.generate.text': 'Print it on the paper or sticker you will use.',
    'benchmark.step.scan.text': 'Use the same camera or scanner as the real data.',
    'benchmark.dropzone.browse': 'browse',
    'benchmark.result.title': 'Calibration result',
    'benchmark.result.subtitle': 'Drift, separation, and a safer palette.',
    'benchmark.result.empty.title': 'No scan yet',
    'benchmark.result.empty.text': 'Generate and scan a target to measure color drift.',
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
    'studio.preset.label': 'Perfil (paleta + ECC)',
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
    'stat.gridSize': 'Tamaño de matriz (ancho × alto)',
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
    'wiki.ecc.title': 'ECC y seguridad binaria',
    'wiki.ecc.text': 'El valor predeterminado es 50% de paridad. ASCII-95 usa empaquetado base95 reversible para bytes arbitrarios; 256 colores maximiza la densidad digital, pero es menos confiable en capturas físicas.',
    'wiki.lab.cielab.title': 'Distancia CIELAB',
    'wiki.lab.cielab.text': '<strong>ΔE</strong> estima cuánto difieren dos colores capturados, incluso con cambios de luz.',
    'wiki.lab.alignment.title': 'Marcadores de alineación',
    'wiki.lab.alignment.text': '<strong>Negro</strong> y <strong>blanco</strong> se reservan para las cuatro esquinas y las pistas de sincronización.',
    'wiki.lab.swatches.title': 'Muestras de calibración',
    'wiki.lab.swatches.text': 'La matriz incluye colores conocidos para medir el desgaste de la impresora y los cambios de iluminación.',
    'wiki.lab.rs.title': 'ECC Reed-Solomon',
    'wiki.lab.rs.text': 'Los símbolos adicionales ayudan a recuperar datos con rayones, manchas o celdas faltantes.',
    'wiki.lab.palette.title': 'Separación de paleta',
    'wiki.lab.palette.text': 'Haz clic en una muestra para comparar su distancia ΔE con los demás colores.',
    'theory.palette8': 'Paleta de 8 colores (3 bits/punto)',
    'theory.palette16': 'Paleta de 16 colores (4 bits/punto · 1 nibble)',
    'theory.palette64': 'Paleta de 64 colores (6 bits/punto · Base64)',
    'theory.paletteAscii95': 'Paleta ASCII-95 (base95 binario seguro)',
    'theory.minDeltaE': 'ΔE mínimo',
    'theory.avgDeltaE': 'ΔE promedio',
    'capacity.paper.label': 'Papel',
    'capacity.ecc.label': 'ECC',
    'capacity.th.tier': 'Nivel de captura y escáner',
    'capacity.th.pitch': 'Paso de Punto (Tamaño)',
    'capacity.th.grid': 'Cuadrícula',
    'capacity.th.totalDots': 'Puntos Totales',
    'capacity.th.netBytes': 'Bytes Útiles Netos',
    'capacity.th.pages': 'Páginas Aprox. de Libro',
    'capacity.th.medium': 'Sustrato Óptimo / Dispositivo Lector',
    'capacity.th.palette8': '8 colores (3 bits)',
    'capacity.th.palette16': '16 colores (4 bits / 1 nibble)',
    'capacity.th.ascii95': 'ASCII-95 (base95)',
    'capacity.th.palette256': '256 colores (8 bits)',
    'capacity.tier.casual_phone.name': 'Foto de smartphone (manual ~30 cm)',
    'capacity.tier.casual_phone.reliability': 'Alta (movimiento moderado y luz ambiente)',
    'capacity.tier.macro_phone.name': 'Cámara macro cercana (~15 cm)',
    'capacity.tier.macro_phone.reliability': 'Alta (cámara estable y buena luz)',
    'capacity.tier.flatbed_300dpi.name': 'Escáner plano (300 DPI)',
    'capacity.tier.flatbed_300dpi.reliability': 'Muy alta (foco plano y luz uniforme)',
    'capacity.tier.flatbed_600dpi.name': 'Escáner plano de alta resolución (600–1200 DPI)',
    'capacity.tier.flatbed_600dpi.reliability': 'Densidad máxima (impresión y escaneo de precisión)',
    'capacity.card.flatbed300.title': 'Escáner plano (300 DPI)',
    'capacity.card.flatbed600.title': 'Escáner plano de alta resolución (600–1200 DPI)',
    'capacity.card.sticker.text': '<strong>Paso:</strong> 0,90 mm<br><strong>Letter:</strong> ~15,2 KB<br><strong>A4:</strong> ~15,8 KB<br>35% ECC para clima, rayones y decoloración.',
    'capacity.card.backup.text': '<strong>Paso:</strong> 0,50 mm<br><strong>Letter:</strong> ~71 KB<br><strong>A4:</strong> ~74 KB<br>25% ECC para documentos, código y claves de recuperación.',
    'capacity.card.flatbed300.text': '<strong>Paso:</strong> 0,25 mm<br><strong>Letter:</strong> ~283 KB<br><strong>A4:</strong> ~295 KB<br>25% ECC; ideal con escáner plano.',
    'capacity.card.flatbed600.text': '<strong>Paso:</strong> 0,15 mm<br><strong>Letter:</strong> ~787 KB<br><strong>A4:</strong> ~820 KB<br>Capacidad de referencia con 16 colores; 256 colores es un techo digital frágil.',

    // Benchmark Tab
    'benchmark.header.title': 'Calibración de impresora',
    'benchmark.header.subtitle': 'Mide el cambio de color antes de confiar en un escaneo.',
    'benchmark.mode.label': 'Modo de prueba:',
    'benchmark.mode.test16': '16 colores · confiable',
    'benchmark.mode.test64': '64 colores · rango completo',
    'benchmark.mode.test256': '256 colores · denso',
    'benchmark.btn.generate': 'Generar',
    'benchmark.btn.synthetic': 'Simular ruido de impresión y luz',
    'benchmark.dropzone.title': 'Suelta o selecciona el escaneo',
    'benchmark.step.generate': '1. Genera una prueba',
    'benchmark.step.scan': '2. Escanea la prueba',
    'benchmark.step.generate.text': 'Imprímela en el papel o sticker que vas a usar.',
    'benchmark.step.scan.text': 'Usa la misma cámara o escáner que usarás con los datos reales.',
    'benchmark.dropzone.browse': 'buscar',
    'benchmark.result.title': 'Resultado de calibración',
    'benchmark.result.subtitle': 'Desviación, separación y una paleta más segura.',
    'benchmark.result.empty.title': 'Aún no hay escaneo',
    'benchmark.result.empty.text': 'Genera y escanea una prueba para medir el cambio de color.',
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
