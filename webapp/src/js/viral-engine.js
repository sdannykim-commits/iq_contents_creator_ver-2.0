// ────────────────────────────────────────────────────────────────────────────
// VIRAL TRICK ENGINE
// ────────────────────────────────────────────────────────────────────────────
// Parametric generators for the "viral trick" puzzle families that actually go
// viral on Shorts / live streams (the ones that flood the comments with "60",
// "29", "why 40"). Analysed from real circulating examples and reduced to a small
// bank of rule families, each of which is expanded with FRESH random numbers on
// every call → effectively infinite, never-repeating puzzles.
//
// Design rule (deliberate): we ONLY keep families whose intended rule is UNIQUE
// and defensible (so our pinned-comment answer can't be "roasted" as wrong).
// Genuinely-ambiguous viral bait (e.g. 16×1=6, 3+2=8 where several rules fit) is
// intentionally excluded — the ambiguity we want comes from "did you spot the
// hidden rule?", not from a contested answer.
//
// All families render as the existing `type:'text'` / `equation` card, so no new
// rendering is required. This mirrors, deterministically & offline, what the
// Claude viral prompt produces online.
// ────────────────────────────────────────────────────────────────────────────

// mulberry32 seeded RNG (kept local so this module is self-contained).
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
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

// Builds exactly 4 unique string options: the correct answer + up to 3 supplied
// distractors, padded with near-misses so it's always a full 4-choice grid.
function buildOptions(correct, distractors, r) {
  const opts = [String(correct)];
  for (const d of distractors) {
    const s = String(d);
    if (!opts.includes(s) && Number.isFinite(Number(d))) opts.push(s);
    if (opts.length === 4) break;
  }
  let delta = 1;
  while (opts.length < 4) {
    const cand = String(correct + delta);
    if (!opts.includes(cand)) opts.push(cand);
    delta = delta > 0 ? -delta : -delta + 1; // 1,-1,2,-2,3...
  }
  return shuffle(opts, r);
}

// ── GENRE A · two-operand hidden-rule grid ──────────────────────────────────
// Rows are shown as "a + b = result" but the real rule combines a & b via a
// hidden formula (that's the trick). One rule cleanly fits every row.
const GENRE_A = [
  { name: 'a×b + a',    f: (a, b) => a * b + a,       exp: 'Multiply the two numbers, then add the first: a×b + a.' },
  { name: 'a×b + b',    f: (a, b) => a * b + b,       exp: 'Multiply the two numbers, then add the second: a×b + b.' },
  { name: 'a×(a+b)',    f: (a, b) => a * (a + b),     exp: 'Multiply the first number by the sum: a×(a+b).' },
  { name: 'a + b + a×b',f: (a, b) => a + b + a * b,   exp: 'Add both numbers, then add their product: a + b + a×b.' },
  { name: 'a² + b',     f: (a, b) => a * a + b,       exp: 'Square the first number, then add the second: a² + b.' },
  { name: '(a+b)×k',    f: (a, b, k) => (a + b) * k,  exp: 'Add the two numbers, then multiply by K.', usesK: true }
];

function genGenreA(r) {
  const fam = pick(GENRE_A, r);
  const k = fam.usesK ? randInt(r, 3, 6) : null;
  const F = (a, b) => fam.f(a, b, k);

  // 3 visible rows + 1 hidden row, all with distinct results.
  const rows = [];
  const seenResults = new Set();
  let guard = 0;
  while (rows.length < 4 && guard++ < 200) {
    const a = randInt(r, 2, 12);
    const b = randInt(r, 1, 9);
    if (a === b) continue;
    const res = F(a, b);
    if (res <= 0 || String(res).length > 5 || seenResults.has(res)) continue;
    seenResults.add(res);
    rows.push({ a, b, res });
  }
  const last = rows[rows.length - 1];
  const lines = rows.map((row, i) =>
    i === rows.length - 1 ? `${row.a} + ${row.b} = ?` : `${row.a} + ${row.b} = ${row.res}`
  );
  const answer = last.res;
  const distractors = [
    last.a + last.b,                 // the "obvious" addition (naive trap)
    last.a * last.b,                 // plain product
    fam.usesK ? (last.a + last.b) * (k + 1) : answer + last.a,
    answer + last.b
  ];
  const kNote = fam.usesK ? ` Here K = ${k}.` : '';
  return {
    type: 'text',
    prompt: 'Crack the hidden rule.',
    equation: lines.join('\n'),
    options: buildOptions(answer, distractors, r),
    answer: String(answer),
    explanation: fam.exp + kNote
  };
}

