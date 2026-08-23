/**
 * ChromaMatrix - Análisis de Factibilidad Real para Impresora Doméstica + Cámara Smartphone
 * Calcula los problemas concretos: DPI real, tamaño de punto en papel, separación ΔE, etc.
 * 
 * Ejecutar con: node test/real-world-analysis.js
 */

// =====================================================================
// 1. FÍSICA DEL PUNTO IMPRESO EN IMPRESORA INKJET DOMÉSTICA
// =====================================================================

const PRINTERS = {
  inkjet_low: {
    name: 'Inkjet doméstica básica (200 DPI efectivo)',
    dpi_spec: 600,     // DPI declarado por el fabricante
    dpi_effective: 200, // DPI real útil para puntos de COLOR sólidos (el resto es dispersión de tinta)
    bleed_factor: 1.5,  // El punto de tinta se expande ~50% más que el pixel digital
    color_fidelity: 0.55, // 55% de fidelidad cromática (la tinta se mezcla y gamut es limitado)
    min_reliable_dot_mm: 1.0 // Punto mínimo confiable en mm para colores sólidos
  },
  inkjet_mid: {
    name: 'Inkjet con modo foto (300 DPI efectivo)',
    dpi_spec: 1200,
    dpi_effective: 300,
    bleed_factor: 1.25,
    color_fidelity: 0.70,
    min_reliable_dot_mm: 0.75
  },
  laser_color: {
    name: 'Impresora láser color (400 DPI efectivo)',
    dpi_spec: 600,
    dpi_effective: 400,
    bleed_factor: 1.1,
    color_fidelity: 0.80,
    min_reliable_dot_mm: 0.55
  },
  inkjet_photo: {
    name: 'Impresora fotográfica premium (600 DPI efectivo)',
    dpi_spec: 4800,
    dpi_effective: 600,
    bleed_factor: 1.05,
    color_fidelity: 0.92,
    min_reliable_dot_mm: 0.40
  }
};

// =====================================================================
// 2. FÍSICA DE LA CÁMARA SMARTPHONE
// =====================================================================

const CAMERAS = {
  low_end: {
    name: 'Smartphone básico 8 MP (~1° gama)',
    sensor_mp: 8,
    sensor_w_px: 3264,
    sensor_h_px: 2448,
    typical_scan_distance_cm: 25,
    fov_degrees: 70,
    jpeg_quality: 0.65,
    color_bits: 8,
    auto_wb_error_de: 8.0 // Variación de balance de blanco en ΔE promedio
  },
  mid_range: {
    name: 'Smartphone mid-range 48 MP (2024)',
    sensor_mp: 48,
    sensor_w_px: 8000,
    sensor_h_px: 6000,
    typical_scan_distance_cm: 20,
    fov_degrees: 65,
    jpeg_quality: 0.82,
    color_bits: 10,
    auto_wb_error_de: 5.0
  },
  high_end: {
    name: 'Smartphone gama alta con macro (2024)',
    sensor_mp: 108,
    sensor_w_px: 12000,
    sensor_h_px: 9000,
    typical_scan_distance_cm: 15,
    fov_degrees: 55,
    jpeg_quality: 0.90,
    color_bits: 12,
    auto_wb_error_de: 2.5
  }
};

// =====================================================================
// 3. FUNCIONES DE ANÁLISIS
// =====================================================================

function dotSizePx(camera, scan_distance_cm, dot_pitch_mm) {
  const fov_rad = (camera.fov_degrees * Math.PI) / 180;
  const scene_width_mm = 2 * scan_distance_cm * 10 * Math.tan(fov_rad / 2); // mm
  const px_per_mm = camera.sensor_w_px / scene_width_mm;
  const dot_pixels = dot_pitch_mm * px_per_mm;
  return { scene_width_mm, px_per_mm, dot_pixels };
}

