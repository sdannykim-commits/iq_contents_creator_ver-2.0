// mulberry32 seeded RNG
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Seed pool datasets: High-quality logic puzzles suitable for Mensa (Easy/Hard separation removed)
const DATA_POOL = {
  numerical: [
    { seq: [2, 4, 8, 16, '?'], ans: '32', opt: ['32', '24', '30', '64'], exp: 'Arithmetic series: each term is multiplied by 2.' },
    { seq: [3, 6, 12, 24, '?'], ans: '48', opt: ['48', '36', '40', '50'], exp: 'Arithmetic series: the sequence multiplies by 2 at each step.' },
    { seq: [5, 10, 15, 20, '?'], ans: '25', opt: ['25', '30', '35', '22'], exp: 'Arithmetic series with common difference +5.' },
    { seq: [1, 4, 9, 16, '?'], ans: '25', opt: ['25', '36', '20', '30'], exp: 'Perfect squares sequence (1², 2², 3², 4², 5²).' },
    { seq: [2, 3, 5, 7, '?'], ans: '11', opt: ['11', '9', '13', '15'], exp: 'Sequence of consecutive prime numbers.' },
    { seq: [1, 2, 6, 15, '?'], ans: '31', opt: ['31', '25', '28', '36'], exp: 'Double sequence: differences are perfect squares (+1², +2², +3², +4²).' }
  ],
  matrix: [
    { grid: ['1', '2', '3', '2', '4', '6', '3', '6', '?'], ans: '9', opt: ['9', '8', '12', '10'], exp: 'Row logic: Cell1 + Cell2 = Cell3.' },
    { grid: ['2', '3', '5', '4', '2', '6', '8', '3', '?'], ans: '11', opt: ['11', '9', '12', '10'], exp: 'Row logic: Cell1 + Cell2 = Cell3.' },
    { grid: ['12', '4', '3', '20', '5', '4', '18', '3', '?'], ans: '6', opt: ['6', '9', '8', '5'], exp: 'Row division: Cell1 divided by Cell2 equals Cell3.' },
    { grid: ['8', '1', '6', '3', '5', '7', '4', '9', '?'], ans: '2', opt: ['2', '5', '6', '8'], exp: 'Lo Shu Magic Square: The sum of elements in each row, column, and diagonal is 15.' }
  ]
  // NOTE: the "analogy" category was intentionally removed from the offline pool. Its entries
  // relied on letter-counting / alphabet-index gimmicks (e.g. word length², position sums),
  // which are explicitly disallowed. Offline fallback now only serves numerical + matrix puzzles.
};

// Returns Claude API key from local storage or config
function getClaudeApiKey() {
  const key = localStorage.getItem('iqspark_claude_key') || import.meta.env.VITE_CLAUDE_API_KEY || '';
  return key.trim();
}

// Resolve the Anthropic endpoint base for the current build:
//   • dev  → the vite proxy (vite.config.js), which sidesteps CORS during local development.
//   • prod → api.anthropic.com directly. The `anthropic-dangerous-direct-browser-access`
//            header below is exactly what authorizes a browser-origin call, so a built/
//            deployed site can reach Claude Opus 4.8 too (using the localStorage or
//            build-time VITE_CLAUDE_API_KEY). No proxy required.
function getAnthropicBase() {
  return import.meta.env.DEV ? '/api/anthropic' : 'https://api.anthropic.com';
}

// Standard headers for every Anthropic Messages call. The browser-access header is what
// authorizes a direct browser-origin request (dev proxy or prod).
function anthropicHeaders(apiKey) {
  return {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  };
}

// Pulls the final assistant text out of a Messages response. When server tools such as
// web_search run, `content` holds tool_use / tool_result blocks before the answer, so we
// take the LAST text block rather than assuming content[0].
function extractClaudeText(resJson) {
  const blocks = (resJson && resJson.content) || [];
  const textBlocks = blocks.filter(b => b.type === 'text' && typeof b.text === 'string');
  if (textBlocks.length === 0) {
    throw new Error('No text block found in Claude response.');
  }
  return textBlocks[textBlocks.length - 1].text.trim();
}