// ── GENRE B · single-number mapping (n → g(n)) ──────────────────────────────
const GENRE_B = [
  { name: 'n×(n+1)',   g: (n) => n * (n + 1),     exp: 'Each number n maps to n×(n+1).' },
  { name: 'n×(n−1)',   g: (n) => n * (n - 1),     exp: 'Each number n maps to n×(n−1).' },
  { name: 'n×(n−1)×2', g: (n) => n * (n - 1) * 2, exp: 'Each number n maps to n×(n−1)×2.' },
  { name: 'n²',        g: (n) => n * n,           exp: 'Each number n maps to its square, n².' },
  { name: 'n×(n+2)',   g: (n) => n * (n + 2),     exp: 'Each number n maps to n×(n+2).' },
  { name: 'n³ − n',    g: (n) => n * n * n - n,   exp: 'Each number n maps to n³ − n.' }
];

function genGenreB(r) {
  const fam = pick(GENRE_B, r);
  // 4 distinct n values (2..9), rows displayed, the last hidden.
  const ns = shuffle([2, 3, 4, 5, 6, 7, 8, 9], r).slice(0, 4);
  const rows = ns.map((n) => ({ n, v: fam.g(n) }));
  const last = rows[rows.length - 1];
  const lines = rows.map((row, i) =>
    i === rows.length - 1 ? `${row.n} = ?` : `${row.n} = ${row.v}`
  );
  const answer = last.v;
  const distractors = [answer + last.n, answer - last.n, fam.g(last.n + 1), fam.g(last.n - 1)];
  return {
    type: 'text',
    prompt: 'Find the hidden rule.',
    equation: lines.join('\n'),
    options: buildOptions(answer, distractors, r),
    answer: String(answer),
    explanation: fam.exp
  };
}

// ── GENRE C · order-of-operations (PEMDAS) trap ─────────────────────────────
// A single expression whose correct (precedence) answer differs from the naive
// left-to-right answer. Unambiguous — the answer is mathematically unique.
function genGenreC(r) {
  const a = randInt(r, 2, 12);
  const b = randInt(r, 2, 9);
  const c = randInt(r, 2, 9);
  const useMinus = r() < 0.5;
  const d = useMinus ? randInt(r, 1, 9) : 0;

  // correct respects ×-before-+/−; naive goes strictly left-to-right.
  const correct = useMinus ? a + b * c - d : a + b * c;
  const naive = useMinus ? (a + b) * c - d : (a + b) * c;
  const expr = useMinus ? `${a} + ${b} × ${c} − ${d}` : `${a} + ${b} × ${c}`;

  const distractors = [naive, correct + d, correct - b, a * b * c];
  return {
    type: 'text',
    prompt: 'Mind the order.',
    equation: `${expr} = ?`,
    options: buildOptions(correct, distractors, r),
    answer: String(correct),
    explanation: 'Order of operations: multiply before you add or subtract.'
  };
}

const GENERATORS = { A: genGenreA, B: genGenreB, C: genGenreC };

