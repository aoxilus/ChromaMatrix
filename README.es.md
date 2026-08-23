# 🥑 ChromaMatrix — Almacenamiento Óptico de Datos en Papel y Decodificador por Puntos de Color

> **Almacenamiento óptico de datos offline en papel estándar y etiquetas adhesivas mediante matrices de puntos de color de alta densidad, calibración perceptual CIELAB en tiempo real y recuperación de errores Reed-Solomon $GF(2^8)$.**

> **[Read in English 🇺🇸](README.md)** · **[Leer en Español 🇪🇸](README.es.md)**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Licencia-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Autor: aoxilus](https://img.shields.io/badge/Autor-aoxilus%20🥑-brightgreen.svg)](https://github.com/aoxilus)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org)

---

## Características Principales

1. **Marco Perimetral Reservado Blanco y Negro**: Patrones de localización en las esquinas, pistas de sincronización y marcas de rango dinámico que reservan estrictamente el Negro Puro y Blanco de Papel para registro espacial y exposición.
2. **Muestrario de Calibración en Hoja (*Self-Calibrating Swatches*)**: Muestras de la paleta impresas en los bordes para que el decodificador normalice las tintas CMYK de la impresora, la reflectancia del papel y los cambios de luz ambiental.
3. **Modos de Paleta Multi-Color**:
   - `PALETTE_8` (3 bits/punto): Ultra-alto contraste y máxima tolerancia a exteriores.
   - `PALETTE_16` (4 bits = 1 nibble/punto, 2 puntos/byte): Densidad y estabilidad óptima.
   - `PALETTE_64` (6 bits/punto): Empaquetado Base64 directo.
   - `ASCII_95` (ASCII Imprimible 32–126): Asignación directa 1 a 1 de caracteres.
   - `PALETTE_256` (8 bits / 1 byte por punto): Máxima densidad física para escáneres.
4. **Código de Corrección de Errores Reed-Solomon (RS-ECC)**: Aritmética completa en el Campo de Galois $GF(2^8)$ con algoritmo Berlekamp-Massey para recuperar datos dañados por manchas, arrugas o reflejos.
5. **Laboratorio de Fidelidad de Impresora y Escáner**: Mide desviaciones de color ($\Delta E$), genera matrices de confusión y recomienda automáticamente la mejor paleta para tu hardware.
6. **Arquitectura Cero Dependencias**: Ejecutable directamente en el navegador (HTML5 Canvas/Webcam) y en Node.js para CLI y servidor.
7. **Interfaz Bilingüe (EN / ES)**: Soporte completo en inglés y español con selector de idioma en vivo.

---

## Estado del Arte y Fundamentos Teóricos

Para un análisis exhaustivo de sistemas relacionados (Microsoft HCCB, Zebra Ultracode, Twibright Optar, PaperBack, HCC2D, MMCC, teoría de color CIELAB) y una matriz comparativa completa:
👉 **[Documentación: Análisis del Estado del Arte y Arte Previo](docs/PRIOR_ART_AND_COMPARISON.es.md)** (o **[versión en inglés](docs/PRIOR_ART_AND_COMPARISON.md)**)

---

## Inicio Rápido

### 1. Iniciar la Aplicación Web Interactiva
```bash
npm start
```
Abre **`http://localhost:3000`** en tu navegador para acceder a:
- **Matrix Studio (Codificador)**: Generador en tiempo real, inspector de celdas, exportación SVG/PNG/Impresión.
- **Scan & Decode (Decodificador)**: Arrastrar y soltar archivos, pegar desde portapapeles (`Ctrl+V`) o cámara web en vivo.
- **Reporte de Capacidad**: Tabla de límites físicos en hojas Carta y A4.
- **Laboratorio de Impresora**: Generador de hojas de prueba y analizador de $\Delta E$.
- **Ciencia del Color**: Visualizador de distancias perceptuales CIELAB.

### 2. Comandos CLI en Terminal

#### Codificar Texto o Archivo
```bash
npm run encode -- --input "Hola Mundo" --output matrix.png --mode PALETTE_16
```

#### Decodificar Imagen Escaneada
```bash
npm run decode -- --image matrix.png
```

#### Medir Fidelidad de Color de la Impresora
```bash
# Paso 1: Generar objetivo de calibración
npm run benchmark -- --generate target.png --mode TEST_64

# Paso 2: Analizar objetivo escaneado / fotografiado
npm run benchmark -- --analyze target.png --mode TEST_64
```

### 3. Ejecutar Pruebas Automatizadas
```bash
npm test
```

---

## 📌 Roadmap y Optimizaciones Pendientes

Mejoras identificadas para futuras versiones de densidad y rendimiento:

- [ ] **Pipelines de Compresión de Flujo (Gzip / Brotli / Zstandard / Deflate)**: Pre-compresión automática de texto antes de la asignación cromática, reduciendo el tamaño físico de la matriz entre 40% y 70% en textos largos.
- [ ] **Tokenización y Huffman Consciente del Idioma (BPE)**: Asignación de secuencias más cortas a palabras y caracteres de alta frecuencia según el idioma.
- [ ] **Mapeo Binario-a-Símbolo Eficiente**: Optimización Base85 / Z85 para maximizar la entropía por punto físico.
- [ ] **Deduplicación y Hash de Fragmentos**: Cabeceras de índice de contenido para documentos multi-página.

---

## Licencia

Publicado bajo licencia **Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)**. Consulta el archivo [`LICENSE`](LICENSE) para más información.

---

Made with 🥑 by [aoxilus](https://github.com/aoxilus)
