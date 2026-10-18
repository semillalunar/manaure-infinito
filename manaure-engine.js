/**
 * MANAURE INFINITO - Motor Generativo Procedimental SVG
 * En conmemoración del Centenario del Maestro Mateo Manaure (1926 - 2026)
 * Inspirado en la arquitectura procedimental de shan-shui-inf (Lingdong Huang)
 */

class PRNG {
  constructor(seed = 19261018) {
    this.seed = seed;
    this.s = this.hash(seed);
  }

  hash(n) {
    let t = (n += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  reseed(seed) {
    this.seed = seed;
    this.s = this.hash(seed);
  }

  random() {
    let t = (this.s = (this.s * 9301 + 49297) % 233280);
    return t / 233280;
  }

  range(min, max) {
    return min + this.random() * (max - min);
  }

  rangeInt(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  pick(arr) {
    return arr[Math.floor(this.random() * arr.length)];
  }

  chance(p) {
    return this.random() < p;
  }
}

// Paletas inspiradas en las distintas etapas y obras de Mateo Manaure
const PALETTES = {
  uracoa: {
    name: "Uracoa (Mural Av. Libertador)",
    description: "Cinetismo horizontal de alta velocidad, diagonales y contrastes primarios monumentales.",
    bg: "#111315",
    concrete: "#2A2D32",
    frame: "#181A1D",
    colors: [
      "#DE2828", // Rojo Cadmio
      "#0F52BA", // Azul Cobalto
      "#FDD023", // Amarillo Solar
      "#008B53", // Verde Esmeralda
      "#FA6400", // Naranja
      "#F8F9FA", // Blanco Puro
      "#121416", // Negro Azabache
    ],
    accents: ["#FFFFFF", "#0A387E", "#C01818", "#F5A623"]
  },
  ucv: {
    name: "Policromías UCV (Síntesis de las Artes)",
    description: "Bloques arquitectónicos estructurados en diálogo con el concreto brutalista de Villanueva.",
    bg: "#1E2024",
    concrete: "#888C94",
    frame: "#141518",
    colors: [
      "#C8232B", // Rojo UCV
      "#1446A0", // Azul Ultramar
      "#F5B700", // Ocre Amarillo
      "#007A5E", // Verde Tropical
      "#ECEBE4", // Concreto Claro
      "#1B1B1E", // Carbón
      "#E05A47"  // Terracota
    ],
    accents: ["#FFFFFF", "#111111", "#F5B700"]
  },
  cielos: {
    name: "Cielos de Caracas",
    description: "Lírica geométrica, discos astrales, arcos celestes y visiones cósmicas sobre el valle.",
    bg: "#0A1128",
    concrete: "#1C2541",
    frame: "#050814",
    colors: [
      "#001F54", // Azul Noche Profundo
      "#034078", // Azul Cerúleo
      "#1282A2", // Turquesa
      "#FEFCFB", // Luz Estelar
      "#FFC857", // Luna Llena / Sol
      "#DB3A34", // Ocaso Rojo
      "#6A0572"  // Violeta Crepúsculo
    ],
    accents: ["#FEFCFB", "#FFC857", "#1282A2"]
  },
  suelos: {
    name: "Suelos de mi Tierra (Monagas)",
    description: "Raíces orinoquenses, arcillas de Uracoa, follajes y tramas telúricas profundas.",
    bg: "#1C1917",
    concrete: "#292524",
    frame: "#0C0A09",
    colors: [
      "#991B1B", // Arcilla Roja
      "#B45309", // Ocre Tierra
      "#15803D", // Verde Selva
      "#1E3A8A", // Río Orinoco
      "#FBBF24", // Semilla Dorada
      "#F5F5F4", // Hueso
      "#292524"  // Piedra
    ],
    accents: ["#FDE68A", "#EF4444", "#3B82F6"]
  },
  centenario: {
    name: "Sinfonía Centenario (1926-2026)",
    description: "Fusión magistral de todas sus facetas: cinetismo, arquitectura, cosmos y materia.",
    bg: "#141619",
    concrete: "#3F444E",
    frame: "#0C0D0F",
    colors: [
      "#E62627", // Rojo
      "#0044B2", // Azul Manaure
      "#FFCC00", // Amarillo Sol
      "#009E60", // Verde Esmeralda
      "#FF5E00", // Naranja Eléctrico
      "#F8F9FA", // Blanco
      "#0E1012"  // Negro
    ],
    accents: ["#FFFFFF", "#000000", "#FFCC00", "#0044B2"]
  }
};

class ManaureEngine {
  constructor(options = {}) {
    this.container = options.container;
    this.seed = options.seed || 19261018; // 18 de octubre de 1926
    this.paletteKey = options.palette || "uracoa";
    this.chunkWidth = options.chunkWidth || 800;
    this.height = options.height || 600;
    this.speed = options.speed || 1.8;
    this.isPlaying = options.isPlaying !== undefined ? options.isPlaying : true;
    
    this.scrollX = 0;
    this.chunks = new Map(); // chunkIndex -> SVGGroupElement
    this.prng = new PRNG(this.seed);
    this.animId = null;
    this.lastTime = 0;

    this.onPositionChange = options.onPositionChange || null;

    this.initSVG();
    this.setupEvents();
    if (this.isPlaying) {
      this.start();
    } else {
      this.updateChunks();
    }
  }

  get palette() {
    return PALETTES[this.paletteKey] || PALETTES.uracoa;
  }

  initSVG() {
    this.container.innerHTML = "";
    
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "manaure-canvas");
    this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    
    // Background rect
    this.bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.bgRect.setAttribute("width", "100%");
    this.bgRect.setAttribute("height", "100%");
    this.bgRect.setAttribute("fill", this.palette.bg);
    this.svg.appendChild(this.bgRect);

    // Group for all mural chunks with smooth translation
    this.muralGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.muralGroup.setAttribute("id", "mural-track");
    this.svg.appendChild(this.muralGroup);

    // Structural architectural borders (Top & Bottom Friezes reminiscent of Villanueva's concrete)
    this.friezeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.friezeGroup.setAttribute("id", "mural-frieze");
    this.createArchitecturalFrieze();
    this.svg.appendChild(this.friezeGroup);

    this.container.appendChild(this.svg);
    this.resize();
  }

  createArchitecturalFrieze() {
    this.friezeGroup.innerHTML = "";
    const w = "100%";
    const friezeH = 34;
    
    // Top beam
    const topBeam = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    topBeam.setAttribute("x", "0");
    topBeam.setAttribute("y", "0");
    topBeam.setAttribute("width", w);
    topBeam.setAttribute("height", friezeH);
    topBeam.setAttribute("fill", this.palette.frame);
    this.friezeGroup.appendChild(topBeam);

    const topBorder = document.createElementNS("http://www.w3.org/2000/svg", "line");
    topBorder.setAttribute("x1", "0");
    topBorder.setAttribute("y1", friezeH);
    topBorder.setAttribute("x2", "100%");
    topBorder.setAttribute("y2", friezeH);
    topBorder.setAttribute("stroke", this.palette.concrete);
    topBorder.setAttribute("stroke-width", "2");
    this.friezeGroup.appendChild(topBorder);

    // Bottom beam
    const botBeam = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    botBeam.setAttribute("x", "0");
    botBeam.setAttribute("y", this.height - friezeH);
    botBeam.setAttribute("width", w);
    botBeam.setAttribute("height", friezeH);
    botBeam.setAttribute("fill", this.palette.frame);
    this.friezeGroup.appendChild(botBeam);

    const botBorder = document.createElementNS("http://www.w3.org/2000/svg", "line");
    botBorder.setAttribute("x1", "0");
    botBorder.setAttribute("y1", this.height - friezeH);
    botBorder.setAttribute("x2", "100%");
    botBorder.setAttribute("y2", this.height - friezeH);
    botBorder.setAttribute("stroke", this.palette.concrete);
    botBorder.setAttribute("stroke-width", "2");
    this.friezeGroup.appendChild(botBorder);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.viewWidth = rect.width || window.innerWidth;
    this.viewHeight = rect.height || window.innerHeight;
    this.svg.setAttribute("viewBox", `0 0 ${this.viewWidth} ${this.height}`);
    this.createArchitecturalFrieze();
    this.updateChunks();
  }

  setupEvents() {
    window.addEventListener("resize", () => this.resize());

    // Drag to explore manually
    let isDragging = false;
    let startX = 0;
    let initialScrollX = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      initialScrollX = this.scrollX;
      this.container.classList.add("dragging");
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const delta = (startX - clientX) * 1.5;
      this.scrollX = Math.max(0, initialScrollX + delta);
      this.updateChunks();
      if (this.onPositionChange) this.onPositionChange(this.scrollX);
    };

    const onPointerUp = () => {
      isDragging = false;
      this.container.classList.remove("dragging");
    };

    this.container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    this.container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Mouse wheel horizontal pan
    this.container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      this.scrollX = Math.max(0, this.scrollX + delta * 1.2);
      this.updateChunks();
      if (this.onPositionChange) this.onPositionChange(this.scrollX);
    }, { passive: false });
  }

  start() {
    this.isPlaying = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.isPlaying) return;
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      
      // Advance scroll
      this.scrollX += this.speed * 60 * dt;
      this.updateChunks();
      if (this.onPositionChange) this.onPositionChange(this.scrollX);

      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  pause() {
    this.isPlaying = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  setSeed(newSeed) {
    this.seed = Number(newSeed) || 19261018;
    this.clearAllChunks();
    this.updateChunks();
  }

  setPalette(key) {
    if (PALETTES[key]) {
      this.paletteKey = key;
      this.bgRect.setAttribute("fill", this.palette.bg);
      this.createArchitecturalFrieze();
      this.clearAllChunks();
      this.updateChunks();
    }
  }

  setSpeed(val) {
    this.speed = Math.max(0, Number(val));
  }

  scrollTo(x) {
    this.scrollX = Math.max(0, x);
    this.updateChunks();
  }

  clearAllChunks() {
    this.chunks.forEach((group) => {
      if (group.parentNode) group.parentNode.removeChild(group);
    });
    this.chunks.clear();
  }

  updateChunks() {
    const leftEdge = this.scrollX - 200;
    const rightEdge = this.scrollX + this.viewWidth + 400;

    const startChunk = Math.floor(leftEdge / this.chunkWidth);
    const endChunk = Math.floor(rightEdge / this.chunkWidth);

    // Translate the main track
    this.muralGroup.setAttribute("transform", `translate(${-this.scrollX}, 0)`);

    // Remove chunks that are far behind or far ahead to maintain 60 FPS
    for (const [idx, group] of this.chunks.entries()) {
      if (idx < startChunk - 2 || idx > endChunk + 2) {
        if (group.parentNode) group.parentNode.removeChild(group);
        this.chunks.delete(idx);
      }
    }

    // Generate needed chunks deterministically
    for (let c = startChunk; c <= endChunk; c++) {
      if (c >= 0 && !this.chunks.has(c)) {
        const chunkGroup = this.generateChunk(c);
        this.muralGroup.appendChild(chunkGroup);
        this.chunks.set(c, chunkGroup);
      }
    }
  }

  /* -------------------------------------------------------------
     GENERADOR PROCEDIMENTAL DE MURAL MATEO MANAURE
     ------------------------------------------------------------- */
  generateChunk(chunkIndex) {
    // Deterministic PRNG seeded by globalSeed + chunkIndex
    const rng = new PRNG(this.seed + chunkIndex * 1337);
    const chunkX = chunkIndex * this.chunkWidth;
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", `chunk-${chunkIndex}`);
    group.setAttribute("transform", `translate(${chunkX}, 0)`);

    const friezeMargin = 34;
    const usableHeight = this.height - friezeMargin * 2;
    const pal = this.palette;

    // Architectural joint (dilatation line between continuous concrete panels)
    const joint = document.createElementNS("http://www.w3.org/2000/svg", "line");
    joint.setAttribute("x1", "0");
    joint.setAttribute("y1", friezeMargin);
    joint.setAttribute("x2", "0");
    joint.setAttribute("y2", this.height - friezeMargin);
    joint.setAttribute("stroke", pal.concrete);
    joint.setAttribute("stroke-width", "2");
    joint.setAttribute("stroke-dasharray", "8, 4");
    joint.setAttribute("opacity", "0.4");
    group.appendChild(joint);

    // Macro-composition: Divide vertical space into 1, 2, 3, or 4 horizontal registers (franjas)
    // reminiscent of Manaure's large polyptychs and UCV murals
    const registerModes = [
      [1],                 // Monolithic full height
      [0.5, 0.5],          // Split in half
      [0.6, 0.4],          // Asymmetrical split
      [0.35, 0.35, 0.3],   // Tripartite musical register
      [0.2, 0.6, 0.2]      // Central monumental focus
    ];
    const regMode = rng.pick(registerModes);
    let currentY = friezeMargin;

    regMode.forEach((fraction, rIndex) => {
      const regH = usableHeight * fraction;
      this.generateRegister(group, rng, 0, currentY, this.chunkWidth, regH, chunkIndex, rIndex);
      currentY += regH;

      // Register dividing line
      if (rIndex < regMode.length - 1) {
        const divLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        divLine.setAttribute("x1", "0");
        divLine.setAttribute("y1", currentY);
        divLine.setAttribute("x2", this.chunkWidth);
        divLine.setAttribute("y2", currentY);
        divLine.setAttribute("stroke", rng.chance(0.6) ? pal.frame : "#000000");
        divLine.setAttribute("stroke-width", rng.pick([2, 3, 5]));
        group.appendChild(divLine);
      }
    });

    // Occasional overlay: Massive kinetic diagonal band spanning across registers
    if (rng.chance(0.28)) {
      this.generateTransversalKineticSash(group, rng, usableHeight, friezeMargin);
    }

    // Occasional Celestial Glyph: "Cielos de Caracas" astral circle
    if (this.paletteKey === "cielos" || rng.chance(0.35)) {
      this.generateManaureOrb(group, rng, usableHeight, friezeMargin);
    }

    return group;
  }

  generateRegister(parent, rng, rx, ry, rw, rh, chunkIdx, regIdx) {
    const pal = this.palette;
    
    // Choose stylistic motif for this register
    // Manaure archetypes:
    // 1. "Frecuencias" (rhythmic barcode / alternating stripe cadences)
    // 2. "Diagonales y Chevrones" (Uracoa kinetic speed cuts)
    // 3. "Bloques Arquitectónicos" (asymmetrical geometric grid monoliths)
    // 4. "Campos Puros con Acentos" (quiet, large color field with crisp punctuations)
    // 5. "Micro-tramas Ópticas" (high frequency black/white or color vibration)
    
    const archetypes = ["frequencies", "diagonals", "blocks", "fields", "optical"];
    const style = rng.pick(archetypes);

    // Base background for this register section
    const bgFill = rng.pick(pal.colors);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", rx);
    bg.setAttribute("y", ry);
    bg.setAttribute("width", rw);
    bg.setAttribute("height", rh);
    bg.setAttribute("fill", bgFill);
    parent.appendChild(bg);

    // Apply the chosen motif
    switch (style) {
      case "frequencies":
        this.renderFrequencies(parent, rng, rx, ry, rw, rh);
        break;
      case "diagonals":
        this.renderDiagonals(parent, rng, rx, ry, rw, rh);
        break;
      case "blocks":
        this.renderArchitecturalBlocks(parent, rng, rx, ry, rw, rh);
        break;
      case "fields":
        this.renderColorFields(parent, rng, rx, ry, rw, rh);
        break;
      case "optical":
        this.renderOpticalVibrations(parent, rng, rx, ry, rw, rh);
        break;
    }
  }

  /* --- MOTIF 1: RHYTHMIC FREQUENCIES (Policromías / Códigos cromáticos) --- */
  renderFrequencies(parent, rng, x, y, w, h) {
    const pal = this.palette;
    let cx = x;
    const endX = x + w;

    while (cx < endX) {
      // Subdivide into pulse clusters: wide bar vs rapid succession of thin lines
      const clusterType = rng.pick(["cluster_thin", "cluster_medium", "cluster_block"]);
      
      if (clusterType === "cluster_thin") {
        const stripeCount = rng.rangeInt(4, 16);
        const stripeW = rng.pick([3, 5, 8, 12]);
        const colorA = rng.pick(pal.colors);
        const colorB = rng.pick(pal.accents);
        
        for (let i = 0; i < stripeCount && cx < endX; i++) {
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", cx);
          rect.setAttribute("y", y);
          rect.setAttribute("width", stripeW);
          rect.setAttribute("height", h);
          rect.setAttribute("fill", i % 2 === 0 ? colorA : colorB);
          parent.appendChild(rect);
          cx += stripeW;
        }
      } else if (clusterType === "cluster_medium") {
        const barW = rng.range(24, 70);
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", cx);
        rect.setAttribute("y", y);
        rect.setAttribute("width", Math.min(barW, endX - cx));
        rect.setAttribute("height", h);
        rect.setAttribute("fill", rng.pick(pal.colors));
        rect.setAttribute("stroke", "#000000");
        rect.setAttribute("stroke-width", "1.5");
        parent.appendChild(rect);
        cx += barW;
      } else {
        const blockW = rng.range(80, 180);
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", cx);
        rect.setAttribute("y", y);
        rect.setAttribute("width", Math.min(blockW, endX - cx));
        rect.setAttribute("height", h);
        rect.setAttribute("fill", rng.pick(pal.colors));
        parent.appendChild(rect);

        // Inset contrasting inner stripe (Manaure's vertical rhythm punctuation)
        if (rng.chance(0.7) && blockW > 60) {
          const innerW = rng.range(8, 20);
          const innerX = cx + (blockW - innerW) / 2;
          const innerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          innerRect.setAttribute("x", innerX);
          innerRect.setAttribute("y", y);
          innerRect.setAttribute("width", innerW);
          innerRect.setAttribute("height", h);
          innerRect.setAttribute("fill", rng.pick(pal.accents));
          parent.appendChild(innerRect);
        }
        cx += blockW;
      }
    }
  }

  /* --- MOTIF 2: DIAGONALS & CHEVRONS (Cinetismo Uracoa) --- */
  renderDiagonals(parent, rng, x, y, w, h) {
    const pal = this.palette;
    const slantType = rng.pick(["forward", "backward", "zigzag", "split_wedge"]);
    const segmentW = rng.range(120, 260);
    let cx = x;

    while (cx < x + w) {
      const curW = Math.min(segmentW, x + w - cx);
      const color1 = rng.pick(pal.colors);
      const color2 = rng.pick(pal.colors);
      const color3 = rng.pick(pal.accents);

      if (slantType === "forward" || slantType === "backward") {
        const stepCount = rng.rangeInt(3, 8);
        const stepW = curW / stepCount;
        const dx = slantType === "forward" ? h * 0.4 : -h * 0.4;

        for (let i = 0; i < stepCount; i++) {
          const px = cx + i * stepW;
          const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          const points = `${px},${y} ${px + stepW},${y} ${px + stepW + dx},${y + h} ${px + dx},${y + h}`;
          poly.setAttribute("points", points);
          poly.setAttribute("fill", i % 2 === 0 ? color1 : color2);
          poly.setAttribute("stroke", "#111111");
          poly.setAttribute("stroke-width", "1");
          parent.appendChild(poly);
        }
      } else if (slantType === "zigzag") {
        // Dynamic chevron pattern
        const chevCount = rng.rangeInt(2, 5);
        const stepX = curW / chevCount;
        for (let i = 0; i < chevCount; i++) {
          const px = cx + i * stepX;
          const polyTop = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          polyTop.setAttribute("points", `${px},${y} ${px + stepX},${y} ${px + stepX * 0.5},${y + h * 0.5}`);
          polyTop.setAttribute("fill", color1);
          parent.appendChild(polyTop);

          const polyBot = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          polyBot.setAttribute("points", `${px},${y + h} ${px + stepX},${y + h} ${px + stepX * 0.5},${y + h * 0.5}`);
          polyBot.setAttribute("fill", color2);
          parent.appendChild(polyBot);
        }
      } else {
        // Dramatic wedge slice
        const wedge = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        wedge.setAttribute("points", `${cx},${y} ${cx + curW},${y} ${cx},${y + h}`);
        wedge.setAttribute("fill", color3);
        parent.appendChild(wedge);
      }

      cx += curW;
    }
  }

  /* --- MOTIF 3: ARCHITECTURAL BLOCKS (Policromías UCV) --- */
  renderArchitecturalBlocks(parent, rng, x, y, w, h) {
    const pal = this.palette;
    const cols = rng.rangeInt(3, 7);
    const colW = w / cols;

    for (let c = 0; c < cols; c++) {
      const bx = x + c * colW;
      const rows = rng.pick([1, 2, 3]);
      const rowH = h / rows;

      for (let r = 0; r < rows; r++) {
        const by = y + r * rowH;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", bx);
        rect.setAttribute("y", by);
        rect.setAttribute("width", colW);
        rect.setAttribute("height", rowH);
        rect.setAttribute("fill", rng.pick(pal.colors));
        rect.setAttribute("stroke", "#0D0E10");
        rect.setAttribute("stroke-width", rng.pick([2, 4, 6]));
        parent.appendChild(rect);

        // Nested floating portal / secondary rectangle (Manaure's hallmark in UCV mural)
        if (rng.chance(0.55) && colW > 40 && rowH > 40) {
          const marginX = rng.range(8, 20);
          const marginY = rng.range(8, 20);
          const inRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          inRect.setAttribute("x", bx + marginX);
          inRect.setAttribute("y", by + marginY);
          inRect.setAttribute("width", Math.max(10, colW - marginX * 2));
          inRect.setAttribute("height", Math.max(10, rowH - marginY * 2));
          inRect.setAttribute("fill", rng.pick(pal.accents));
          inRect.setAttribute("stroke", "#000000");
          inRect.setAttribute("stroke-width", "2");
          parent.appendChild(inRect);
        }
      }
    }
  }

  /* --- MOTIF 4: BROAD FIELDS WITH PUNCTUATIONS --- */
  renderColorFields(parent, rng, x, y, w, h) {
    const pal = this.palette;
    const splitX = x + w * rng.range(0.3, 0.7);

    // Left massive field
    const r1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r1.setAttribute("x", x);
    r1.setAttribute("y", y);
    r1.setAttribute("width", splitX - x);
    r1.setAttribute("height", h);
    r1.setAttribute("fill", rng.pick(pal.colors));
    parent.appendChild(r1);

    // Right massive field
    const r2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r2.setAttribute("x", splitX);
    r2.setAttribute("y", y);
    r2.setAttribute("width", x + w - splitX);
    r2.setAttribute("height", h);
    r2.setAttribute("fill", rng.pick(pal.colors));
    parent.appendChild(r2);

    // Vertical black separator band
    const sep = document.createElementNS("http://www.w3.org/2000/svg", "line");
    sep.setAttribute("x1", splitX);
    sep.setAttribute("y1", y);
    sep.setAttribute("x2", splitX);
    sep.setAttribute("y2", y + h);
    sep.setAttribute("stroke", "#0A0B0D");
    sep.setAttribute("stroke-width", "6");
    parent.appendChild(sep);

    // Punctuating horizontal rhythm bars inside the field
    const barCount = rng.rangeInt(2, 5);
    const barYStep = h / (barCount + 1);
    for (let i = 1; i <= barCount; i++) {
      const py = y + i * barYStep;
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const startX = rng.chance(0.5) ? x + 20 : splitX + 20;
      const barLen = rng.range(40, 140);
      bar.setAttribute("x1", startX);
      bar.setAttribute("y1", py);
      bar.setAttribute("x2", startX + barLen);
      bar.setAttribute("y2", py);
      bar.setAttribute("stroke", rng.pick(pal.accents));
      bar.setAttribute("stroke-width", rng.pick([4, 8, 12]));
      parent.appendChild(bar);
    }
  }

  /* --- MOTIF 5: OPTICAL VIBRATIONS (Op-Art / Cinético) --- */
  renderOpticalVibrations(parent, rng, x, y, w, h) {
    const pal = this.palette;
    const stripeCount = rng.rangeInt(18, 40);
    const sw = w / stripeCount;
    const c1 = rng.pick(["#FFFFFF", "#000000", pal.accents[0]]);
    const c2 = rng.pick(pal.colors);

    for (let i = 0; i < stripeCount; i++) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x + i * sw);
      rect.setAttribute("y", y);
      rect.setAttribute("width", sw + 0.5);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", i % 2 === 0 ? c1 : c2);
      parent.appendChild(rect);
    }
  }

  /* --- EXTRA: TRANSVERSAL KINETIC SASH (El dinamismo de la trinchera) --- */
  generateTransversalKineticSash(parent, rng, usableH, friezeMargin) {
    const pal = this.palette;
    const startX = rng.range(0, this.chunkWidth * 0.5);
    const sashW = rng.range(40, 100);
    const slantX = rng.range(100, 240);

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const p1 = `${startX},${friezeMargin}`;
    const p2 = `${startX + sashW},${friezeMargin}`;
    const p3 = `${startX + sashW + slantX},${friezeMargin + usableH}`;
    const p4 = `${startX + slantX},${friezeMargin + usableH}`;
    
    poly.setAttribute("points", `${p1} ${p2} ${p3} ${p4}`);
    poly.setAttribute("fill", rng.pick(pal.accents));
    poly.setAttribute("stroke", "#0D0E10");
    poly.setAttribute("stroke-width", "3");
    poly.setAttribute("opacity", "0.95");
    parent.appendChild(poly);

    // Inner parallel kinetic lines
    if (rng.chance(0.6)) {
      const innerLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      innerLine.setAttribute("x1", startX + sashW / 2);
      innerLine.setAttribute("y1", friezeMargin);
      innerLine.setAttribute("x2", startX + sashW / 2 + slantX);
      innerLine.setAttribute("y2", friezeMargin + usableH);
      innerLine.setAttribute("stroke", "#111111");
      innerLine.setAttribute("stroke-width", "4");
      parent.appendChild(innerLine);
    }
  }

  /* --- EXTRA: MANAURE ORB / CIELOS DE CARACAS (Lírica Cósmica) --- */
  generateManaureOrb(parent, rng, usableH, friezeMargin) {
    const pal = this.palette;
    const cx = rng.range(100, this.chunkWidth - 100);
    const cy = rng.range(friezeMargin + 60, friezeMargin + usableH - 60);
    const radius = rng.range(35, 95);

    const orbType = rng.pick(["solid_with_ring", "bicolor_disc", "intersected_crescent", "concentric_target"]);
    const primaryColor = rng.pick(pal.accents);
    const secondaryColor = rng.pick(pal.colors);

    const orbGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    orbGroup.setAttribute("class", "manaure-orb");

    if (orbType === "solid_with_ring") {
      // Outer ring
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", cx);
      ring.setAttribute("cy", cy);
      ring.setAttribute("r", radius);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", primaryColor);
      ring.setAttribute("stroke-width", rng.pick([4, 8, 12]));
      orbGroup.appendChild(ring);

      // Core disc
      const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      core.setAttribute("cx", cx);
      core.setAttribute("cy", cy);
      core.setAttribute("r", radius * 0.55);
      core.setAttribute("fill", secondaryColor);
      core.setAttribute("stroke", "#0D0E10");
      core.setAttribute("stroke-width", "2");
      orbGroup.appendChild(core);
    } else if (orbType === "bicolor_disc") {
      // Semicircles (Yin-Yang geometric split)
      const d1 = `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius} Z`;
      const pLeft = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pLeft.setAttribute("d", d1);
      pLeft.setAttribute("fill", primaryColor);
      pLeft.setAttribute("stroke", "#000000");
      pLeft.setAttribute("stroke-width", "2");
      orbGroup.appendChild(pLeft);

      const d2 = `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 0 ${cx} ${cy + radius} Z`;
      const pRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pRight.setAttribute("d", d2);
      pRight.setAttribute("fill", secondaryColor);
      pRight.setAttribute("stroke", "#000000");
      pRight.setAttribute("stroke-width", "2");
      orbGroup.appendChild(pRight);
    } else if (orbType === "intersected_crescent") {
      // Intersecting moon discs
      const cMain = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      cMain.setAttribute("cx", cx);
      cMain.setAttribute("cy", cy);
      cMain.setAttribute("r", radius);
      cMain.setAttribute("fill", primaryColor);
      orbGroup.appendChild(cMain);

      const cCut = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      cCut.setAttribute("cx", cx + radius * 0.45);
      cCut.setAttribute("cy", cy);
      cCut.setAttribute("r", radius * 0.85);
      cCut.setAttribute("fill", pal.bg);
      orbGroup.appendChild(cCut);
    } else {
      // Target / Concentric rings
      const rings = [1, 0.7, 0.4, 0.2];
      rings.forEach((scale, idx) => {
        const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ.setAttribute("cx", cx);
        circ.setAttribute("cy", cy);
        circ.setAttribute("r", radius * scale);
        circ.setAttribute("fill", idx % 2 === 0 ? primaryColor : secondaryColor);
        circ.setAttribute("stroke", "#0D0E10");
        circ.setAttribute("stroke-width", "2");
        orbGroup.appendChild(circ);
      });
    }

    parent.appendChild(orbGroup);
  }

  /* -------------------------------------------------------------
     EXPORTADORES: SVG PURO & PNG (HISTORIAS, WALLPAPERS, POSTS)
     ------------------------------------------------------------- */
  exportSVG(width = 1920, height = 600) {
    const exportScrollX = this.scrollX;
    const startChunk = Math.floor(exportScrollX / this.chunkWidth);
    const endChunk = Math.floor((exportScrollX + width) / this.chunkWidth);

    const svgDoc = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgDoc.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgDoc.setAttribute("viewBox", `0 0 ${width} ${this.height}`);
    svgDoc.setAttribute("width", width);
    svgDoc.setAttribute("height", this.height);

    // Background
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", width);
    bg.setAttribute("height", this.height);
    bg.setAttribute("fill", this.palette.bg);
    svgDoc.appendChild(bg);

    // Chunks
    const track = document.createElementNS("http://www.w3.org/2000/svg", "g");
    track.setAttribute("transform", `translate(${-exportScrollX}, 0)`);

    for (let c = startChunk; c <= endChunk; c++) {
      if (c >= 0) {
        const chunk = this.generateChunk(c);
        track.appendChild(chunk);
      }
    }
    svgDoc.appendChild(track);

    // Frieze
    const friezeClone = this.friezeGroup.cloneNode(true);
    svgDoc.appendChild(friezeClone);

    // Signature stamp
    const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    textGroup.setAttribute("transform", `translate(${width - 320}, ${this.height - 12})`);
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("fill", "#8E929A");
    txt.setAttribute("font-family", "system-ui, sans-serif");
    txt.setAttribute("font-size", "11");
    txt.setAttribute("font-weight", "600");
    txt.setAttribute("letter-spacing", "1.5");
    txt.textContent = `HOMENAJE A MATEO MANAURE · #${this.seed}`;
    textGroup.appendChild(txt);
    svgDoc.appendChild(textGroup);

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgDoc);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const link = document.createElement("a");
    link.href = url;
    link.download = `manaure-infinito-seed${this.seed}-x${Math.round(this.scrollX)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportPNG(options = { format: "banner", width: 1920, height: 1080 }) {
    let targetW = 1920;
    let targetH = 1080;

    if (options.format === "story") {
      targetW = 1080;
      targetH = 1920;
    } else if (options.format === "square") {
      targetW = 1200;
      targetH = 1200;
    } else if (options.format === "panorama") {
      targetW = 2560;
      targetH = 720;
    }

    // Generate static SVG representation
    const exportScrollX = this.scrollX;
    const startChunk = Math.floor(exportScrollX / this.chunkWidth);
    const endChunk = Math.floor((exportScrollX + targetW) / this.chunkWidth);

    const svgDoc = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgDoc.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgDoc.setAttribute("viewBox", `0 0 ${targetW} ${this.height}`);
    svgDoc.setAttribute("width", targetW);
    svgDoc.setAttribute("height", this.height);

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", targetW);
    bg.setAttribute("height", this.height);
    bg.setAttribute("fill", this.palette.bg);
    svgDoc.appendChild(bg);

    const track = document.createElementNS("http://www.w3.org/2000/svg", "g");
    track.setAttribute("transform", `translate(${-exportScrollX}, 0)`);
    for (let c = startChunk; c <= endChunk; c++) {
      if (c >= 0) {
        track.appendChild(this.generateChunk(c));
      }
    }
    svgDoc.appendChild(track);
    svgDoc.appendChild(this.friezeGroup.cloneNode(true));

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgDoc);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URLObj = window.URL || window.webkitURL || window;
    const blobURL = URLObj.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");

        // High quality background
        ctx.fillStyle = this.palette.bg;
        ctx.fillRect(0, 0, targetW, targetH);

        // Center mural vertically in target canvas
        const muralAspect = targetW / this.height;
        const targetAspect = targetW / targetH;
        
        // Render mural centered
        const renderH = targetW * (this.height / targetW);
        const renderY = (targetH - renderH) / 2;
        
        ctx.drawImage(img, 0, renderY, targetW, renderH);

        // Add commemorative overlay watermark for social media
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, targetH - 64, targetW, 64);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px 'Inter', system-ui, sans-serif";
        ctx.fillText("MATEO MANAURE · CENTENARIO 1926-2026", 40, targetH - 26);

        ctx.fillStyle = "#A0A5B0";
        ctx.font = "14px 'Inter', system-ui, sans-serif";
        ctx.fillText(`Mural Generativo Procedimental | Semilla: ${this.seed} | x: ${Math.round(this.scrollX)}m`, targetW - 460, targetH - 26);

        URLObj.revokeObjectURL(blobURL);

        canvas.toBlob((blob) => {
          const downloadUrl = URLObj.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `manaure-centenario-${options.format}-seed${this.seed}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URLObj.revokeObjectURL(downloadUrl);
          resolve();
        }, "image/png", 0.95);
      };
      img.onerror = reject;
      img.src = blobURL;
    });
  }
}

window.ManaureEngine = ManaureEngine;
window.PALETTES = PALETTES;