// Parses Claude's JSON response defensively. Models sometimes wrap the object in a ```json
// fence or — especially when the web_search tool runs — add a sentence of narration around
// it. Strip the fence, then slice to the outermost { … } braces before parsing.
function parseClaudeJSON(text) {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  if (cleaned[0] !== '{') {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last > first) {
      cleaned = cleaned.slice(first, last + 1);
    }
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Failed to parse Claude JSON response: ${e.message}`);
  }
}

// Claude Opus 4.8 API Engine Integration - Generates premium high-quality questions for Q1 and Q2
export async function fetchClaudeDailyPuzzle(seedStr) {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    throw new Error("Claude API Key is missing. Falling back to offline engine.");
  }

  const systemPrompt = `
You are a world-class cognitive psychologist and puzzle designer for the high-IQ community (Mensa, Raven's Progressive Matrices).
Generate two logical puzzles (q1 and q2) inspired by real high-IQ test patterns.

SOURCING (pick whichever produces the strongest pair):
- You MAY use the web_search tool to find genuine, currently-circulating IQ / Mensa / Raven's test questions (including ones featured in YouTube IQ-test videos). If you do, adapt each faithfully into the JSON schema below — never copy a broken or ambiguous item.
- If you do not search (or find nothing solid), construct ORIGINAL puzzles that strictly obey the rule types listed below.

Conform strictly to the following quality principles:
- **Both q1 and q2 must be challenging, engaging, and premium high-quality logic puzzles suitable for Mensa or Raven's test takers. Treat them as equals — neither is an "easy" warm-up.**
- **DO NOT split questions into "easy" or "childish" tiers. Keep both questions intellectually engaging.**
- **DO NOT generate simple, childish, or trivial analogies (e.g., avoid basic addition or linear counting like 2, 4, 6, 8 or mappings like "Sun : Day :: Moon : Night").**
- **BANNED: never use letter-counting or alphabet-index gimmicks — no "number of letters in the word", no "word length squared", no "sum/product of A=1..Z=26 letter positions". These read as cheap trick questions and are not allowed.**
- Utilize logical rules such as row division/multiplication in matrices or multi-step numeric series progression.
- Every puzzle MUST be internally consistent: the stated answer must be the unique, provable result of the explanation's rule.

General constraints:
1. The puzzles must fall into one of these types: "numerical" (series sequence), "matrix" (3x3 grid cells), or "analogy" (word/pattern logic).
2. Provide 4 choices (options) for each question. One choice must match the correct answer.
3. The "prompt" field is shown ON the question card. It MUST be a SHORT, punchy call-to-action of at most ~6 words (e.g. "Find the missing number.", "Solve the grid.", "Complete the analogy."). It MUST NOT describe, hint at, or reveal the rule/logic in any way — no mention of "each row", "non-linear", "multiply", "add", etc. ALL rule details go ONLY in "explanation" (which is shown later on the answer card).
4. LENGTH LIMITS (the card is a mobile 9:16 frame — keep content compact): a numerical series has AT MOST 7 terms (including the "?"); each of the 4 options is AT MOST 6 characters; matrix cell values are AT MOST 3 digits; analogy terms are AT MOST 10 characters; every "explanation" is AT MOST 200 characters (one or two tight sentences).

Output MUST be a single raw JSON object conforming EXACTLY to this JSON structure:
{
  "q1": {
    "type": "numerical|matrix|analogy",
    "prompt": "prompt description...",
    "options": ["choice1", "choice2", "choice3", "choice4"],
    "answer": "correct_value",
    "explanation": "explanation of logic rule...",
    "sequenceData": [2, 4, 8, 16, "?"], // only if type is numerical
    "matrixData": ["1", "2", "3", "2", "4", "6", "3", "6", "?"], // only if type is matrix
    "analogyData": ["Sun", "Day", "Moon", "/"] // only if type is analogy (use / or ? for blank)
  },
  "q2": {
    "type": "numerical|matrix|analogy",
    "prompt": "prompt description...",
    "options": ["choice1", "choice2", "choice3", "choice4"],
    "answer": "correct_value",
    "explanation": "explanation of logic rule...",
    "sequenceData": [...],
    "matrixData": [...],
    "analogyData": [...]
  }
}
Do not wrap JSON in markdown block tags. Return only the raw JSON.
`;

  const userMsg = `Generate a completely unique, original, high-IQ logical puzzle set (q1 + q2). Prefer sourcing genuine IQ/Mensa test questions via web_search when it strengthens the pair. Seed signature: ${seedStr}`;

  // Fire the request. `useSearch` first pulls real questions off the web; if the tool is
  // unavailable on this key (or the request errors), we transparently retry the plain
  // rule-based generation so the Opus 4.8 path still works — offline is only the last resort.
  async function callClaude(useSearch) {
    const body = {
      model: 'claude-opus-4-8',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }]
    };
    if (useSearch) {
      body.tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }];
    }
    const response = await fetch(`${getAnthropicBase()}/v1/messages`, {
      method: 'POST',
      headers: anthropicHeaders(apiKey),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      // Surface the API's actual reason (e.g. low credit / auth / rate limit), not just the code.
      let detail = '';
      try { const e = await response.json(); detail = (e && e.error && e.error.message) || ''; } catch (_) {}
      const err = new Error(`HTTP ${response.status}${detail ? ' — ' + detail : ''}`);
      err.status = response.status;
      err.detail = detail;
      throw err;
    }
    return response.json();
  }

  // One full attempt = request + extract + parse + schema-validate. We try the web_search
  // path first (real sourced questions); if anything fails — HTTP error, prose-wrapped JSON,
  // or a bad schema — we retry once WITHOUT search, which reliably returns clean JSON.
  async function attempt(useSearch) {
    const resJson = await callClaude(useSearch);
    const data = parseClaudeJSON(extractClaudeText(resJson));
    if (!data.q1 || !data.q2) {
      throw new Error('Invalid schema returned from Claude API.');
    }
    return data;
  }

  let data;
  try {
    data = await attempt(true);
  } catch (searchErr) {
    console.warn('⚠️ web_search-sourced generation failed, retrying rule-based Opus 4.8:', searchErr.message);
    data = await attempt(false);
  }

  // Inject IDs
  data.q1.id = `q1_${seedStr}_claude`;
  data.q2.id = `q2_${seedStr}_claude`;
  data.q1.difficulty = 'high_iq';
  data.q2.difficulty = 'high_iq';

  return data;
}

// Claude Opus 4.8 Vision Rebuilder: Extract logic rules & data fields from uploaded screenshot images
export async function fetchClaudeVisionRebuilder(base64Data, mediaType) {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Cannot run Vision analyzer.");
  }

  const systemPrompt = `
You are an expert puzzle restorer.
Your task is to analyze the uploaded screenshot of an intelligence puzzle (which might have noise, mobile UI status bars, or screenshot borders).
1. Discard all UI buttons, smartphone battery/wifi indicators, or unrelated noise.
2. Deduce and extract the exact logical equations, grid cells, or number series from the image.
3. Classify the puzzle type as "numerical" (series sequence), "matrix" (3x3 grid cells), "analogy" (word/index match), or "text" (stacked trick equations).
4. Parse the 4 choices (options), the correct answer, and provide a clear logic explanation.

Output MUST be a single raw JSON object matching this schema exactly:
{
  "success": true,
  "kind": "text", // Rebuild as clean text-based components inside our template
  "type": "numerical|matrix|analogy|text",
  "prompt": "Decipher the logical rule and solve.",
  "options": ["A", "B", "C", "D"], // list of extracted choice values
  "answer": "correct_option_value",
  "explanation": "Derived mathematical or logical rule...",
  "equation": "10 + 1 = 11\\n20 + 2 = 35...", // parsed equation lines (if text type)
  "matrixData": ["1", "2", "3"...], // grid cells (if matrix type)
  "sequenceData": [2, 4, 8...] // sequence numbers (if numerical type)
}
Do not wrap JSON in markdown block tags. Return only the raw JSON.
`;

  const response = await fetch(`${getAnthropicBase()}/v1/messages`, {
    method: 'POST',
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Perform the puzzle extraction and output raw JSON.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} from Vision API`);
  }

  const resJson = await response.json();
  return parseClaudeJSON(extractClaudeText(resJson));
}