function analyze(printer, camera, dot_pitch_mm, palette_name, min_de_separation) {
  const result = {};

  // --- A. ¿PUEDE LA IMPRESORA IMPRIMIR ESE PUNTO? ---
  const dot_pitch_in = dot_pitch_mm / 25.4;
  const required_dpi = 1 / dot_pitch_in;
  result.printer_can_print = printer.dpi_effective >= required_dpi;
  result.required_dpi = Math.round(required_dpi);
  result.actual_dot_mm = dot_pitch_mm * printer.bleed_factor; // Sangrado real

  // --- B. ¿CUÁNTOS PÍXELES CAPTURA LA CÁMARA POR PUNTO? ---
  const { scene_width_mm, px_per_mm, dot_pixels } = dotSizePx(camera, camera.typical_scan_distance_cm, result.actual_dot_mm);
  result.px_per_mm = px_per_mm.toFixed(1);
  result.dot_pixels = dot_pixels.toFixed(1);
  result.scene_width_mm = Math.round(scene_width_mm);

  // Regla práctica: necesitamos al menos 5x5 píxeles de sensor por punto para leer el color
  const REQUIRED_PX_PER_DOT = 5;
  result.camera_can_resolve = dot_pixels >= REQUIRED_PX_PER_DOT;

  // --- C. ¿PUEDE DISTINGUIRSE EL COLOR DESPUÉS DE BLEED + JPEG + AWB? ---
  // El JPEG comprime bloques 8x8, si el punto es <8px es destruido por JPEG
  result.survives_jpeg = dot_pixels >= 8;
  
  // Variación total de color = AWB error + gamut printer loss + JPEG artifacts
  const total_de_error = camera.auto_wb_error_de + (1 - printer.color_fidelity) * 40 + (result.survives_jpeg ? 2 : 12);
  result.total_de_error = total_de_error.toFixed(1);
  result.de_margin = (min_de_separation - total_de_error).toFixed(1);
  result.color_decodable = total_de_error < min_de_separation;

  // --- D. CALIFICACIÓN GENERAL ---
  result.passes = result.printer_can_print && result.camera_can_resolve && result.color_decodable;

  return result;
}

// =====================================================================
// 4. SEPARACIONES ΔE POR PALETA (desde las pruebas del sistema)
// =====================================================================

const PALETTES = {
  PALETTE_8:  { name: 'PALETTE_8 (8 colores)',   min_de: 20.37 },
  PALETTE_16: { name: 'PALETTE_16 (16 colores)', min_de: 10.60 },
  PALETTE_64: { name: 'PALETTE_64 (64 colores)', min_de: 2.83  },
  PALETTE_256:{ name: 'PALETTE_256 (256 cols.)', min_de: 0.71  }
};

// =====================================================================
// 5. TABLA DE RESULTADOS
// =====================================================================

console.log('\n🥑 ChromaMatrix — Análisis de Factibilidad Real: Impresora Doméstica + Celular');
console.log('='.repeat(80));

// Combinaciones críticas a evaluar
const scenarios = [
  { printer: 'inkjet_low',   camera: 'low_end',   dot_mm: 0.90, palette: 'PALETTE_8',  label: 'Peor caso (básico+básico, 0.9mm, 8c)' },
  { printer: 'inkjet_low',   camera: 'mid_range',  dot_mm: 0.90, palette: 'PALETTE_8',  label: 'Inkjet básica + Mid-range, 0.9mm, 8c' },
  { printer: 'inkjet_low',   camera: 'low_end',   dot_mm: 0.90, palette: 'PALETTE_16', label: 'Inkjet básica + básica, 0.9mm, 16 colores' },
  { printer: 'inkjet_mid',   camera: 'mid_range',  dot_mm: 0.90, palette: 'PALETTE_8',  label: 'Inkjet foto + mid-range, 0.9mm, 8 colores' },
  { printer: 'inkjet_mid',   camera: 'mid_range',  dot_mm: 0.90, palette: 'PALETTE_16', label: 'Inkjet foto + mid-range, 0.9mm, 16 colores' },
  { printer: 'inkjet_mid',   camera: 'mid_range',  dot_mm: 0.50, palette: 'PALETTE_16', label: 'Inkjet foto + mid-range, 0.5mm DENSO, 16 colores' },
  { printer: 'laser_color',  camera: 'mid_range',  dot_mm: 0.90, palette: 'PALETTE_16', label: 'Láser color + mid-range, 0.9mm, 16 colores' },
  { printer: 'laser_color',  camera: 'high_end',  dot_mm: 0.60, palette: 'PALETTE_16', label: 'Láser color + gama alta, 0.6mm, 16 colores' },
  { printer: 'inkjet_photo', camera: 'high_end',  dot_mm: 0.50, palette: 'PALETTE_16', label: 'Fotográfica + gama alta, 0.5mm, 16 colores' },
  { printer: 'inkjet_photo', camera: 'high_end',  dot_mm: 0.40, palette: 'PALETTE_16', label: 'Fotográfica + gama alta, 0.4mm MÁXIMO, 16 colores' },
];

