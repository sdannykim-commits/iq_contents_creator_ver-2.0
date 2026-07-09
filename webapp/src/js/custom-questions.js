// Override controller for custom puzzles or image uploads.
// Rebuilds custom data into template compatible formats.

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
      options: ['A', 'B', 'C', 'D'], // Default options wrapper
      answer: answer || 'A',
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

  hasOverride(slot) {
    return this.overrides[slot] !== null;
  }
}