// Claude Opus 4.8 Revision Agent: a second-pass QA/reviewer that takes a DRAFT puzzle
// (freshly extracted from an image, or typed by the user) and polishes it into a clean,
// logically-verified, template-ready object. This is the "수정 서브 에이전트" — it raises
// the completeness of anything that gets adapted into the IQ Spark template.
export async function fetchClaudeRevisePuzzle(draft, sourceContext = '') {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    throw new Error("Claude API Key is missing for the revision agent.");
  }

  const systemPrompt = `
You are a meticulous puzzle QA / revision specialist for the "IQ Spark" short-form video template.
You receive a DRAFT puzzle (extracted from a screenshot, or typed by a user) plus optional context.
Your job is to return a single, polished, template-ready puzzle that is guaranteed to be solvable and unambiguous.

Do ALL of the following:
1. Determine the single clearest logical rule the draft intends. If the draft's stated answer does not uniquely follow from that rule, CORRECT the answer (or minimally rewrite the puzzle) so it does.
2. Classify "type" as exactly one of: "numerical" (number series), "matrix" (3x3 grid), "analogy" (word/index logic), or "text" (stacked trick equations).
3. Provide EXACTLY 4 "options": one MUST be identical to "answer" (as a string); the other 3 must be plausible, non-trivial distractors. No duplicates.
4. Populate the data field matching the type:
   - numerical → "sequenceData": array ending in "?"  (e.g. [2,4,8,16,"?"])
   - matrix    → "matrixData": 9 cells, the unknown as "?"
   - analogy   → "analogyData": 4 items, blank as "?"  (e.g. ["DOG","26","CAT","?"])
   - text      → "equation": the multi-line equations, unknown row ends with "?"
5. Write a concise, correct "explanation" of the rule (one or two sentences).
6. The "prompt" is shown ON the question card, so it MUST be a SHORT call-to-action of at most ~6 words (e.g. "Find the missing number.") that NEVER describes, hints at, or reveals the rule. If the draft's prompt explains the logic, replace it with a short generic instruction. All rule detail belongs ONLY in "explanation".
7. If the draft is broken, childish, or ambiguous, REWRITE it into a clean Mensa-grade puzzle of the same spirit and type.
8. BANNED rule family: never produce letter-counting / alphabet-index gimmicks (word length, word-length squared, or A=1..Z=26 position sums/products). If the draft uses one, replace it with a genuine numeric/logical rule.
9. LENGTH LIMITS (mobile card): series ≤ 7 terms; each option ≤ 6 chars; matrix values ≤ 3 digits; analogy terms ≤ 10 chars; "explanation" ≤ 200 chars. Trim/simplify if the draft exceeds these.

Output MUST be a single raw JSON object EXACTLY in this shape (include only the data field that matches the type):
{
  "kind": "text",
  "type": "numerical|matrix|analogy|text",
  "prompt": "...",
  "options": ["...","...","...","..."],
  "answer": "...",
  "explanation": "...",
  "equation": "line1\\nline2\\n...",
  "matrixData": ["..."],
  "sequenceData": ["..."],
  "analogyData": ["..."]
}
Do not wrap JSON in markdown block tags. Return only the raw JSON.
`;

  const response = await fetch(`${getAnthropicBase()}/v1/messages`, {
    method: 'POST',
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Context: ${sourceContext || 'none'}\n\nDRAFT puzzle (JSON):\n${JSON.stringify(draft)}\n\nReturn the revised, QA-verified puzzle as raw JSON.`
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} from revision agent`);
  }

  const resJson = await response.json();
  const revised = parseClaudeJSON(extractClaudeText(resJson));
  if (!revised.answer || !Array.isArray(revised.options) || revised.options.length < 2) {
    throw new Error('Revision agent returned an incomplete puzzle.');
  }
  return revised;
}

