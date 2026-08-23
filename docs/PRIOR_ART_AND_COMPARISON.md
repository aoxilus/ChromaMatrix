# ChromaMatrix — Estado del Arte, Arte Previo y Comparativa Técnica
## (State of the Art, Prior Art & Architectural Comparison)

---

## 1. Resumen Ejecutivo (Executive Summary)

**ChromaMatrix** se sitúa en la intersección de dos disciplinas tecnológicas:
1. **Códigos Matriciales Ópticos 2D a Color de Alta Densidad** (*High-Capacity Color 2D Barcodes*).
2. **Almacenamiento Físico de Datos en Frío / Respaldo en Papel** (*Optical Paper Cold Storage & Air-Gapped Archival*).

El principio fundamental consiste en aprovechar la dimensión del **color cromático** (espacio tridimensional RGB/CMYK o perceptual $L^*a^*b^*$) para superar el límite teórico de 1 bit por celda de los códigos bidimensionales monocromáticos tradicionales (como QR Code o Data Matrix), alcanzando entre 3 y 8 bits por punto físico impreso, protegido por códigos de corrección de errores **Reed-Solomon** en el campo de Galois $GF(2^8)$.

Este documento consolida la investigación de patentes, literatura académica y proyectos de código abierto previos, contextualizando las innovaciones arquitectónicas de **ChromaMatrix**.

---

## 2. Cronología y Taxonomía del Arte Previo (1985 – Presente)

```
[1985] Cauzin Softstrip ──> Tiras ópticas impresas en revistas (B/N analógico-digital)
   │
[2007] Twibright Optar ───> Archivo de ficheros en papel A4 (Golay ECC, B/N)
[2007] MS HCCB / Tag ─────> Triángulos de 4 u 8 colores (Microsoft Research)
[2008] PaperBack ─────────> Respaldo de hasta 5.8 MB en A4 (Reed-Solomon, B/N 600 DPI)
[2008] MMCC (Stanford) ───> Multiplexación por canales de color para cámaras móviles
   │
[2011] HCC2D (Querini) ───> QR coloreado con muestras de referencia perimetrales
[2012] COBRA / PMCode ────> Uso de espacio CIELAB ΔE para mitigar aberración cromática
[2015] Zebra Ultracode ───> Estándar de código de barras 2D a color (AIM/ISO 2023)
   │
[HOY]  ChromaMatrix ──────> Almacenamiento en papel/adhesivos, autocalibración CIELAB en vivo,
                            benchmark de fidelidad de impresora, suites multi-paleta y stack Web/Node.
```

---

### A. Precursores de Almacenamiento de Ficheros en Papel (*Paper Cold Storage*)

#### 1. Cauzin Softstrip (1985)
* **Pionero histórico.** Sistema propietario creado por Cauzin Systems.
* Permitía imprimir programas de software en tiras de papel dentro de revistas de informática de la época (para Apple II, Commodore 64, IBM PC), las cuales se leían pasando un lector óptico motorizado sobre la hoja.
* **Limitación:** Extremadamente dependiente de hardware de lectura propietario y densidad muy baja (~500 bytes por tira).

#### 2. Twibright Optar (2007)
* **Autor:** Twibright Labs (Open Source).
* **Tecnología:** Convierte archivos binarios arbitrarios en matrices impresas para hojas A4 con impresoras láser comunes.
* **Capacidad:** Alrededor de 200 KB a 1 MB por página.
* **Corrección de errores:** Código de Golay (23,12), similar al utilizado por las sondas espaciales Voyager.
* **Diferencia con ChromaMatrix:** Optar es estrictamente monocromático (blanco/negro). No aprovecha la dimensión de color, lo que reduce drásticamente la densidad de información por milímetro cuadrado.

#### 3. PaperBack (2008)
* **Autor:** Piotr Bushuev.
* **Tecnología:** Utilidad de Windows para respaldar archivos en hojas de papel A4 a resoluciones de hasta 600 DPI con compresión integrada.
* **Capacidad:** Hasta 5.8 MB por página en condiciones ideales de laboratorio.
* **Corrección de errores:** Reed-Solomon.
* **Limitaciones:**
  - Requiere un escáner plano de alta gama calibrado a 600 DPI; es prácticamente ilegible para cámaras de smartphones convencionales debido a la ausencia de calibración adaptativa de iluminación y perspectiva.
  - Al ser monocromático, depende de tamaños de punto microscópicos (1–2 píxeles de impresora), haciéndolo muy vulnerable a motas de polvo o sangrado de tinta.

---

### B. Desarrollos Industriales y Comerciales de Códigos 2D a Color

