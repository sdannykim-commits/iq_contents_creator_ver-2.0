// ────────────────────────────────────────────────────────────────────────────
// UNIFIED LOGIC POOL
// ────────────────────────────────────────────────────────────────────────────
// One cumulative pool of every analysed puzzle LOGIC — the trick families learned
// from viral examples PLUS the iqspark.digital question logics — all as parametric
// generators. The daily 2 questions are picked RANDOMLY from this whole pool and
// vary only their numbers / simple shapes; the rule, structure and difficulty of
// each original logic are preserved. No LLM invents anything here.
//
// Adding a newly-analysed logic later = write its parametric generator and register
// one entry below; the daily generator then draws from it automatically.
//
// There are far more number logics than shape logics, so number puzzles come up
// more often (and a day can be all-numbers) — that's intentional, not a 1:1 split.
// ────────────────────────────────────────────────────────────────────────────

import { genGenreA, genGenreB, genGenreC, validateViralPuzzle } from './viral-engine';
import {
  genNumberMatrix, genNumberSequence, genShapeMatrix,
  genNumberMatrixDiv, genMagicSquare
} from './iqtest-engine';

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

// A generated puzzle is valid when its answer is one of its 4 options (true by
// construction for the deterministic families; the viral families add a stricter
// uniqueness check so an ambiguous variant is rejected and regenerated).
const answerInOptions = (q) =>
  !!q && q.answer != null && Array.isArray(q.options) && q.options.map(String).includes(String(q.answer));

// The pool. `difficulty` preserves each original logic's inherent level (unused for
// selection today, but kept so a future "match yesterday's level" rule is trivial).
const POOL = [
  // ── learned trick logics (numbers) ──
  { id: 'trick-grid',   difficulty: 'trick',  generate: genGenreA,        validate: validateViralPuzzle },
  { id: 'trick-map',    difficulty: 'trick',  generate: genGenreB,        validate: validateViralPuzzle },
  { id: 'pemdas',       difficulty: 'trick',  generate: genGenreC,        validate: validateViralPuzzle },
  // ── iqspark.digital logics (numbers) ──
  { id: 'number-matrix',   difficulty: 'medium', generate: genNumberMatrix,    validate: answerInOptions },
  { id: 'number-division', difficulty: 'medium', generate: genNumberMatrixDiv, validate: answerInOptions },
  { id: 'number-sequence', difficulty: 'medium', generate: genNumberSequence,  validate: answerInOptions },
  { id: 'magic-square',    difficulty: 'medium', generate: genMagicSquare,     validate: answerInOptions },
  // ── iqspark.digital logics (shapes) ──
  { id: 'shape-matrix',    difficulty: 'medium', generate: genShapeMatrix,     validate: answerInOptions }
];

// Pick a random pool entry and produce one valid puzzle from it (retry within the
// entry on the rare invalid variant; fall back to a number sequence which never fails).
function makeOne(rand) {
  const entry = POOL[Math.floor(rand() * POOL.length)];
  for (let i = 0; i < 20; i++) {
    const q = entry.generate(rand);
    if (entry.validate(q) && answerInOptions(q)) return { entry, q };
  }
  return { entry: { id: 'number-sequence' }, q: genNumberSequence(rand) };
}

// Daily set of 2 puzzles drawn from the whole pool. q1 and q2 are independent (they
// may be the same family with different numbers) — the caller's never-repeat check
// guarantees they differ from each other and from history; here we only avoid an
// obviously-identical pair to save the caller a retry.
export function generateDailyFromPool(seedStr) {
  const rand = mulberry32(seedFrom(seedStr));
  const first = makeOne(rand);
  let second = makeOne(rand);
  let guard = 0;
  const sig = (o) => `${o.q.type}|${o.q.equation || (o.q.matrixData || o.q.sequenceData || o.q.matrixShapes || []).map((c) => c && c.shape ? c.shape + (c.fill || '') : c).join(',')}|${o.q.answer}`;
  while (sig(second) === sig(first) && guard++ < 12) second = makeOne(rand);
  return {
    q1: { id: `q1_${seedStr}_${first.entry.id}`, difficulty: first.entry.difficulty, ...first.q },
    q2: { id: `q2_${seedStr}_${second.entry.id}`, difficulty: second.entry.difficulty, ...second.q }
  };
}
