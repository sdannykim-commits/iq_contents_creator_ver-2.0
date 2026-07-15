// ────────────────────────────────────────────────────────────────────────────
// IQ TEST ENGINE  (iqspark.digital-style, rule-preserving daily variations)
// ────────────────────────────────────────────────────────────────────────────
// Reproduces the FIXED question logics of the iqspark.digital free test, then
// generates a NEW daily version by varying ONLY the numbers (or shapes/fills) —
// the rule, structure and difficulty stay identical. Deterministic per date seed
// (same day → same set, next day → fresh set), so it never needs the network and
// never deviates from the intended logic.
//
// Phase 1 families (all render with the EXISTING template renderers — no new UI):
//   • numberMatrix   → 3×3 numeric grid, row rule f(C1,C2)=C3   (renders as .matrix-grid)
//   • numberSequence → number series with a fixed progression   (renders as .series)
//   • shapeMatrix    → 3×3 shape grid, row=shape / col=fill rule (renders as matrixShapes SVG)
// (Rotational Logic, Shape Counting, Cube Folding, etc. need new renderers — Phase 2.)
// ────────────────────────────────────────────────────────────────────────────

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}
function shuffle(arr, r) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const randInt = (r, min, max) => min + Math.floor(r() * (max - min + 1));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// 4 unique string options: correct + supplied distractors, padded with near-misses.
function buildOptions(correct, distractors, r) {
  const opts = [String(correct)];
  for (const d of distractors) {
    const s = String(d);
    if (!opts.includes(s)) opts.push(s);
    if (opts.length === 4) break;
  }
  let delta = 1;
  while (opts.length < 4) {
    const cand = String(Number(correct) + delta);
    if (!opts.includes(cand) && Number.isFinite(Number(correct))) opts.push(cand);
    else if (opts.length < 4 && !Number.isFinite(Number(correct))) { opts.push(`opt${opts.length}`); }
    delta = delta > 0 ? -delta : -delta + 1;
  }
  return shuffle(opts, r);
}

// ── NUMBER MATRIX ── row rule f(C1,C2)=C3 (decoded from site Q8–10/Q20 + parametrized DATA_POOL)
const NM_RULES = [
  { f: (a, b) => a + b,          exp: 'Row rule: first + second = third.' },
  { f: (a, b) => a * b,          exp: 'Row rule: first × second = third.' },
  { f: (a, b, k) => a * b + k,   exp: 'Row rule: first × second, then + K.', usesK: [1, 9] },
  { f: (a, b) => a * a + b,      exp: 'Row rule: first squared + second.' },
  { f: (a, b) => a * a + 2 * b,  exp: 'Row rule: first squared + 2 × second.' },
  { f: (a, b, k) => (a + b) * k, exp: 'Row rule: (first + second) × K.', usesK: [2, 5] },
  { f: (a, b) => a * (b + 1),    exp: 'Row rule: first × (second + 1).' }
];
export function genNumberMatrix(r) {
  const rule = pick(NM_RULES, r);
  const k = rule.usesK ? randInt(r, rule.usesK[0], rule.usesK[1]) : null;
  const F = (a, b) => rule.f(a, b, k);
  const rows = [];
  const seen = new Set();
  let guard = 0;
  while (rows.length < 3 && guard++ < 300) {
    const a = randInt(r, 2, 9);
    const b = randInt(r, 2, 9);
    const c = F(a, b);
    if (c <= 0 || String(c).length > 3 || seen.has(c)) continue;
    seen.add(c);
    rows.push([a, b, c]);
  }
  const last = rows[2];
  const answer = last[2];
  const matrixData = [
    String(rows[0][0]), String(rows[0][1]), String(rows[0][2]),
    String(rows[1][0]), String(rows[1][1]), String(rows[1][2]),
    String(last[0]), String(last[1]), '?'
  ];
  const distractors = [last[0] * last[1], answer + last[0], answer - last[1], answer + (k || 3)];
  const kNote = rule.usesK ? ` (K = ${k})` : '';
  return {
    type: 'matrix',
    prompt: 'Find the missing number.',
    matrixData,
    options: buildOptions(answer, distractors, r),
    answer: String(answer),
    explanation: rule.exp + kNote
  };
}