#### 1. High Capacity Color Barcode (HCCB) / Microsoft Tag (2007–2015)
* **Desarrollador:** Gavin Jancke (Microsoft Research).
* **Estructura:** Utilizaba una cuadrícula de triángulos de 4 u 8 colores delimitada por un borde negro y barras de alineación.
* **Aportes clave:** Demostró la viabilidad de empaquetar más datos por área física mediante el uso de múltiples tonos cromáticos.
* **Causa de declive:** Microsoft orientó la tecnología hacia marketing y redirección web (*Microsoft Tag*). Ante la popularización de las cámaras en smartphones con autofoco rápido, el código QR estándar (abierto y sin costes de licencia) canibalizó su adopción. El servicio en la nube cerró en 2015.

#### 2. Ultracode (Zebra Technologies, 2015 / Estándar AIM 2023)
* **Desarrollador:** Zebra Technologies.
* **Estructura:** Código 2D de relación de aspecto rectangular similar a códigos lineales, con celdas de color (hasta 8 colores y escala de grises) y corrección Reed-Solomon (RSEC).
* **Enfoque:** Diseñado para etiquetas de trazabilidad industrial e identificación en salud/farmacia, pensado para ser decodificado por lectores industriales de Zebra y cámaras sRGB.

---

### C. Investigación Académica Especializada

#### 1. HCC2D (High Capacity Colored 2-Dimensional Code) — Querini et al. (2011–2014)
* **Institución:** Universidad de Roma Tor Vergata.
* **Innovación:** Tomó la base del estándar QR y reemplazó los módulos de datos monocromáticos por celdas de 4, 8 y 16 colores.
* **Mecanismo de Calibración:** Introdujo **celdas de color de referencia** situadas alrededor del perímetro para que el decodificador pudiera reconstruir la distorsión del canal (impresora CMYK $\rightarrow$ papel $\rightarrow$ sensor de cámara RGB).

#### 2. MMCC (Mobile Multi-Colour Composite Code) — Stanford University (2008)
* **Innovación:** Multiplexación de canales de color en el espacio RGB para incrementar la tasa de bits en transferencias ópticas leídas por cámaras de baja resolución, estudiando el impacto de la compresión JPEG en los bordes de celda.

#### 3. Rainbow Barcodes & Color Calibration Models — HP Labs & Purdue University (2007–2010)
* **Aporte:** Modelado formal de las transformaciones colorimétricas no lineales entre tintas sustractivas (CMY/CMYK) y sensores aditivos (RGB), demostrando la necesidad de muestreo perimetral continuo para contrarrestar gradientes de sombra.

#### 4. COBRA & PMCode (2012–2015)
* **Aporte:** Introducción formal del espacio de color uniforme perceptual **CIELAB ($L^*a^*b^*$)** y métricas de distancia $\Delta E$ en códigos de barras en color para desacoplar las variaciones de luminancia ($L^*$) de los componentes cromáticos ($a^*, b^*$).

---

## 3. Matriz Comparativa Detallada

| Característica | Twibright Optar (2007) | PaperBack (2008) | Microsoft HCCB (2007) | HCC2D (2014) | **ChromaMatrix (2026)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Naturaleza del Código** | Monocromático (B/N) | Monocromático (B/N) | Color (Triángulos) | Color (Módulos QR) | **Color (Matriz Modular)** |
| **Bits por Punto/Celda** | 1 bit | 1 bit | 2 a 3 bits | 2 a 4 bits | **3 a 8 bits** (Multi-paleta) |
| **Espacio de Decodificación** | Umbral de Luminancia | Umbral Binarizado | Espacio RGB local | RGB con muestras | **Espacio CIELAB ($L^*a^*b^*$) con distancia perceptual $\Delta E$** |
| **Calibración de Color** | No aplicable | No aplicable | Barras de referencia | Celdas periféricas | **Muestrario de paleta perimetral + Anclas de Blanco/Negro dinámico** |
| **Corrección de Errores** | Golay (23,12) | Reed-Solomon | Reed-Solomon | Reed-Solomon | **Reed-Solomon $GF(2^8)$ con Berlekamp-Massey** |
| **Tolerancia a Iluminación** | Media (Escáner plano) | Baja (Sensible a luz) | Media | Alta | **Muy Alta (Normalización fotométrica con blancos de fondo y CIELAB)** |
| **Fidelidad y Diagnóstico** | No | No | No | No | **Fidelity Benchmark Lab integrado (Matriz de confusión y cálculo $\Delta E$)** |
| **Entorno de Ejecución** | Binario C (Linux) | Binario Win32 (.exe) | Propietario / DLL | Prototipos MATLAB/C | **Web nativa (Canvas/Webcam) + Node.js CLI (Zero-dependency)** |
| **Casos de Uso Principales** | Archivo documental | Archivo de ficheros | Marketing / Enlaces | Paper académico | **Cold Storage, Stickers de datos, Backup criptográfico air-gapped** |

