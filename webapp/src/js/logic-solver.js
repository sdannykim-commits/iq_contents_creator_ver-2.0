// Advanced logic solver for mathematical trick equations
// e.g., 16 x 1 = 6, 4 x 2 = 12, 2 x 3 = 10, 1 x 4 = ?
// Analyzes equations, handles decoy lines, and returns derived answers.

const RULE_CANDIDATES = [
  // ── Original Classic Rules ──
  { name: '(a + b) * 2', fn: (a, b) => (a + b) * 2 },
  { name: 'a * b + c', fn: (a, b, c) => a * b + (c || 0) },
  { name: 'a * (b + 1)', fn: (a, b) => a * (b + 1) },
  { name: 'a * b - a', fn: (a, b) => a * b - a },
  { name: 'a * b + b', fn: (a, b) => a * b + b },
  { name: 'a * b - b', fn: (a, b) => a * b - b },
  { name: 'a + b * 2', fn: (a, b) => a + b * 2 },
  { name: '(a - b) * 2', fn: (a, b) => (a - b) * 2 },
  { name: 'a * a + b', fn: (a, b) => a * a + b },
  { name: 'b * b + a', fn: (a, b) => b * b + a },
  { name: 'a * b / 2', fn: (a, b) => (a * b) / 2 },
  { name: '(a + 1) * (b + 1)', fn: (a, b) => (a + 1) * (b + 1) },
  { name: 'a * b - (a + b)', fn: (a, b) => a * b - (a + b) },
  
  // ── YouTube & Mensa Inspired Extension Rules [NEW] ──
  { name: '(a + b) * (a - b)', fn: (a, b) => (a + b) * (a - b) },
  { name: '(a * a) - (b * b)', fn: (a, b) => (a * a) - (b * b) },
  { name: 'a * b + a + b', fn: (a, b) => a * b + a + b },
  { name: '(a + b) * b', fn: (a, b) => (a + b) * b },
  { name: '(a + b) * a', fn: (a, b) => (a + b) * a },
  { name: 'a * (a - b)', fn: (a, b) => a * (a - b) },
  { name: 'b * (b - a)', fn: (a, b) => b * (b - a) },
  { name: '(a * b) - 2', fn: (a, b) => (a * b) - 2 },
  { name: '(a * b) + 2', fn: (a, b) => (a * b) + 2 },
  { name: '(a + 1) * b', fn: (a, b) => (a + 1) * b },
  { name: 'a * (b - 1)', fn: (a, b) => a * (b - 1) },
  { name: '(a + b) / 2 + a', fn: (a, b) => Math.floor((a + b) / 2) + a },
  
  // Fallback Add
  { name: 'a + b', fn: (a, b) => a + b }
];

export function solveEquationPuzzle(inputText) {
  // Parse rows
  const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsedRows = [];
  let targetRow = null;

  for (let line of lines) {
    if (line.includes('?') || line.endsWith('=')) {
      const match = line.match(/(\d+)\s*[\D]\s*(\d+)/);
      if (match) {
        targetRow = { a: parseInt(match[1]), b: parseInt(match[2]) };
      }
      continue;
    }

    const match = line.match(/(\d+)\s*[\D]\s*(\d+)\s*=\s*(\d+)/);
    if (match) {
      parsedRows.push({
        a: parseInt(match[1]),
        b: parseInt(match[2]),
        result: parseInt(match[3])
      });
    }
  }

  if (parsedRows.length === 0 || !targetRow) {
    return { success: false, error: 'Could not parse equation rows.' };
  }

  // Iterate rule candidates and find matching one
  for (const candidate of RULE_CANDIDATES) {
    let matchCount = 0;
    let failedRows = [];

    for (const row of parsedRows) {
      const computed = candidate.fn(row.a, row.b);
      if (computed === row.result) {
        matchCount++;
      } else {
        failedRows.push(row);
      }
    }

    if (matchCount >= parsedRows.length - 1 && matchCount > 0) {
      const finalResult = candidate.fn(targetRow.a, targetRow.b);
      return {
        success: true,
        ruleName: candidate.name,
        answer: finalResult,
        decoy: failedRows.length === 1 ? failedRows[0] : null
      };
    }
  }

  return { success: false, error: 'No matching logical rule discovered.' };
}
