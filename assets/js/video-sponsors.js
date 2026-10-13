/* ========================================
   CONNECTIA 2026 — Video de sponsors (loop para pantallas del evento)

   Cada cuadro es una función pura del tiempo: renderAt(t). El guion se arma
   a partir de la lista de sponsors, así que agregar o quitar una empresa
   ajusta tiempos y composiciones solo. Todo lo que se mueve de fondo es
   periódico respecto de la duración total: el último cuadro enlaza con el
   primero sin corte.

   Parámetros de URL:
     ?t=SEG      arranca el loop en ese segundo (para revisar una parte)
     ?still=SEG  congela ese cuadro
     ?export     sin reloj propio; lo controla video-sponsors/export/*.mjs
======================================== */
(function () {
    'use strict';

    var W = 1920;
    var H = 1080;
    var IMG = '../assets/images/';
    var SVG = 'svgs/';

    /* ---------- 1. Sponsors 2026 (misma lista que index.html y evento/) ----------
       Logos oficiales en SVG (video-sponsors/svgs/), usados tal cual. GeneXus usa
       el PNG: su SVG trae un contorno negro (stroke) que el logo oficial no tiene.
       file: tamaño del archivo (el viewBox, en los SVG). box: área visible
       [x0, y0, x1, y1] en esas mismas unidades; sirve para equilibrar tamaños
       ópticos sin recortar nada. */
    var TIERS = [
        { key: 'black', sponsors: [
            { id: 'genexus', name: 'GeneXus Consulting', src: IMG + '2026_sponsors/genexus_consulting.png', file: [800, 229], box: [0, 0, 800, 229] }
        ] },
        { key: 'platinum', sponsors: [
            { id: 'blend', name: 'Blend', src: SVG + 'blend.svg', file: [978, 187], box: [0, 0, 977.59, 186.64] },
            { id: 'ingenio', name: 'Ingenio', src: SVG + 'ingenio.svg', file: [150, 49], box: [2.25, 5.13, 146.88, 44.13] },
            { id: 'marvik', name: 'Marvik', src: SVG + 'marvik.svg', file: [697, 91], box: [0, 0, 696.13, 90.32] },
            { id: 'sunnydata', name: 'SunnyData', src: SVG + 'sunnydata.svg', file: [663, 233], box: [0, 0, 662.17, 232.33] },
            { id: 'um', name: 'Universidad de Montevideo', src: SVG + 'um.svg', file: [590, 240], box: [0, 0, 590, 239.93] },
            { id: 'xmartlabs', name: 'Xmartlabs', src: SVG + 'xmartlabs.svg', file: [691, 201], box: [0, 0, 690.14, 200.68] }
        ] },
        { key: 'gold', sponsors: [
            { id: 'cognitive', name: 'Cognitive Solutions', src: SVG + 'cogsol powered by pyxis.svg', file: [255.78, 74.22], box: [1.6, 0.21, 254.71, 71.09] },
            { id: 'senpai', name: 'Senpai Academy', src: SVG + 'senpai.svg', file: [861, 189], box: [0, 0, 860.64, 189.06] }
        ] },
        { key: 'silver', sponsors: [
            { id: 'digitalsense', name: 'Digital Sense', src: SVG + 'digital sense.svg', file: [588, 228], box: [0, 0, 587.51, 227.36] },
            { id: 'ort', name: 'Universidad ORT Uruguay', src: SVG + 'ort.svg', file: [473, 316], box: [0, 0, 472.61, 315.14] }
        ] }
    ];

    /* Declaraciones de interés: no son sponsors. Acompañan al logo de ConnectIA
       en la apertura y vuelven al final del cierre, así el loop arranca con ellas. */
    var ENDORSEMENTS = [
        { name: 'Declarado de interés por la ANII', src: '2026_declaraciones/anii_declarado_interes.png', file: [1485, 520], box: [55, 96, 1419, 436] },
        { name: 'Declarado de interés ministerial por el MEC', src: '2026_declaraciones/mec_declarado_interes.png', file: [1094, 373], box: [44, 28, 1044, 346] }
    ];

    /* ---------- 2. Jerarquía: tamaño óptico por nivel y contexto ----------
       s = raíz del área visible del logo (px), con tope de ancho y alto para
       logos muy apaisados o muy altos. Cada nivel queda por debajo del anterior. */
    var SIZE = {
        black:    { solo: { s: 600, maxW: 1240, maxH: 340 }, wall: { s: 240, maxW: 480, maxH: 130 } },
        platinum: { group: { s: 270, maxW: 490, maxH: 170 }, solo: { s: 430, maxW: 960, maxH: 290 }, wall: { s: 140, maxW: 320, maxH: 80 } },
        gold:     { group: { s: 200, maxW: 360, maxH: 92 }, solo: { s: 330, maxW: 760, maxH: 200 }, wall: { s: 104, maxW: 210, maxH: 54 } },
        silver:   { group: { s: 165, maxW: 320, maxH: 140 }, solo: { s: 280, maxW: 620, maxH: 230 }, wall: { s: 92, maxW: 180, maxH: 72 } },
        endorse:  { s: 215, maxW: 460, maxH: 125 }
    };

    /* ---------- 3. Ritmo (segundos) ---------- */
    var TIME = {
        open: 20,
        // Black: un momento largo al principio y una reaparición entre Platinum y Gold.
        black: { intro: 2.0, solo: function (n) { return n === 1 ? 20 : 10; } },
        blackReprise: { intro: 1.0, solo: function (n) { return n === 1 ? 8 : 6; } },
        platinum: { group: 15, solo: 6, perPlate: 6 },
        gold: { group: 12, solo: 5, perPlate: 6 },
        silver: { group: 12, solo: 4, perPlate: 8 },
        close: 18
    };

    // Entrada y salida de los momentos individuales: Platinum se desliza,
    // Gold sube, Silver solo funde.
    var SOLO_STYLE = {
        platinum: { dx: 80, dy: 0, k: 0.985 },
        gold: { dx: 0, dy: 40, k: 0.985 },
        silver: { dx: 0, dy: 0, k: 0.98 }
    };

    var POS = {
        hero: { x: 960, y: 395, w: 1100 },  // logo ConnectIA en apertura
        mark: { x: 960, y: 1012, w: 260 },  // firma durante los sponsors
        top: { x: 960, y: 112, w: 420 },    // composición final
        solo: { x: 960, y: 520 },
        black: { x: 960, y: 590 },
        phrase: { x: 960, y: 537 },
        endorse: { x: 960, y: 815 },
        blackLabel: { x: 960, y: 352 },
        tierLabel: { x: 960, y: 128 },
        message: { x: 960, y: 930 }
    };

    var ORDER = ['black', 'platinum', 'gold', 'silver'];

    /* ---------- 4. Pelotas ----------
       Una composición por momento; entre momentos se desplazan con suavidad
       y siempre derivan un poco. Orden de dibujo: fondo → frente. */
    var SPHERES = [
        { key: 'g', src: 'sphere-green.png' },   // grande, desenfocada, al fondo
        { key: 'y', src: 'sphere-yellow.png' },  // chica, lejana
        { key: 'm', src: 'sphere-magenta.png' }, // chica, lejana
        { key: 'G', src: 'sphere-green.png' },
        { key: 'M', src: 'sphere-magenta.png' },
        { key: 'Y', src: 'sphere-yellow.png' }
    ];

    // [x, y, diámetro, desenfoque]. Cada pelota se queda en su zona (Y abajo a la
    // derecha, G arriba a la derecha, M y g a la izquierda, m abajo, y arriba a la
    // izquierda) para que nunca crucen por detrás de los logos al cambiar de momento.
    var PRESETS = {
        open:   { Y: [1700, 900, 380, 0], M: [210, 900, 320, 0], G: [1660, 170, 230, 0], y: [330, 200, 90, 2.5], g: [-40, 470, 560, 16], m: [1440, 1010, 110, 5] },
        black:  { Y: [1790, 950, 500, 0], M: [150, 900, 420, 0], G: [1640, 220, 210, 0], y: [700, 160, 70, 2], g: [-80, 880, 620, 18], m: [1310, 900, 110, 5] },
        black2: { Y: [1800, 960, 510, 0], M: [150, 910, 440, 0], G: [1620, 236, 220, 0], y: [716, 150, 76, 2], g: [-60, 860, 640, 18], m: [1300, 896, 116, 5] },
        platG:  { Y: [1740, 1010, 330, 0], M: [150, 985, 300, 0], G: [1720, 130, 220, 0], y: [300, 200, 80, 2], g: [-120, 1100, 600, 18], m: [1300, 920, 100, 5] },
        platA:  { Y: [1690, 860, 440, 0], M: [250, 800, 340, 0], G: [1700, 190, 200, 0], y: [560, 260, 80, 2], g: [-120, 860, 600, 18], m: [1330, 900, 100, 5] },
        platB:  { Y: [1700, 900, 400, 0], M: [300, 860, 300, 0], G: [1520, 170, 170, 0], y: [420, 230, 70, 2], g: [-100, 820, 600, 18], m: [1250, 940, 100, 5] },
        goldG:  { Y: [1640, 860, 420, 0], M: [260, 840, 360, 0], G: [1600, 220, 240, 0], y: [420, 220, 80, 2], g: [-120, 880, 600, 18], m: [1300, 900, 110, 5] },
        goldA:  { Y: [1690, 830, 380, 0], M: [330, 820, 380, 0], G: [1560, 170, 260, 0], y: [480, 240, 80, 2], g: [-120, 900, 600, 18], m: [1300, 930, 100, 5] },
        goldB:  { Y: [1700, 880, 400, 0], M: [300, 640, 300, 0], G: [1500, 200, 200, 0], y: [420, 330, 80, 2], g: [-140, 980, 600, 18], m: [1250, 900, 100, 5] },
        silvG:  { Y: [1560, 800, 320, 0], M: [470, 760, 300, 0], G: [1500, 240, 200, 0], y: [520, 330, 90, 2], g: [-80, 760, 560, 16], m: [1300, 930, 110, 5] },
        silvA:  { Y: [1600, 780, 380, 0], M: [360, 760, 320, 0], G: [1560, 230, 220, 0], y: [420, 330, 80, 2], g: [-100, 820, 600, 18], m: [1180, 880, 100, 5] },
        silvB:  { Y: [1660, 820, 360, 0], M: [340, 820, 340, 0], G: [1540, 200, 220, 0], y: [300, 420, 80, 2], g: [-120, 700, 580, 18], m: [1240, 900, 90, 5] },
        close:  { Y: [1780, 960, 380, 0], M: [120, 960, 360, 0], G: [1760, 130, 240, 0], y: [230, 260, 90, 2], g: [-100, 420, 560, 18], m: [1500, 900, 100, 5] }
    };

    var TIER_PRESETS = {
        platinum: { group: 'platG', solo: ['platA', 'platB'] },
        gold: { group: 'goldG', solo: ['goldA', 'goldB'] },
        silver: { group: 'silvG', solo: ['silvA', 'silvB'] }
    };

    // Deriva lenta: ciclos enteros dentro del loop para que cierre exacto.
    var DRIFT = {
        Y: { ax: 24, ay: 18, kx: 3, ky: 2, px: 0.3, py: 1.9, ks: 2, ps: 0.8 },
        M: { ax: 20, ay: 24, kx: 2, ky: 3, px: 2.1, py: 0.4, ks: 3, ps: 2.6 },
        G: { ax: 26, ay: 20, kx: 4, ky: 3, px: 4.0, py: 2.2, ks: 2, ps: 4.4 },
        y: { ax: 30, ay: 26, kx: 5, ky: 4, px: 1.2, py: 5.1, ks: 4, ps: 1.0 },
        g: { ax: 34, ay: 28, kx: 2, ky: 1, px: 5.5, py: 3.3, ks: 1, ps: 3.0 },
        m: { ax: 28, ay: 32, kx: 4, ky: 5, px: 2.8, py: 0.9, ks: 3, ps: 5.2 }
    };

    var KEEP_OUT = 40; // aire mínimo (px) entre una pelota y cualquier logo o texto

    /* ---------- Utilidades ---------- */
    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
    function lerp(a, b, k) { return a + (b - a) * k; }
    function smoothstep(a, b, v) { var k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }
    function chunk(list, size) {
        var out = [];
        for (var i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
        return out;
    }

    var EASE = {
        io: function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
        out: function (k) { return 1 - Math.pow(1 - k, 3); },
        sine: function (k) { return -(Math.cos(Math.PI * k) - 1) / 2; }
    };

    // Pista de keyframes: cada at() hereda los valores del anterior.
    function Track(init) {
        this.kfs = [];
        this.cur = Object.assign({}, init);
        this.lastT = -Infinity;
    }
    Track.prototype.at = function (t, props, ease) {
        if (t < this.lastT) console.warn('Keyframe fuera de orden', t, this.lastT);
        this.lastT = t;
        Object.assign(this.cur, props || {});
        this.kfs.push(Object.assign({}, this.cur, { t: t, e: ease || 'io' }));
        return this;
    };
    Track.prototype.sample = function (t) {
        var k = this.kfs;
        if (!k.length) return this.cur;
        if (t <= k[0].t) return k[0];
        if (t >= k[k.length - 1].t) return k[k.length - 1];
        var i = 1;
        while (k[i].t < t) i++;
        var a = k[i - 1];
        var b = k[i];
        var p = EASE[b.e]((t - a.t) / (b.t - a.t));
        var out = {};
        for (var key in b) {
            if (key !== 't' && key !== 'e') out[key] = lerp(a[key], b[key], p);
        }
        return out;
    };

    function visibleBox(sp) {
        var bw = sp.box[2] - sp.box[0];
        var bh = sp.box[3] - sp.box[1];
        return { w: bw, h: bh, r: bw / bh };
    }

    // Ancho del área visible para un tamaño óptico; el alto sale de la proporción original.
    function logoWidth(sp, spec) {
        var r = visibleBox(sp).r;
        var w = spec.s * Math.sqrt(r);
        var h = spec.s / Math.sqrt(r);
        return w * Math.min(1, spec.maxW / w, spec.maxH / h);
    }

    function tierOf(key) {
        for (var i = 0; i < TIERS.length; i++) if (TIERS[i].key === key) return TIERS[i];
        return { key: key, sponsors: [] };
    }

    /* ---------- 5. Composiciones ---------- */
    function groupLayout(key, n) {
        var L = {
            platinum: { cx: 960, cy: 560, sx: 600, sy: 260 },
            gold: { cx: 960, cy: 540, sx: 540, sy: 220 },
            silver: { cx: 960, cy: 540, sx: 460, sy: 230 }
        }[key];
        // Dos Silver: apilados, para no repetir la placa en fila de Gold.
        if (key === 'silver' && n === 2) {
            return [{ x: L.cx, y: L.cy - L.sy / 2 }, { x: L.cx, y: L.cy + L.sy / 2 }];
        }
        var cols = n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : 4;
        var rows = Math.ceil(n / cols);
        var cells = [];
        for (var r = 0; r < rows; r++) {
            var inRow = Math.min(cols, n - r * cols);
            for (var c = 0; c < inRow; c++) {
                cells.push({
                    x: L.cx + (c - (inRow - 1) / 2) * L.sx,
                    y: L.cy + (r - (rows - 1) / 2) * L.sy
                });
            }
        }
        return cells;
    }

    // Composición final: pirámide ordenada por nivel bajo el logo de ConnectIA,
    // con el título de cada nivel. Gold y Silver comparten franja en dos columnas.
    function wallLayout() {
        var LABEL_H = 28;
        var LABEL_GAP = 20;
        var ROW_GAP = 32;
        var SECTION_GAP = 54;
        var COLUMN_GAP = 170;

        function column(key, rows, step) {
            rows = rows.map(function (list) {
                var boxes = list.map(function (sp) {
                    var w = logoWidth(sp, SIZE[key].wall);
                    return { sp: sp, w: w, h: w / visibleBox(sp).r };
                });
                var width = step
                    ? (boxes.length - 1) * step + Math.max.apply(null, boxes.map(function (b) { return b.w; }))
                    : boxes.reduce(function (a, b, j) { return a + b.w + (j ? 64 : 0); }, 0);
                return { boxes: boxes, h: Math.max.apply(null, boxes.map(function (b) { return b.h; })), width: width };
            });
            var h = LABEL_H + LABEL_GAP;
            rows.forEach(function (row, i) { h += row.h + (i ? ROW_GAP : 0); });
            return { key: key, rows: rows, step: step, h: h, width: Math.max.apply(null, rows.map(function (r) { return r.width; })) };
        }

        var gold = tierOf('gold').sponsors;
        var silver = tierOf('silver').sponsors;
        var sections = [
            [column('black', chunk(tierOf('black').sponsors, 2), 560)],
            [column('platinum', chunk(tierOf('platinum').sponsors, 3), 400)]
        ];
        if (gold.length <= 3 && silver.length <= 3) {
            sections.push([column('gold', [gold]), column('silver', [silver])]);
        } else {
            sections.push([column('gold', chunk(gold, 4))], [column('silver', chunk(silver, 5))]);
        }
        sections = sections.map(function (cols) {
            return cols.filter(function (c) { return c.rows.length && c.rows[0].boxes.length; });
        }).filter(function (cols) { return cols.length; });

        var total = SECTION_GAP * (sections.length - 1);
        sections.forEach(function (cols) { total += Math.max.apply(null, cols.map(function (c) { return c.h; })); });
        var y = 165 + (685 - total) / 2;

        var logos = [];
        var labels = [];
        sections.forEach(function (cols) {
            var width = COLUMN_GAP * (cols.length - 1);
            cols.forEach(function (c) { width += c.width; });
            var x = 960 - width / 2;
            cols.forEach(function (c) {
                var cx = x + c.width / 2;
                labels.push({ key: c.key, x: cx, y: y + LABEL_H / 2 });
                var ry = y + LABEL_H + LABEL_GAP;
                c.rows.forEach(function (row) {
                    var cy = ry + row.h / 2;
                    var rx = cx - row.width / 2;
                    row.boxes.forEach(function (b, j) {
                        var bx = c.step ? cx + (j - (row.boxes.length - 1) / 2) * c.step : rx + b.w / 2;
                        logos.push({ sp: b.sp, w: b.w, x: bx, y: cy, j: j });
                        rx += b.w + 64;
                    });
                    ry += row.h + ROW_GAP;
                });
                x += c.width + COLUMN_GAP;
            });
            y += Math.max.apply(null, cols.map(function (c) { return c.h; })) + SECTION_GAP;
        });
        return { logos: logos, labels: labels };
    }

    /* ---------- 6. Guion ---------- */
    var tracks = {
        brand: new Track({ x: POS.hero.x, y: POS.hero.y, w: POS.hero.w, o: 1 }),
        phrase: new Track({ o: 0, dx: 0, dy: 18 }),
        message: new Track({ o: 0, dx: 0, dy: 18 }),
        endorse: new Track({ o: 1, dx: 0, dy: 0 }),
        spot: new Track({ o: 0 }),
        divider: new Track({ o: 0 }),
        labels: {},
        logos: {}
    };
    var plan = { scenes: [], logos: {}, wallLabels: [], duration: 0 };
    var sphereKeys = [];

    TIERS.forEach(function (tier) {
        tracks.labels[tier.key] = new Track({ o: 0, dx: 0, dy: 0 });
        tier.sponsors.forEach(function (sp) {
            sp.tier = tier.key;
            tracks.logos[sp.id] = new Track({ x: 960, y: 540, w: 100, o: 0 });
            plan.logos[sp.id] = { name: sp.name, tier: tier.key, src: sp.src, phases: [] };
        });
    });

    function phase(sp, ctx, t0, t1, w) {
        plan.logos[sp.id].phases.push({ ctx: ctx, t0: t0, t1: t1, w: w, h: w / visibleBox(sp).r });
    }
    function scene(name, t0, t1) { plan.scenes.push({ name: name, t0: t0, t1: t1 }); }
    function spheresAt(t, preset) { sphereKeys.push({ t: t, p: preset }); }

    function buildOpening() {
        var end = TIME.open;
        tracks.brand.at(0).at(end - 3.6).at(end - 0.6, { x: POS.mark.x, y: POS.mark.y, w: POS.mark.w });
        tracks.phrase.at(1.2).at(2.8, { o: 1, dy: 0 }, 'out').at(end - 5.4).at(end - 4.4, { o: 0, dy: -10 }, 'sine');
        tracks.endorse.at(0).at(end - 5.8).at(end - 4.8, { o: 0, dy: -10 }, 'sine');
        spheresAt(0, 'open');
        spheresAt(end - 3.2, 'open');
        scene('Apertura', 0, end);
        return end;
    }

    function buildBlack(t, reprise) {
        var list = tierOf('black').sponsors;
        if (!list.length) return t;
        var cfg = reprise ? TIME.blackReprise : TIME.black;
        var slot = cfg.solo(list.length);
        var first = t + cfg.intro;
        var end = first + list.length * slot;
        var label = tracks.labels.black;
        label.at(t - 0.2, { dy: 14 }).at(t + 1.0, { o: 1, dy: 0 }, 'out').at(end - 1.4).at(end - 0.4, { o: 0 }, 'sine');
        tracks.spot.at(t + 0.6).at(t + 3.0, { o: 1 }).at(end - 1.4).at(end, { o: 0 });
        list.forEach(function (sp, i) {
            var a = first + i * slot;
            var b = a + slot;
            var w = logoWidth(sp, SIZE.black.solo);
            tracks.logos[sp.id]
                .at(a - 0.2, { x: POS.black.x, y: POS.black.y, w: w * 0.965, o: 0 })
                .at(a + 1.4, { w: w, o: 1 }, 'out')
                .at(b - 1.4)
                .at(b - 0.2, { w: w * 0.985, o: 0 }, 'sine');
            phase(sp, reprise ? 'reprise' : 'solo', a + 1.4, b - 1.4, w);
        });
        spheresAt(t + 1.6, 'black');
        spheresAt(end - 2.4, 'black2');
        scene(reprise ? 'Black reaparición' : 'Black', t, end);
        return end;
    }

    function buildTier(key, t) {
        var tier = tierOf(key);
        var n = tier.sponsors.length;
        if (!n) return t;
        var cfg = TIME[key];
        var style = SOLO_STYLE[key];
        var presets = TIER_PRESETS[key];
        var label = tracks.labels[key];
        var start = t;
        var plates = chunk(tier.sponsors, cfg.perPlate);
        var single = plates.length === 1;

        label.at(t, { dy: 14 }).at(t + 1.0, { o: 1, dy: 0 }, 'out');

        // Placas grupales
        plates.forEach(function (plate) {
            var p0 = t;
            var p1 = t + cfg.group;
            var cells = groupLayout(key, plate.length);
            plate.forEach(function (sp, j) {
                var w = logoWidth(sp, SIZE[key].group);
                var c = cells[j];
                var e0 = p0 + 0.5 + j * 0.16;
                var tr = tracks.logos[sp.id];
                tr.at(e0, { x: c.x, y: c.y + 26, w: w, o: 0 }).at(e0 + 1.3, { y: c.y, o: 1 }, 'out').at(p1 - 1.2);
                // El primero de una placa única viaja al centro y abre los momentos individuales.
                if (!(single && j === 0)) tr.at(p1 - 0.3, { w: w * 0.97, o: 0 }, 'sine');
                phase(sp, 'group', e0 + 1.3, p1 - 1.2, w);
            });
            if (key === 'gold' && plate.length === 2) {
                tracks.divider.at(p0 + 0.8).at(p0 + 2.2, { o: 1 }).at(p1 - 1.2).at(p1 - 0.4, { o: 0 });
            }
            spheresAt(p0 + 1.2, presets.group);
            spheresAt(p1 - 1.6, presets.group);
            scene(key + ' grupal', p0, p1);
            t = p1;
        });

        // Momentos individuales
        var s0 = t;
        tier.sponsors.forEach(function (sp, i) {
            var a = s0 + i * cfg.solo;
            var b = a + cfg.solo;
            var w = logoWidth(sp, SIZE[key].solo);
            var tr = tracks.logos[sp.id];
            // Todos los del nivel quedan quietos el mismo tiempo, también el que llega desde la placa.
            if (single && i === 0) {
                tr.at(a + 0.85, { x: POS.solo.x, y: POS.solo.y, w: w, o: 1 });
            } else {
                tr.at(a - 0.15, { x: POS.solo.x + style.dx, y: POS.solo.y + style.dy, w: w * style.k, o: 0 })
                  .at(a + 0.85, { x: POS.solo.x, y: POS.solo.y, w: w, o: 1 }, 'out');
            }
            tr.at(b - 0.9);
            phase(sp, 'solo', a + 0.85, b - 0.9, w);
            if (i === n - 1) {
                tr.at(b + 0.1, { w: w * 0.97, o: 0 }, 'sine');
            } else {
                tr.at(b, { x: POS.solo.x - style.dx, y: POS.solo.y - style.dy, o: 0 });
            }
            var preset = presets.solo[i % 2];
            spheresAt(a + 0.8, preset);
            spheresAt(b - 1.2, preset);
        });
        t = s0 + n * cfg.solo;
        scene(key + ' individual', s0, t);
        label.at(t - 0.7).at(t, { o: 0 }, 'sine');
        plan.tiers = plan.tiers || {};
        plan.tiers[key] = { t0: start, t1: t };
        return t;
    }

    function buildClosing(t) {
        var C = t;
        var end = C + TIME.close;
        tracks.brand.at(C - 0.4).at(C + 1.8, { x: POS.top.x, y: POS.top.y, w: POS.top.w })
            .at(C + 12.0).at(end - 1.2, { x: POS.hero.x, y: POS.hero.y, w: POS.hero.w });

        var wall = wallLayout();
        wall.labels.forEach(function (l) {
            var level = ORDER.indexOf(l.key);
            var e0 = C + 0.4 + level * 0.4;
            var x0 = C + 10.3 + (3 - level) * 0.3;
            l.track = new Track({ o: 0, dx: 0, dy: 14 }).at(e0).at(e0 + 1.2, { o: 1, dy: 0 }, 'out').at(x0).at(x0 + 1.0, { o: 0, dy: -8 }, 'sine');
            plan.wallLabels.push(l);
        });
        wall.logos.forEach(function (item) {
            var level = ORDER.indexOf(item.sp.tier);
            var e0 = C + 0.6 + level * 0.4 + item.j * 0.08;
            var x0 = C + 10.4 + (3 - level) * 0.3 + item.j * 0.05;
            tracks.logos[item.sp.id]
                .at(e0, { x: item.x, y: item.y + 22, w: item.w, o: 0 })
                .at(e0 + 1.4, { y: item.y, o: 1 }, 'out')
                .at(x0)
                .at(x0 + 1.2, { y: item.y - 12, o: 0 }, 'sine');
            phase(item.sp, 'wall', e0 + 1.4, x0, item.w);
        });

        tracks.message.at(C + 1.6).at(C + 3.0, { o: 1, dy: 0 }, 'out').at(C + 10.8).at(C + 12.0, { o: 0, dy: -10 }, 'sine');
        tracks.endorse.at(end - 2.6, { dy: 18 }).at(end - 0.6, { o: 1, dy: 0 }, 'out');
        spheresAt(C + 1.8, 'close');
        spheresAt(C + 11.0, 'close');
        spheresAt(end - 1.2, 'open');
        scene('Cierre', C, end);
        return end;
    }

    var DURATION = (function () {
        var t = buildOpening();
        t = buildBlack(t);
        t = buildTier('platinum', t);
        t = buildBlack(t, true);
        t = buildTier('gold', t);
        t = buildTier('silver', t);
        return buildClosing(t);
    })();
    plan.duration = DURATION;

    /* ---------- 7. Escenario ---------- */
    var stage = document.getElementById('stage');
    var els = {
        brand: document.getElementById('brand'),
        phrase: document.getElementById('phrase'),
        message: document.getElementById('message'),
        spot: document.getElementById('spot'),
        divider: document.getElementById('divider'),
        ambientA: document.getElementById('ambient-a'),
        ambientB: document.getElementById('ambient-b')
    };

    var logoItems = [];
    var logoLayer = document.getElementById('logos');
    TIERS.forEach(function (tier) {
        tier.sponsors.forEach(function (sp) {
            var vb = visibleBox(sp);
            var phases = plan.logos[sp.id].phases;
            // Tamaño base = el mayor en que aparece; los demás se logran reduciendo.
            var baseW = Math.max.apply(null, phases.map(function (p) { return p.w; }));
            var baseH = baseW / vb.r;
            var f = baseW / vb.w;
            var el = document.createElement('div');
            el.className = 'logo logo--' + sp.tier;
            el.style.width = baseW + 'px';
            el.style.height = baseH + 'px';
            var img = document.createElement('img');
            img.src = encodeURI(sp.src);
            img.alt = sp.name;
            img.decoding = 'sync';
            img.style.width = sp.file[0] * f + 'px';
            img.style.height = sp.file[1] * f + 'px';
            img.style.left = -sp.box[0] * f + 'px';
            img.style.top = -sp.box[1] * f + 'px';
            el.appendChild(img);
            logoLayer.appendChild(el);
            logoItems.push({ sp: sp, el: el, img: img, track: tracks.logos[sp.id], baseW: baseW, baseH: baseH, vis: null });
        });
    });

    var sphereItems = [];
    var sphereLayer = document.getElementById('spheres');
    SPHERES.forEach(function (s) {
        var img = document.createElement('img');
        img.className = 'sphere';
        img.src = IMG + 'brand/' + s.src;
        img.alt = '';
        sphereLayer.appendChild(img);
        sphereItems.push({ key: s.key, el: img, drift: DRIFT[s.key], lastBlur: null });
    });
    sphereKeys.sort(function (a, b) { return a.t - b.t; });

    var endorse = document.createElement('div');
    endorse.className = 'endorse';
    endorse.id = 'endorse';
    ENDORSEMENTS.forEach(function (e, i) {
        if (i) {
            var divider = document.createElement('span');
            divider.className = 'endorse__divider';
            endorse.appendChild(divider);
        }
        var vb = visibleBox(e);
        var w = logoWidth(e, SIZE.endorse);
        var f = w / vb.w;
        var box = document.createElement('span');
        box.className = 'endorse__logo';
        box.style.width = w + 'px';
        box.style.height = w / vb.r + 'px';
        var img = document.createElement('img');
        img.src = IMG + e.src;
        img.alt = e.name;
        img.style.width = e.file[0] * f + 'px';
        img.style.height = e.file[1] * f + 'px';
        img.style.left = -e.box[0] * f + 'px';
        img.style.top = -e.box[1] * f + 'px';
        box.appendChild(img);
        endorse.appendChild(box);
    });
    stage.insertBefore(endorse, els.brand);

    var wallLabelItems = plan.wallLabels.map(function (l) {
        var el = document.createElement('p');
        el.className = 'txt tier-label tier-label--center tier-label--small';
        el.id = 'wall-label-' + l.key;
        el.innerHTML = document.getElementById('label-' + l.key).innerHTML;
        stage.insertBefore(el, els.brand);
        return { id: el.id, el: el, track: l.track, center: { x: l.x, y: l.y } };
    });

    var textItems = [
        { id: 'phrase', el: els.phrase, track: tracks.phrase, center: POS.phrase },
        { id: 'label-black', el: document.getElementById('label-black'), track: tracks.labels.black, center: POS.blackLabel },
        { id: 'label-platinum', el: document.getElementById('label-platinum'), track: tracks.labels.platinum, center: POS.tierLabel },
        { id: 'label-gold', el: document.getElementById('label-gold'), track: tracks.labels.gold, center: POS.tierLabel },
        { id: 'label-silver', el: document.getElementById('label-silver'), track: tracks.labels.silver, center: POS.tierLabel },
        { id: 'message', el: els.message, track: tracks.message, center: POS.message },
        { id: 'endorse', el: endorse, track: tracks.endorse, center: POS.endorse }
    ].concat(wallLabelItems);

    function layoutTexts() {
        textItems.forEach(function (it) {
            it.w = it.el.offsetWidth;
            it.h = it.el.offsetHeight;
            if (it.center) {
                it.el.style.left = (it.center.x - it.w / 2) + 'px';
                it.el.style.top = (it.center.y - it.h / 2) + 'px';
            }
            it.x = it.el.offsetLeft;
            it.y = it.el.offsetTop;
        });
    }

    // Grano fijo muy sutil sobre el fondo (evita bandas en el degradado al codificar).
    (function grain() {
        var c = document.getElementById('grain');
        var ctx = c.getContext('2d');
        var img = ctx.createImageData(c.width, c.height);
        var seed = 20261031;
        for (var i = 0; i < img.data.length; i += 4) {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            var v = seed >>> 24;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 10;
        }
        ctx.putImageData(img, 0, 0);
    })();

    /* ---------- 8. Render ---------- */
    var TAU = Math.PI * 2;
    var state = { logos: [], texts: [], brand: null, spheres: [], push: 0 };

    function setOpacity(el, o) { el.style.opacity = o.toFixed(4); }

    function rectOf(x, y, w, h, o) { return { x0: x, y0: y, x1: x + w, y1: y + h, o: o }; }

    function spherePreset(t) {
        var k = sphereKeys;
        if (t <= k[0].t) return { a: k[0].p, b: k[0].p, p: 0 };
        if (t >= k[k.length - 1].t) return { a: k[k.length - 1].p, b: k[k.length - 1].p, p: 0 };
        var i = 1;
        while (k[i].t < t) i++;
        return { a: k[i - 1].p, b: k[i].p, p: EASE.io((t - k[i - 1].t) / (k[i].t - k[i - 1].t)) };
    }

    // Aleja una pelota de los rectángulos ocupados; el empuje crece con la opacidad
    // del contenido, así no hay saltos cuando algo aparece o desaparece.
    function keepOut(c, rects) {
        var moved = 0;
        for (var pass = 0; pass < 2; pass++) {
            for (var i = 0; i < rects.length; i++) {
                var R = rects[i];
                var weight = smoothstep(0, 0.3, R.o);
                if (weight <= 0) continue;
                var x0 = R.x0 - KEEP_OUT, y0 = R.y0 - KEEP_OUT, x1 = R.x1 + KEEP_OUT, y1 = R.y1 + KEEP_OUT;
                var nx = clamp(c.x, x0, x1);
                var ny = clamp(c.y, y0, y1);
                var dx = c.x - nx;
                var dy = c.y - ny;
                var d = Math.sqrt(dx * dx + dy * dy);
                var need;
                if (d > 0) {
                    need = c.r - d;
                    if (need > 0) {
                        c.x += dx / d * need * weight;
                        c.y += dy / d * need * weight;
                        moved = Math.max(moved, need * weight);
                    }
                } else {
                    // Centro dentro del rectángulo: sale por el lado más cercano.
                    var opts = [[c.x - x0, -1, 0], [x1 - c.x, 1, 0], [c.y - y0, 0, -1], [y1 - c.y, 0, 1]];
                    opts.sort(function (p, q) { return p[0] - q[0]; });
                    need = (opts[0][0] + c.r) * weight;
                    c.x += opts[0][1] * need;
                    c.y += opts[0][2] * need;
                    moved = Math.max(moved, need);
                }
            }
        }
        return moved;
    }

    function renderAt(time) {
        var t = ((time % DURATION) + DURATION) % DURATION;
        var phase01 = t / DURATION;
        var occupied = [];
        state.logos.length = 0;
        state.texts.length = 0;
        state.spheres.length = 0;

        // Fondo
        els.ambientA.style.transform = 'translate(' + (-80 + 260 * Math.sin(TAU * phase01)).toFixed(2) + 'px,' +
            (-520 + 160 * Math.cos(TAU * 2 * phase01)).toFixed(2) + 'px)';
        els.ambientB.style.transform = 'translate(' + (900 + 220 * Math.cos(TAU * phase01 + 1.3)).toFixed(2) + 'px,' +
            (60 + 180 * Math.sin(TAU * 3 * phase01 + 0.4)).toFixed(2) + 'px)';
        setOpacity(els.spot, tracks.spot.sample(t).o);
        setOpacity(els.divider, tracks.divider.sample(t).o);

        // Logos
        logoItems.forEach(function (it) {
            var s = it.track.sample(t);
            var vis = s.o > 0.002;
            if (vis !== it.vis) {
                it.el.style.visibility = vis ? 'visible' : 'hidden';
                it.vis = vis;
            }
            if (!vis) return;
            var k = s.w / it.baseW;
            setOpacity(it.el, s.o);
            it.el.style.transform = 'translate(' + (s.x - it.baseW / 2).toFixed(2) + 'px,' + (s.y - it.baseH / 2).toFixed(2) + 'px) scale(' + k.toFixed(5) + ')';
            var w = s.w;
            var h = s.w / visibleBox(it.sp).r;
            var r = rectOf(s.x - w / 2, s.y - h / 2, w, h, s.o);
            occupied.push(r);
            state.logos.push({ id: it.sp.id, tier: it.sp.tier, o: s.o, w: s.w, rect: r });
        });

        // Logo ConnectIA
        var b = tracks.brand.sample(t);
        var bh = b.w * 350 / 2882;
        els.brand.style.visibility = b.o > 0.002 ? 'visible' : 'hidden';
        setOpacity(els.brand, b.o);
        els.brand.style.transform = 'translate(' + (b.x - 550).toFixed(2) + 'px,' + (b.y - 1100 * 350 / 2882 / 2).toFixed(2) + 'px) scale(' + (b.w / 1100).toFixed(5) + ')';
        state.brand = rectOf(b.x - b.w / 2, b.y - bh / 2, b.w, bh, b.o);
        occupied.push(state.brand);

        // Textos
        textItems.forEach(function (it) {
            var s = it.track.sample(t);
            setOpacity(it.el, s.o);
            it.el.style.visibility = s.o > 0.002 ? 'visible' : 'hidden';
            it.el.style.transform = 'translate(' + s.dx.toFixed(2) + 'px,' + s.dy.toFixed(2) + 'px)';
            if (s.o > 0.002) {
                var r = rectOf(it.x + s.dx, it.y + s.dy, it.w, it.h, s.o);
                occupied.push(r);
                state.texts.push({ id: it.id, o: s.o, rect: r });
            }
        });

        // Pelotas
        var mix = spherePreset(t);
        var maxPush = 0;
        sphereItems.forEach(function (it) {
            var A = PRESETS[mix.a][it.key];
            var B = PRESETS[mix.b][it.key];
            var d = it.drift;
            var x = lerp(A[0], B[0], mix.p) + d.ax * Math.sin(TAU * d.kx * phase01 + d.px);
            var y = lerp(A[1], B[1], mix.p) + d.ay * Math.sin(TAU * d.ky * phase01 + d.py);
            var dia = lerp(A[2], B[2], mix.p) * (1 + 0.035 * Math.sin(TAU * d.ks * phase01 + d.ps));
            var blur = lerp(A[3], B[3], mix.p);
            // Radio efectivo: incluye el halo del desenfoque.
            var c = { x: x, y: y, r: dia / 2 + blur * 1.5 };
            maxPush = Math.max(maxPush, keepOut(c, occupied));
            var k = dia / 512;
            it.el.style.transform = 'translate(' + (c.x - 256).toFixed(2) + 'px,' + (c.y - 256).toFixed(2) + 'px) scale(' + k.toFixed(5) + ')';
            var cssBlur = blur > 0.05 ? (blur / k).toFixed(1) : '0';
            if (cssBlur !== it.lastBlur) {
                it.el.style.filter = cssBlur === '0' ? 'none' : 'blur(' + cssBlur + 'px)';
                it.lastBlur = cssBlur;
            }
            state.spheres.push({ key: it.key, x: c.x, y: c.y, r: dia / 2, halo: c.r });
        });
        state.push = maxPush;
        return t;
    }

    /* ---------- 9. Arranque ---------- */
    function fit() {
        var s = Math.min(window.innerWidth / W, window.innerHeight / H);
        stage.style.transform = 'scale(' + s + ')';
    }

    var params = new URLSearchParams(location.search);
    var exporting = params.has('export');

    var api = {
        duration: DURATION,
        plan: plan,
        tiers: TIERS.map(function (tier) {
            return { key: tier.key, sponsors: tier.sponsors.map(function (sp) { return { id: sp.id, name: sp.name, src: sp.src }; }) };
        }),
        ready: false,
        renderAt: renderAt,
        // Estado geométrico del cuadro t (para las verificaciones automáticas).
        inspect: function (t) {
            renderAt(t);
            return JSON.parse(JSON.stringify(state));
        }
    };
    window.SponsorsVideo = api;

    var images = Array.prototype.slice.call(stage.querySelectorAll('img'));
    var fonts = ['600 54px Poppins', '700 30px Poppins', '700 60px Poppins'].map(function (f) { return document.fonts.load(f); });

    Promise.all(fonts.concat(images.map(function (img) {
        return img.decode().catch(function () {
            console.error('No se pudo cargar', img.src);
        });
    }))).then(function () {
        return document.fonts.ready;
    }).then(function () {
        layoutTexts();
        fit();
        window.addEventListener('resize', fit);

        var still = params.get('still');
        if (exporting) {
            renderAt(0);
        } else if (still !== null) {
            renderAt(parseFloat(still) || 0);
        } else {
            var offset = parseFloat(params.get('t')) || 0;
            var t0 = null;
            var loop = function (now) {
                if (t0 === null) t0 = now;
                renderAt(offset + (now - t0) / 1000);
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
            // Pantalla completa con doble clic o la tecla F (sin controles visibles).
            var full = function () {
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(function () {});
                }
            };
            document.addEventListener('dblclick', full);
            document.addEventListener('keydown', function (e) { if (e.key === 'f' || e.key === 'F') full(); });
        }
        api.ready = true;
    });
})();