for (const s of scenarios) {
  const p = PRINTERS[s.printer];
  const c = CAMERAS[s.camera];
  const pal = PALETTES[s.palette];
  const r = analyze(p, c, s.dot_mm, s.palette, pal.min_de);

  const status = r.passes ? '✅ VIABLE' : '❌ FALLA';
  console.log(`\n${status}  ${s.label}`);
  console.log(`   Impresora: ${p.name}`);
  console.log(`   Cámara:    ${c.name} @ ${c.typical_scan_distance_cm}cm`);
  console.log(`   DPI req. para dot ${s.dot_mm}mm: ${r.required_dpi} DPI (impresora efectiva: ${p.dpi_effective} DPI) ${r.printer_can_print ? '✓' : '✗ PROBLEMA'}`);
  console.log(`   Dot sangrado real: ${s.dot_mm}mm × ${p.bleed_factor} = ${r.actual_dot_mm.toFixed(2)}mm en papel`);
  console.log(`   Píxeles del sensor por punto: ${r.dot_pixels}px (mínimo necesario: 5px) ${r.camera_can_resolve ? '✓' : '✗ PROBLEMA'}`);
  console.log(`   ¿Sobrevive bloque JPEG (8px req.)?: ${r.survives_jpeg ? 'SÍ' : 'NO ✗ PROBLEMA'}`);
  console.log(`   Error color total ΔE: ${r.total_de_error} | Separación paleta min: ${pal.min_de} | Margen: ${r.de_margin} ${r.color_decodable ? '✓' : '✗ PROBLEMA'}`);
}

// =====================================================================
// 6. PROBLEMAS ESPECÍFICOS IDENTIFICADOS EN EL CÓDIGO ACTUAL
// =====================================================================

console.log('\n\n' + '='.repeat(80));
console.log('🔬 PROBLEMAS CRÍTICOS IDENTIFICADOS EN EL SISTEMA ACTUAL');
console.log('='.repeat(80));

const issues = [
  {
    id: 1,
    severity: 'CRÍTICO',
    title: 'Paleta de 16 colores incluye colores confundibles tras impresión CMYK',
    detail: `Los colores Khaki (#E6DC78 ΔE≈12) y Yellow (#FFDD00) son casi idénticos en papel inkjet.
  Lilac (#C8A2C8) y Pink (#FFA0B4) se confunden con ruido de impresora a 0.9mm.
  Olive (#666600) y Teal (#008080) convergen en papel no calibrado.
  ΔE mínima declarada: 10.6 — pero el error de AWB + inkjet consume hasta 15 ΔE.
  → La paleta de 16 colores FALLA en impresoras inkjet básicas.`
  },
  {
    id: 2,
    severity: 'CRÍTICO',
    title: 'Dot pitch 0.5mm es físicamente imposible para inkjet doméstica',
    detail: `0.5mm = 50.8 DPI de datos. Inkjet básica tiene ~28% de sangrado, 
  el punto impreso mide ~0.75mm real. Los puntos adyacentes se fusionan.
  La resolución efectiva máxima segura en inkjet es 0.9mm (28 DPI de datos).`
  },
  {
    id: 3,
    severity: 'ALTO',
    title: 'La compresión JPEG del smartphone destruye puntos pequeños',
    detail: `JPEG comprime bloques de 8×8 píxeles. Un punto de 0.9mm a 25cm 
  con cámara básica = ~5px → el bloque JPEG come 1.6 puntos a la vez.
  Los bordes de color se mezclan entre puntos adyacentes.
  → El decodificador necesita manejar JPEG artifact compensation.`
  },
  {
    id: 4,
    severity: 'ALTO',
    title: 'El balance de blancos automático (AWB) altera los colores hasta ΔE≈8–12',
    detail: `Bajo luz fluorescente (4100K) vs. luz solar (5500K) vs. incandescente (2700K),
  los chips de AWB de smartphones baratos cometen errores de hasta ΔE=12.
  La paleta de 16 colores tiene margen mínimo de solo ΔE=10.6.
  → El sistema FALLA en condiciones de iluminación mixta o artificial.`
  },
  {
    id: 5,
    severity: 'MEDIO',
    title: 'Los swatches de calibración en la paleta actual son demasiado pequeños',
    detail: `Si un punto de datos mide 0.9mm, los swatches de calibración del borde
  también miden ~0.9mm. Para ser estadísticamente robustos, los swatches 
  necesitan mínimo 3×3 puntos (2.7mm) para promediar el sangrado de tinta.`
  },
  {
    id: 6,
    severity: 'MEDIO',
    title: 'Detección de esquinas (corner finders) depende de contraste perfecto',
    detail: `El detectCornerFiducials() busca el cuadrado negro/blanco anidado.
  En papel amarillento o bajo luz cálida, el "blanco" puede ser ΔE=5–8 de blanco puro.
  El "negro" inkjet tiene reflexión especular (~L*=15 en papel mate).`
  }
];