---

## 4. Decisiones de Diseño e Innovaciones de ChromaMatrix

ChromaMatrix recopila las mejores lecciones aprendidas de 20 años de investigación y las implementa en una solución modular moderna:

### 1. Desacoplamiento Perceptual mediante CIELAB
En lugar de calcular distancias euclidianas en el espacio RGB convencional (donde una sombra o una bombilla cálida altera drásticamente los valores $R$, $G$ y $B$), ChromaMatrix convierte las muestras RGB a **CIE $L^*a^*b^*$**:
$$\Delta E = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$$
Esto permite que la clasificación del color sea invariante a variaciones de brillo uniforme en el papel.

### 2. Marco Perimetral Reservado Blanco/Negro con Anclas de Exposición
* Los patrones de localización en las esquinas (*nested fiducials*) y las líneas de temporización (*timing tracks*) utilizan estrictamente **Negro Puro ($L^* \approx 0$)** y **Blanco de Papel ($L^* \approx 100$)**.
* Esto proporciona una referencia instantánea del rango dinámico máximo del sensor fotográfico y de la reflectancia del sustrato de papel.

### 3. Muestrario de Paleta Auto-Calibrante Integrado (*On-Sheet Reference Swatches*)
En el borde superior e inferior de cada matriz se imprimen muestras exactas de todos los colores pertenecientes a la paleta activa (`PALETTE_8`, `PALETTE_16`, `PALETTE_64`, etc.).
Durante la decodificación, el software primero muestrea estos parches físicos reales para construir un **perfil de color dinámico** que refleja fielmente las tintas reales de la impresora y la iluminación ambiente actual.

### 4. Sistema Multi-Paleta Adaptativo
ChromaMatrix ofrece modos adaptados al compromiso entre robustez óptica y densidad de bytes:
* **`PALETTE_8` (3 bits/dot):** Ultra-alta tolerancia a impresoras de baja calidad y cámaras con ruido óptico.
* **`PALETTE_16` (4 bits/dot = 1 nibble):** Densidad balanceada óptima (2 puntos por byte exacto).
* **`PALETTE_64` (6 bits/dot):** Empaquetado Base64 directo de alta densidad.
* **`ASCII_95` (Printable ASCII):** Asignación directa 1 a 1 de caracteres imprimibles (códigos fuente, claves criptográficas y texto en claro).
* **`PALETTE_256` (8 bits/dot = 1 byte):** Máxima densidad física para escáneres planos de alta resolución.

### 5. Laboratorio de Benchmark de Fidelidad de Impresión (*Fidelity Lab*)
Permite generar una hoja de calibración física que, al ser fotografiada o escaneada, produce:
* Una **matriz de confusión de colores**.
* Valores promedio de error $\Delta E$.
* Recomendación automática de la paleta óptima para ese par de hardware específico (impresora/cámara).

---

## 5. Referencias y Bibliografía

1. **G. Jancke (Microsoft Corp.)**, *"Color barcode and method of decoding same"*, Patente US 7,789,298 B2 (2010).
2. **R. Querini, G. F. Italiano**, *"Facilitating color barcodes decoding with reference color cells"*, In *Proceedings of the 2011 ACM Symposium on Applied Computing (SAC)*, pp. 248–253, 2011.
3. **R. Querini, G. F. Italiano**, *"Color Barcodes for Mobile Phones: A Survey"*, *International Journal of Computer Science and Applications*, Vol. 11, No. 1, pp. 41–66, 2014.
4. **H. Kato, K. T. Tan, D. Chai**, *"Barcodes for Mobile Devices"*, Cambridge University Press, 2010.
5. **C. Peikari, S. Raman, K. J. Ray Liu**, *"Multi-Colour Composite 2D Barcode (MMCC) for High Capacity Mobile Transmission"*, IEEE Transactions on Multimedia, 2008.
6. **Twibright Labs**, *"Optar: Optical Archiver for Paper Storage"*, 2007. [https://twibright.com/optar/](https://twibright.com/optar/)
7. **P. Bushuev**, *"PaperBack: Backup data to paper sheets"*, 2008.
8. **AIM Inc. / Zebra Technologies**, *"Ultracode Symbology Specification"*, AIM Standard / ISO/IEC, 2023.