// Claude Opus 4.8 BGM/Shorts Copywriter: Generate virally optimized headlines
export async function fetchClaudeTopHooks(style = 'any', count = 5) {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    throw new Error("Claude API Key is missing for Hook generator.");
  }

  const systemPrompt = `
You are a viral copywriting genius for SNS platforms (YouTube Shorts, Instagram Reels, TikTok, Threads).
Your task is to write high-converting, attention-grabbing, and algorithm-optimized top hook headlines for daily IQ test puzzles.

Adopt one of these psychology styles if requested:
- challenge: Dare the viewer to test their score (e.g., identity checks, genius baits).
- fomo: Create intense curiosity or fear of missing out (e.g., failure rates, swiping warnings).
- identity: Appeal to their cognitive ego (e.g., top 2% group memberships).
- urgency: Create speed pressure (e.g., tick tock timer constraints).
- engagement: Explicitly drive comments (e.g., drop answers below).

Conform strictly to the following parameters:
1. Do not use generic, boring, or robotic statements. Write punchy, modern internet copies.
2. The output language must be English. Keep them under 45 characters if possible for clean mobile layout fits.
3. Output MUST be a single raw JSON object matching this schema exactly:
{
  "hooks": [
    "Hook 1...",
    "Hook 2...",
    "Hook 3...",
    "Hook 4...",
    "Hook 5..."
  ]
}
Do not wrap JSON in markdown block tags. Return only the raw JSON.
`;

  const response = await fetch(`${getAnthropicBase()}/v1/messages`, {
    method: 'POST',
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Generate ${count} virally optimized hooks in style: ${style}` }]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} from Claude Hook API`);
  }

  const resJson = await response.json();
  const data = parseClaudeJSON(extractClaudeText(resJson));
  return data.hooks || [];
}