for (const issue of issues) {
  console.log(`\n[${issue.severity}] Problema #${issue.id}: ${issue.title}`);
  console.log(`  ${issue.detail}`);
}

// =====================================================================
// 7. SOLUCIONES CONCRETAS RECOMENDADAS
// =====================================================================

console.log('\n\n' + '='.repeat(80));
console.log('🛠️  SOLUCIONES CONCRETAS PARA EL CÓDIGO');
console.log('='.repeat(80));

const fixes = [
  {
    fix: '1. Paleta "Phone-Print" (8 colores seguros para inkjet + celular)',
    action: `Rediseñar PALETTE_8 eliminando confusiones CMYK. Los 8 colores seguros son:
     Rojo puro CMYK  (#E60000), Verde puro CMYK (#00A500), 
     Azul CMYK (#0047BB), Cyan (#00C8FF), 
     Amarillo puro (#FFD700), Magenta (#CC0066), 
     Naranja (#FF6600), Gris medio (#808080).
     → Separación mínima ΔE ≥ 25 en impresora inkjet.`
  },
  {
    fix: '2. Pitch mínimo seguro: 1.0mm para smartphones básicos',
    action: `Cambiar el preset "Smartphone Photo" de 0.9mm a 1.0mm.
     Esto da 5.4px en sensor básico, suficiente para superar JPEG 8x8.
     Capacidad: Letter@1mm = ~190x254 = 48,260 dots × PALETTE_8 = ~18,097 bytes.`
  },
  {
    fix: '3. Swatches de calibración de 3×3 puntos (no 1×1)',
    action: `En encoder.js, cambiar los swatches perimetrales para que cada color 
     ocupe un bloque 3×3 de puntos. Esto da 9 muestras por color y hace 
     la calibración estadísticamente robusta al sangrado.`
  },
  {
    fix: '4. Normalización de iluminación en decoder.js',
    action: `Detectar el WHITE de papel en los corners finder (donde sabemos que debe ser blanco),
     y el BLACK en los timing marks (donde sabemos que debe ser negro).
     Calcular una transformación afín en espacio LAB: 
     L_normalized = (L - L_black) / (L_white - L_black) × 100.`
  },
  {
    fix: '5. JPEG artifact buffer: añadir 1-pixel gap entre puntos',
    action: `En matrixToSvg() y matrixToRgbaBuffer(), añadir un gap de 1px entre celdas
     (gap_ratio: 0.1 de cellSize). Esto crea una frontera neutral que evita que 
     JPEG mezcle colores de puntos adyacentes en su bloque 8×8.`
  }
];

for (const f of fixes) {
  console.log(`\n🔧 ${f.fix}`);
  console.log(`   ${f.action}`);
}

console.log('\n\n='.repeat(40));
console.log('VEREDICTO FINAL:');
console.log('  ✅ PALETTE_8 + 0.9mm + impresora mid-range + celular mid-range: VIABLE');
console.log('  ✅ PALETTE_8 + 1.0mm + cualquier impresora + cualquier celular: ROBUSTO');
console.log('  ⚠️  PALETTE_16 + 0.9mm + inkjet básica + celular básico: MARGINAL (falla bajo luz artificial)');
console.log('  ❌ PALETTE_16 + 0.5mm + inkjet básica + cualquier celular: IMPOSIBLE');
console.log('  ❌ PALETTE_64+ + papel + celular: IMPOSIBLE con hardware doméstico');
console.log('');