// ── NUMBER SEQUENCE ── fixed progression, varied start/step (decoded from site Q16–19 + DATA_POOL)
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const NS_RULES = [
  { name: 'geometric', gen: (r) => { const s = randInt(r, 2, 5), q = randInt(r, 2, 3); const a = [s]; for (let i = 1; i < 5; i++) a.push(a[i - 1] * q); return { a, exp: `Each term is multiplied by ${q}.` }; } },
  { name: 'arithmetic', gen: (r) => { const s = randInt(r, 1, 9), d = randInt(r, 2, 9); const a = [s]; for (let i = 1; i < 5; i++) a.push(a[i - 1] + d); return { a, exp: `Add ${d} to each term.` }; } },
  { name: 'squares', gen: (r) => { const s = randInt(r, 1, 4); const a = []; for (let i = 0; i < 5; i++) a.push((s + i) * (s + i)); return { a, exp: 'Consecutive perfect squares.' }; } },
  { name: 'squares+1', gen: (r) => { const s = randInt(r, 1, 4); const a = []; for (let i = 0; i < 5; i++) a.push((s + i) * (s + i) + 1); return { a, exp: 'Perfect squares, each plus one.' }; } },
  { name: 'fibonacci', gen: (r) => { let x = randInt(r, 1, 4), y = randInt(r, x + 1, x + 4); const a = [x, y]; for (let i = 2; i < 6; i++) a.push(a[i - 1] + a[i - 2]); return { a: a.slice(0, 6), exp: 'Each term is the sum of the two before it.' }; } },
  { name: 'increasing-diff', gen: (r) => { const s = randInt(r, 1, 5); let d = randInt(r, 1, 3); const a = [s]; for (let i = 1; i < 5; i++) { a.push(a[i - 1] + d); d += randInt(r, 1, 3); } return { a, exp: 'The gap between terms grows each step.' }; } },
  { name: 'primes', gen: (r) => { const start = randInt(r, 0, PRIMES.length - 5); return { a: PRIMES.slice(start, start + 5), exp: 'Consecutive prime numbers.' }; } },
  { name: 'square-diffs', gen: (r) => { const s = randInt(r, 1, 3); const a = [s]; for (let i = 1; i < 5; i++) a.push(a[i - 1] + i * i); return { a, exp: 'Differences are consecutive perfect squares (+1², +2², …).' }; } }
];
export function genNumberSequence(r) {
  const rule = pick(NS_RULES, r);
  const { a, exp } = rule.gen(r);
  // show all but the last term, ask for the last
  const shown = a.slice(0, a.length - 1);
  const answer = a[a.length - 1];
  const sequenceData = [...shown.map(String), '?'];
  const step = shown.length >= 2 ? shown[shown.length - 1] - shown[shown.length - 2] : 1;
  const distractors = [answer + step, answer - step, shown[shown.length - 1] * 2, answer + 1];
  return {
    type: 'numerical',
    prompt: 'Find the next number.',
    sequenceData,
    options: buildOptions(answer, distractors, r),
    answer: String(answer),
    explanation: exp
  };
}

// ── SHAPE MATRIX ── 3×3, each ROW = one shape, each COLUMN = one fill (Raven-style).
// Missing (bottom-right) is uniquely determined. Renders via matrixShapes SVG.
const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
const FILLS = ['outline', 'hatched', 'solid'];
const FILL_LABEL = { outline: 'outline', hatched: 'hatched', solid: 'filled' };
export function genShapeMatrix(r) {
  const shapeRows = shuffle(SHAPES, r).slice(0, 3); // 3 distinct shapes, one per row
  const fillCols = shuffle(FILLS, r);               // 3 fills, one per column
  const cells = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 2 && col === 2) cells.push({ shape: '?' });
      else cells.push({ shape: shapeRows[row], fill: fillCols[col], dot: null });
    }
  }
  const ansShape = shapeRows[2];
  const ansFill = fillCols[2];
  const label = (s, f) => `${cap(s)} ${FILL_LABEL[f]}`;
  const answer = label(ansShape, ansFill);
  // distractors: same shape wrong fill, wrong shape right fill, wrong+wrong
  const otherFill = FILLS.filter((f) => f !== ansFill);
  const otherShape = SHAPES.filter((s) => s !== ansShape);
  const distractors = [
    label(ansShape, pick(otherFill, r)),
    label(pick(otherShape, r), ansFill),
    label(pick(otherShape, r), pick(otherFill, r))
  ];
  return {
    type: 'matrix',
    prompt: 'Find the missing shape.',
    matrixShapes: cells,
    options: buildOptions(answer, distractors, r),
    answer,
    explanation: 'Each row is a single shape; each column is a single fill style.'
  };
}