// Offline deterministic generator - Pulls premium puzzles uniformly from unified high-IQ dataset pool
export function generateLocalSeededPuzzle(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  const rand = mulberry32(seed);
  
  // Only numerical + matrix offline (analogy pool removed — see DATA_POOL note).
  const types = ['numerical', 'matrix'];
  const typeIndexQ1 = Math.floor(rand() * types.length);
  const typeQ1 = types[typeIndexQ1];

  const remainingTypes = types.filter(t => t !== typeQ1);
  const typeQ2 = remainingTypes[Math.floor(rand() * remainingTypes.length)];

  // Fetch from unified premium datasets without difficulty tier separation
  const poolQ1 = DATA_POOL[typeQ1];
  const q1Data = poolQ1[Math.floor(rand() * poolQ1.length)];

  const poolQ2 = DATA_POOL[typeQ2];
  const q2Data = poolQ2[Math.floor(rand() * poolQ2.length)];

  function shuffle(array, r) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const q1 = {
    id: `q1_${seedStr}`,
    difficulty: 'high_iq',
    type: typeQ1,
    prompt: typeQ1 === 'numerical' ? 'Find the logic rule and complete the series.' : 
            typeQ1 === 'matrix' ? 'Solve the missing cell in the logical matrix.' : 
                                 'Complete the analogy matching rule.',
    options: shuffle(q1Data.opt, rand),
    answer: q1Data.ans,
    explanation: q1Data.exp,
    sequenceData: q1Data.seq || null,
    matrixData: q1Data.grid || null,
    analogyData: q1Data.term || null
  };

  const q2 = {
    id: `q2_${seedStr}`,
    difficulty: 'high_iq',
    type: typeQ2,
    prompt: typeQ2 === 'numerical' ? 'Find the hidden pattern in the series.' : 
            typeQ2 === 'matrix' ? 'Discover the logic pattern in the matrix.' : 
                                 'Decipher the analogical logic.',
    options: shuffle(q2Data.opt, rand),
    answer: q2Data.ans,
    explanation: q2Data.exp,
    sequenceData: q2Data.seq || null,
    matrixData: q2Data.grid || null,
    analogyData: q2Data.term || null
  };

  return { q1, q2 };
}

// Content signature for a question — dedup is by ACTUAL puzzle content (type + data + answer),
// NOT by a seed-derived id. Seed-derived ids are deterministic, so id-based dedup wrongly
// flagged a same-date reload as "already seen" and forced the offline pool. Content signatures
// let Claude regenerate a genuinely different puzzle when a repeat is detected.
export function puzzleSignature(q) {
  if (!q) return '';
  const raw = q.equation || q.sequenceData || q.matrixData || q.analogyData || q.prompt || '';
  const data = Array.isArray(raw) ? raw.join(',') : String(raw);
  return `${q.type || 'x'}|${data}|${q.answer}`;
}

// LocalStorage duplicate prevention (up to 4000 signatures). v2 = content signatures.
const SEEN_KEY = 'iqspark_seen_v2';

export function markAsSeen(sig) {
  if (!sig) return;
  try {
    let seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    if (!seen.includes(sig)) {
      seen.push(sig);
      if (seen.length > 4000) seen.shift();
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  } catch (e) {
    console.error('Failed to update seen history:', e);
  }
}

export function isAlreadySeen(sig) {
  if (!sig) return false;
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    return seen.includes(sig);
  } catch (e) {
    return false;
  }
}