// ── Defensibility validator ─────────────────────────────────────────────────
// Claude (the primary viral path) can occasionally emit an AMBIGUOUS puzzle whose
// answer isn't uniquely determined (e.g. all example rows use b = a+1, so several
// rules fit). This checks a text puzzle against the same rule banks and returns
// true ONLY when exactly one family reproduces every solved row AND its predicted
// answer matches. Anything it can't prove defensible → false (caller falls back to
// the deterministic generator, which is unique-by-construction).
const A_FITS = GENRE_A.flatMap((fam) =>
  fam.usesK ? [3, 4, 5, 6].map((k) => (a, b) => fam.f(a, b, k)) : [(a, b) => fam.f(a, b)]
);
const B_FITS = GENRE_B.map((fam) => (n) => fam.g(n));

function fitsUnique(rows, query, ans, fits) {
  const preds = new Set();
  for (const f of fits) {
    if (rows.every((r) => f(r[0], r[1]) === r[r.length - 1])) preds.add(f(query[0], query[1]));
  }
  return preds.size === 1 && [...preds][0] === ans;
}

function validatePemdas(line, ans) {
  const m = line.replace(/=\s*\?\s*$/, '').trim()
    .match(/^(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)(?:\s*−\s*(\d+))?$/);
  if (!m) return false;
  const [a, b, c, d] = [+m[1], +m[2], +m[3], m[4] ? +m[4] : 0];
  return a + b * c - d === ans;
}

export function validateViralPuzzle(q) {
  if (!q || q.type !== 'text' || !q.equation) return false;
  const ans = Number(q.answer);
  if (!Number.isFinite(ans)) return false;
  const lines = q.equation.split('\n').map((s) => s.trim()).filter(Boolean);

  if (q.equation.includes('×')) return validatePemdas(lines[lines.length - 1], ans);

  const rows = [];
  let query = null;
  let kind = null;
  for (const ln of lines) {
    let m = ln.match(/^(\d+)\s*\+\s*(\d+)\s*=\s*(\d+|\?)$/);
    if (m) { kind = 'A'; m[3] === '?' ? (query = [+m[1], +m[2]]) : rows.push([+m[1], +m[2], +m[3]]); continue; }
    m = ln.match(/^(\d+)\s*=\s*(\d+|\?)$/);
    if (m) { kind = 'B'; m[2] === '?' ? (query = [+m[1]]) : rows.push([+m[1], undefined, +m[2]]); continue; }
    return false; // unrecognised line → can't prove defensible
  }
  if (!query || rows.length < 2) return false;
  if (kind === 'B') return fitsUnique(rows.map((r) => [r[0], undefined, r[2]]), query, ans, B_FITS);
  return fitsUnique(rows, query, ans, A_FITS);
}

// Returns one defensible viral puzzle for a slot ('q1'|'q2'), used to repair an
// ambiguous Claude puzzle without changing the other slot.
export function repairViralSlot(slot, seedStr) {
  return generateViralSeededPuzzle(`${seedStr}_repair_${slot}`)[slot];
}

// Deterministic offline mirror of the viral Claude path. Returns { q1, q2 } as
// template-ready text puzzles, using two DIFFERENT genres for variety.
export function generateViralSeededPuzzle(seedStr) {
  const rand = mulberry32(seedFrom(seedStr));
  const keys = shuffle(['A', 'B', 'C'], rand);
  // Self-validate: a genre-A grid can rarely be degenerate (e.g. a fixed → a×(a+b) and (a+b)×3
  // coincide). Regenerate with fresh params until the puzzle is provably unique, so the repair
  // net never itself emits an ambiguous puzzle. Bounded retries; genres B/C effectively never fail.
  const make = (gen) => {
    let q;
    for (let i = 0; i < 16; i++) {
      q = gen(rand);
      if (validateViralPuzzle(q)) return q;
    }
    return q;
  };
  const q1 = { id: `q1_${seedStr}_viral`, difficulty: 'viral', ...make(GENERATORS[keys[0]]) };
  const q2 = { id: `q2_${seedStr}_viral`, difficulty: 'viral', ...make(GENERATORS[keys[1]]) };
  return { q1, q2 };
}