// ── NUMBER MATRIX (division) ── row rule C1 ÷ C2 = C3 (parametrized from DATA_POOL Q "row division")
export function genNumberMatrixDiv(r) {
  const rows = [];
  const seen = new Set();
  let guard = 0;
  while (rows.length < 3 && guard++ < 300) {
    const c2 = randInt(r, 2, 6);
    const c3 = randInt(r, 2, 9);
    const c1 = c2 * c3;
    if (c1 > 99 || seen.has(c1)) continue;
    seen.add(c1);
    rows.push([c1, c2, c3]);
  }
  const last = rows[2];
  const answer = last[2];
  const matrixData = [
    String(rows[0][0]), String(rows[0][1]), String(rows[0][2]),
    String(rows[1][0]), String(rows[1][1]), String(rows[1][2]),
    String(last[0]), String(last[1]), '?'
  ];
  const distractors = [last[0] - last[1], answer + 1, answer + 2, last[1]];
  return {
    type: 'matrix',
    prompt: 'Find the missing number.',
    matrixData,
    options: buildOptions(answer, distractors, r),
    answer: String(answer),
    explanation: 'Row rule: first ÷ second = third.'
  };
}

// ── MAGIC SQUARE ── 3×3 where every row, column and diagonal sums to the same total
// (Lo Shu, parametrized: random rotation/reflection + scale + offset, one cell hidden).
const LO_SHU = [8, 1, 6, 3, 5, 7, 4, 9, 2];
function rot90(g) { return [g[6], g[3], g[0], g[7], g[4], g[1], g[8], g[5], g[2]]; }
function reflectH(g) { return [g[2], g[1], g[0], g[5], g[4], g[3], g[8], g[7], g[6]]; }
export function genMagicSquare(r) {
  let g = [...LO_SHU];
  const turns = randInt(r, 0, 3);
  for (let i = 0; i < turns; i++) g = rot90(g);
  if (r() < 0.5) g = reflectH(g);
  const scale = randInt(r, 1, 4);
  const offset = randInt(r, 0, 6);
  g = g.map((v) => v * scale + offset); // still magic: rows/cols/diags all sum to 15·scale + 3·offset
  const hidden = randInt(r, 0, 8);
  const answer = g[hidden];
  const matrixData = g.map((v, i) => (i === hidden ? '?' : String(v)));
  const distractors = [answer + scale, answer - scale, answer + offset + 1, answer + 2 * scale];
  return {
    type: 'matrix',
    prompt: 'Find the missing number.',
    matrixData,
    options: buildOptions(answer, distractors, r),
    answer: String(answer),
    explanation: 'Magic square: every row, column and diagonal adds up to the same total.'
  };
}

const GENERATORS = [genNumberMatrix, genNumberSequence, genShapeMatrix];

// Returns { q1, q2 } as template-ready puzzles, two DIFFERENT families for variety.
export function generateIqTestSeededPuzzle(seedStr) {
  const rand = mulberry32(seedFrom(seedStr));
  const order = shuffle([0, 1, 2], rand);
  const q1 = { id: `q1_${seedStr}_iqtest`, difficulty: 'iqtest', ...GENERATORS[order[0]](rand) };
  const q2 = { id: `q2_${seedStr}_iqtest`, difficulty: 'iqtest', ...GENERATORS[order[1]](rand) };
  return { q1, q2 };
}
