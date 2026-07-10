// Override controller for custom puzzles or image uploads.
// Rebuilds custom data into template compatible formats.

// Builds 4 plausible options for a solved puzzle. For a numeric answer it derives real
// distractors around it (so the offline path never falls back to bare A/B/C/D placeholders);
// non-numeric answers keep lettered choices.
function buildOptions(answer) {
  const n = Number(answer);
  if (!Number.isFinite(n)) return ['A', 'B', 'C', 'D'];
  const opts = [];
  for (const d of [0, 2, -1, 3, -2, 4, 1]) {
    const v = String(n + d);
    if (!opts.includes(v)) opts.push(v);
    if (opts.length === 4) break;
  }
  return opts;
}

export class CustomQuestionManager {
  constructor() {
    this.overrides = {
      q1: null,
      q2: null
    };
  }

  setCustomTextPuzzle(slot, prompt, equationText, answer, explanation = '') {
    this.overrides[slot] = {
      kind: 'text',
      prompt: prompt || 'Can you solve this puzzle?',
      equation: equationText,
      options: buildOptions(answer),
      answer: String(answer ?? 'A'),
      explanation: explanation || 'Derived from the solved mathematical rule.'
    };
  }

  setCustomRebuiltPuzzle(slot, res) {
    this.overrides[slot] = {
      kind: res.kind || 'text',
      type: res.type || 'text',
      prompt: res.prompt || 'Solve the puzzle.',
      options: res.options || ['A', 'B', 'C', 'D'],
      answer: res.answer || 'A',
      explanation: res.explanation || '',
      equation: res.equation || null,
      matrixData: res.matrixData || null,
      sequenceData: res.sequenceData || null,
      analogyData: res.analogyData || null
    };
  }

  clearOverride(slot) {
    this.overrides[slot] = null;
  }


  getQuestion(slot, fallbackQuestion) {
    if (this.overrides[slot]) {
      return this.overrides[slot];
    }
    return fallbackQuestion;
  }
}
