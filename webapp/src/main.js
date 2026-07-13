import { fetchClaudeDailyPuzzle, generateLocalSeededPuzzle, fetchClaudeVisionRebuilder, fetchClaudeRevisePuzzle, fetchClaudeTopHooks, markAsSeen, isAlreadySeen, puzzleSignature } from './js/iq-engine';
import { getDailyCTA } from './js/cta-copy';
import { AudioClipProcessor } from './js/audio-clip';
import { solveEquationPuzzle } from './js/logic-solver';
import { HookAgent } from './js/hook-agent';
import { CustomQuestionManager } from './js/custom-questions';

// Import split helper modules
import { saveCurrentFramePng, renderVideo, exportAllZip } from './js/video-renderer';
import { generateFrames, updateHookDisplays } from './js/frame-renderer';
import { switchFrame, updateStepLabel, startAutoPlay, stopAutoPlay } from './js/playback-controller';

// ── State Management ────────────────────────────────
const state = {
  // The flow runs over frames 2..6 (Q1, Answer1, Q2, Comment, Final CTA). The old intro
  // frame (frame-1) was removed — the video starts directly on the first puzzle.
  currentFrame: 2,
  firstFrame: 2,
  totalFrames: 6, // last frame id
  p1Image: null,
  p2Image: null,
  bgmFile: null,
  hookText: 'Only 2% get BOTH right 🧠',
  captionText: '',
  cta: null, // Rotated daily CTA copy
  shuffleOffset: 0,
  timings: {
    p1: 24,
    a1: 6,
    p2: 24,
    comm: 2,
    cta: 4 // intro's 2s folded into the final CTA to keep the 60s (music-matched) total
  },
  audioSettings: {
    startPoint: 28,
    fadeIn: 2,
    fadeOut: 2,
    volume: 0.7
  },
  dailyPuzzle: null,
  ffmpeg: null,
  audioProcessor: new AudioClipProcessor(),
  customManager: new CustomQuestionManager(),
  isPlayingPreview: false,
  previewSourceNode: null,
  isPlayingAutoPlay: false,
  autoPlayTimer: null
};

// ── UI Elements (Mapped to Original HTML IDs) ───────
const elements = {
  // Header / Control
  btnNew: document.getElementById('btnNew'),
  datePick: document.getElementById('datePick'),
  btnResetHistory: document.getElementById('btnResetHistory'),

  // Attach Puzzle Images
  apFile0: document.getElementById('apFile0'),
  apPrompt0: document.getElementById('apPrompt0'),
  apChoices0: document.getElementById('apChoices0'),
  apClear0: document.getElementById('apClear0'),
  apThumb0: document.getElementById('apThumb0'),
  
  apFile1: document.getElementById('apFile1'),
  apPrompt1: document.getElementById('apPrompt1'),
  apChoices1: document.getElementById('apChoices1'),
  apClear1: document.getElementById('apClear1'),
  apThumb1: document.getElementById('apThumb1'),

  // Hook Generator
  hookStyle: document.getElementById('hookStyle'),
  btnGenHooks: document.getElementById('btnGenHooks'),
  hookCustom: document.getElementById('hookCustom'),
  btnApplyCustomHook: document.getElementById('btnApplyCustomHook'),
  hookResults: document.getElementById('hookResults'),
  hookCurrent: document.getElementById('hookCurrent'),

  // Generate panel
  genSource: document.getElementById('genSource'),

  // Custom Question 1 Override (manual equation puzzle only)
  customPrompt0: document.getElementById('customPrompt0'),
  customText0: document.getElementById('customText0'),
  btnApplyCustomText0: document.getElementById('btnApplyCustomText0'),
  btnResetCustom0: document.getElementById('btnResetCustom0'),
  customMsg0: document.getElementById('customMsg0'),

  // Custom Question 2 Override (manual equation puzzle only)
  customPrompt1: document.getElementById('customPrompt1'),
  customText1: document.getElementById('customText1'),
  btnApplyCustomText1: document.getElementById('btnApplyCustomText1'),
  btnResetCustom1: document.getElementById('btnResetCustom1'),
  customMsg1: document.getElementById('customMsg1'),

  // Preview & Canvas
  framePlaceholder: document.getElementById('frame-placeholder'),
  frameCanvasCard: document.getElementById('frame-canvas'),
  steps: document.getElementById('steps'),

  // Carousel Navigation / Actions
  btnPlay: document.getElementById('btnPlay'),
  btnStop: document.getElementById('btnStop'),
  btnPrev: document.getElementById('btnPrev'),
  btnNext: document.getElementById('btnNext'),
  stepLabel: document.getElementById('stepLabel'),
  btnShot: document.getElementById('btnShot'),
  btnShotAll: document.getElementById('btnShotAll'),
  btnRenderMp4: document.getElementById('btnRenderMp4'),

  // Music Panel
  audioInput: document.getElementById('audioInput'),
  audioName: document.getElementById('audioName'),
  btnClearAudio: document.getElementById('btnClearAudio'),
  musicStart: document.getElementById('musicStart'),
  musicWindowLabel: document.getElementById('musicWindowLabel'),
  fadeIn: document.getElementById('fadeIn'),
  fadeInVal: document.getElementById('fadeInVal'),
  fadeOut: document.getElementById('fadeOut'),
  fadeOutVal: document.getElementById('fadeOutVal'),
  volume: document.getElementById('volume'),
  btnPreviewMusic: document.getElementById('btnPreviewMusic'),
  btnStopMusic: document.getElementById('btnStopMusic'),
  audioFlash: document.getElementById('audioFlash'),

  // Canvas Inner Elements
  hookDisplayQ1: document.getElementById('hook-display-q1'),
  hookDisplayA1: document.getElementById('hook-display-a1'),
  hookDisplayQ2: document.getElementById('hook-display-q2'),
  promptQ1: document.getElementById('prompt-q1'),
  promptQ2: document.getElementById('prompt-q2'),
  answerQ1Display: document.getElementById('answer-q1-display'),
  explanationQ1Display: document.getElementById('explanation-q1-display'),
  
  frame2ImgContainer: document.getElementById('frame-2-img-container'),
  frame2Img: document.getElementById('frame-2-img'),
  frame2TextPuzzle: document.getElementById('frame-2-text-puzzle'),
  
  frame3ImgContainer: document.getElementById('frame-3-img-container'),
  frame3Img: document.getElementById('frame-3-img'),
  frame3TextPuzzle: document.getElementById('frame-3-text-puzzle'),
  
  frame4ImgContainer: document.getElementById('frame-4-img-container'),
  frame4Img: document.getElementById('frame-4-img'),
  frame4TextPuzzle: document.getElementById('frame-4-text-puzzle'),
  
  frame2OptionsContainer: document.getElementById('frame-2-options-container'),
  frame4OptionsContainer: document.getElementById('frame-4-options-container'),
  commentBaitIndicator: document.getElementById('comment-bait-indicator'),

  // WASM / Progress
  progressSection: document.getElementById('progress-section'),
  progressBar: document.getElementById('progress-bar'),
  progressText: document.getElementById('progress-text'),
  exportStatus: document.getElementById('export-status'),
  exportFiles: document.getElementById('export-files')
};

// ── Initialization ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initDefaultDate();
  loadDailyPuzzle();
  generateInitialHooks();
  
  console.log("🔑 [IQ Spark Studio API Guide]");
  console.log("To enable Anthropic Claude Opus 4.8 API real-time search & generate, set your key in browser storage:");
  console.log("👉 localStorage.setItem('iqspark_claude_key', 'YOUR_CLAUDE_API_KEY')");
});

function initDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  elements.datePick.value = today;
}

// True when neither question was shown before AND the two questions differ.
function isFreshPair(p) {
  if (!p || !p.q1 || !p.q2) return false;
  const s1 = puzzleSignature(p.q1);
  const s2 = puzzleSignature(p.q2);
  return s1 !== s2 && !isAlreadySeen(s1) && !isAlreadySeen(s2);
}

// Load daily logic puzzle. Prefers Claude Opus 4.8 and NEVER silently degrades to the offline
// pool just because a puzzle repeated: on a repeat it re-calls Claude with a varied seed to get
// a genuinely different puzzle. Offline is a true last resort (Claude unreachable) only.
async function loadDailyPuzzle(navigateToQuestion = false) {
  // Never regenerate underneath a running auto-play/countdown — that leaves the timer frozen.
  if (state.isPlayingAutoPlay) stopAutoPlay(state, elements, stopAudioPreview);

  const dateStr = elements.datePick.value || new Date().toISOString().split('T')[0];
  const seed = `${dateStr}_offset_${state.shuffleOffset}`;

  // Daily CTA rotation based on Date seed!
  const dailyCta = getDailyCTA(dateStr);
  state.cta = dailyCta;
  state.hookText = dailyCta.topHook;
  elements.hookCurrent.textContent = state.hookText;

  state.captionText = `Can you solve BOTH puzzles? 🧩\nQ1 answer revealed! Q2 answer in comments 👇\n\n#IQTest #BrainTeaser #MensaChallenge`;

  // UI Feedback
  elements.framePlaceholder.innerHTML = `<span class="placeholder-icon">🤖</span><p>Generating high-IQ logical puzzle<br/>via Claude Opus 4.8 API...</p>`;
  setGenSource('loading');

  let puzzle = null;
  let lastErr = null;
  // Attempt 0 uses the date seed (stable daily puzzle). If that content was already shown
  // (e.g. a same-date reload), retries use a randomized seed so Claude returns a different,
  // non-repeating puzzle. Any successful Claude call is kept — we only leave Claude if it throws.
  for (let attempt = 0; attempt < 4; attempt++) {
    const trySeed = attempt === 0 ? seed : `${seed}_r${attempt}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      const p = await fetchClaudeDailyPuzzle(trySeed);
      puzzle = p; // latest Claude candidate
      if (isFreshPair(p) || attempt === 3) break;
    } catch (err) {
      lastErr = err;
      console.warn('⚠️ Claude fetch failed — falling back to offline. Reason:', err.message);
      break; // keep any earlier Claude candidate; if none, offline below
    }
  }

  let source;
  if (puzzle) {
    source = 'claude';
    console.log('✨ Daily puzzle generated live via Claude Opus 4.8 API!', puzzle);
  } else {
    // Offline last resort — pick a non-repeating numerical+matrix pair from the cleaned pool.
    for (let i = 0; i < 40; i++) {
      puzzle = generateLocalSeededPuzzle(i === 0 ? seed : `${seed}_off${i}`);
      if (isFreshPair(puzzle)) break;
    }
    source = 'offline';
  }

  state.dailyPuzzle = puzzle;
  setGenSource(source, lastErr);

  markAsSeen(puzzleSignature(puzzle.q1));
  markAsSeen(puzzleSignature(puzzle.q2));

  // Trigger initial frame generation using frame-renderer
  generateFrames(state, elements, updateStepLabel);

  if (navigateToQuestion) {
    // Auto-focus slide to Question 1 (Frame 2) so user sees the newly generated puzzle instantly!
    state.currentFrame = state.firstFrame;
    for (let i = state.firstFrame; i <= state.totalFrames; i++) {
      document.getElementById(`frame-${i}`).hidden = i !== state.firstFrame;
    }
    updateStepLabel(state, elements);
  }
}

async function generateInitialHooks() {
  try {
    const hooks = await fetchClaudeTopHooks('any', 5);
    renderHooks(hooks);
  } catch (err) {
    console.warn("⚠️ Claude BGM Hooks fetch failed. Using local templates fallback:", err.message);
    const hooks = HookAgent.generate('any', 5);
    renderHooks(hooks);
  }
}


// ── Event Handlers ──────────────────────────────────
function setupEventListeners() {
  // New Set / Date Change / History Reset
  elements.btnNew.addEventListener('click', () => {
    // Clear both override paths so they don't block the newly generated question preview!
    clearPriorityUpload(0);
    clearPriorityUpload(1);
    resetReplaceSectionFields('q1', 'New question set — override cleared.');
    resetReplaceSectionFields('q2', 'New question set — override cleared.');

    state.shuffleOffset++;
    hintAddMusicIfMissing();
    loadDailyPuzzle(true); // 👈 Pass true to slide to Q1 instantly!
  });

  elements.datePick.addEventListener('change', () => {
    state.shuffleOffset = 0;
    loadDailyPuzzle(true); // 👈 Pass true to slide to Q1 instantly!
  });

  elements.btnResetHistory.addEventListener('click', () => {
    localStorage.removeItem('iqspark_seen_v2');
    localStorage.removeItem('iqspark_seen_v1'); // clear legacy id-based history too
    alert("Never-repeat signature history cleared successfully! 🧹");
  });

  // Attach Puzzle Images (Step 1)
  elements.apFile0.addEventListener('change', (e) => handleImageUpload(e, 0));
  elements.apFile1.addEventListener('change', (e) => handleImageUpload(e, 1));
  
  elements.apClear0.addEventListener('click', () => clearPriorityUpload(0));
  elements.apClear1.addEventListener('click', () => clearPriorityUpload(1));

  // Hook generator - Claude Opus 4.8 Real-time integration
  elements.btnGenHooks.addEventListener('click', async () => {
    const style = elements.hookStyle.value;
    
    // UI loading visual response
    elements.hookResults.innerHTML = `<span class="loading-vision" style="font-size: 12px; font-weight: 700; color: var(--brand);">🤖 Generating hooks via Claude Opus 4.8...</span>`;
    
    try {
      const hooks = await fetchClaudeTopHooks(style, 5);
      renderHooks(hooks);
    } catch (err) {
      console.warn("⚠️ Claude BGM Hooks fetch failed. Using local templates fallback:", err.message);
      const hooks = HookAgent.generate(style, 5);
      renderHooks(hooks);
    }
  });

  elements.btnApplyCustomHook.addEventListener('click', () => {

    const val = elements.hookCustom.value.trim();
    if (val) {
      state.hookText = val;
      elements.hookCurrent.textContent = val;
      updateHookDisplays(state, elements);
    }
  });

  // Custom Override Q1/Q2 Actions (manual equation puzzle only —
  // image insertion is handled by the "Attach Puzzle Images" Vision path,
  // which extracts the puzzle into the template instead of pasting a raw image).
  elements.btnApplyCustomText0.addEventListener('click', () => applyCustomTextPuzzle('q1'));
  elements.btnResetCustom0.addEventListener('click', () => resetSingleOverride('q1'));

  elements.btnApplyCustomText1.addEventListener('click', () => applyCustomTextPuzzle('q2'));
  elements.btnResetCustom1.addEventListener('click', () => resetSingleOverride('q2'));

  // Playback & Navigation Controls (Modular Calls)
  elements.btnPlay.addEventListener('click', () => startAutoPlay(state, elements, playAudioPreview, stopAudioPreview, updateStepLabel));
  elements.btnStop.addEventListener('click', () => stopAutoPlay(state, elements, stopAudioPreview));
  elements.btnPrev.addEventListener('click', () => switchFrame(-1, state, elements, updateStepLabel));
  elements.btnNext.addEventListener('click', () => switchFrame(1, state, elements, updateStepLabel));
  elements.btnShot.addEventListener('click', () => saveCurrentFramePng(state, elements));
  elements.btnShotAll.addEventListener('click', () => exportAllZip(state, elements));
  elements.btnRenderMp4.addEventListener('click', () => renderVideo(state, elements, updateProgress));

  // Music Slider bindings
  elements.audioInput.addEventListener('change', handleAudioUpload);
  elements.btnClearAudio.addEventListener('click', clearAudioTrack);
  elements.musicStart.addEventListener('input', updateMusicSettings);
  elements.fadeIn.addEventListener('input', updateMusicSettings);
  elements.fadeOut.addEventListener('input', updateMusicSettings);
  elements.volume.addEventListener('input', updateMusicSettings);
  
  elements.btnPreviewMusic.addEventListener('click', playAudioPreview);
  elements.btnStopMusic.addEventListener('click', stopAudioPreview);
}

// ── Upload Handlers (Step 1 Priority Slots) ──────────
async function handleImageUpload(e, targetIdx) {
  const file = e.target.files[0];
  if (!file) return;
  
  const slot = targetIdx === 0 ? 'q1' : 'q2';
  const thumb = targetIdx === 0 ? elements.apThumb0 : elements.apThumb1;
  const clearBtn = targetIdx === 0 ? elements.apClear0 : elements.apClear1;
  
  // Show loading indicator
  thumb.classList.add('has-img');
  thumb.innerHTML = `<span class="loading-vision" style="font-size: 11px; font-weight: 700; color: var(--brand);">🤖 Extracting + QA…</span>`;
  clearBtn.style.display = 'inline-flex';
  hintAddMusicIfMissing();

  const reader = new FileReader();
  reader.onload = async (event) => {
    const dataUrl = event.target.result;
    
    // Extract base64 clean data (strip "data:image/png;base64," prefix)
    const base64Data = dataUrl.split(',')[1];
    
    try {
      // 1. Try to invoke Claude Vision API to parse logic and rebuild into template text/grid!
      const res = await fetchClaudeVisionRebuilder(base64Data, file.type);
      console.log(`🤖 Extracted custom slot ${slot} from image.`, res);

      // 2. Hand it to the revision sub-agent for a QA/completeness pass before it hits the template.
      let finalPuzzle = res;
      try {
        finalPuzzle = await fetchClaudeRevisePuzzle(res, 'Puzzle extracted from a user-uploaded screenshot; verify the rule, answer, and 4 options.');
        console.log(`✨ Revision agent polished slot ${slot}.`, finalPuzzle);
      } catch (revErr) {
        console.warn(`Revision agent skipped for slot ${slot} (using raw extraction):`, revErr.message);
      }

      state.customManager.setCustomRebuiltPuzzle(slot, finalPuzzle);

      // Update Thumbnail with a success checkmark
      thumb.innerHTML = `<div class="rebuilt-badge" style="position:absolute; top: 8px; left: 8px; background: var(--brand-2); padding: 4px 8px; font-size: 10px; border-radius: 4px; font-weight: 800; color: #fff;">✅ Rebuilt + QA</div><img src="${dataUrl}" style="opacity: 0.35; width: 100%; height: 100%; object-fit: contain;" />`;
    } catch (err) {
      // 2. Safe Fallback: If API fails, build manual template puzzle instantly instead of showing raw image!
      console.warn("⚠️ Vision reconstruction failed. Inserting fallback template rule. Reason:", err.message);
      
      const prompt = targetIdx === 0 ? elements.apPrompt0.value : elements.apPrompt1.value;
      const choices = targetIdx === 0 ? elements.apChoices0.value : elements.apChoices1.value;
      buildManualTemplatePuzzle(slot, prompt, choices, targetIdx);
      
      // Show checkmark to indicate it was successfully rebuilt into our template style
      thumb.innerHTML = `<div class="rebuilt-badge" style="position:absolute; top: 8px; left: 8px; background: var(--gold); padding: 4px 8px; font-size: 10px; border-radius: 4px; font-weight: 800; color: #000;">⚡ Template</div><img src="${dataUrl}" style="opacity: 0.25; width: 100%; height: 100%; object-fit: contain;" />`;
    }
    
    // This slot's override now comes from the attached image — clear any stale
    // state left in the "Replace Question X" section so the two paths don't
    // silently fight over the same slot.
    resetReplaceSectionFields(slot, 'Using the attached puzzle image instead.');

    // Re-generate carousel preview frame visual cards
    generateFrames(state, elements, updateStepLabel);
  };
  reader.readAsDataURL(file);
}

// Help resolve custom inputs or fallback logic into clean text/grid template structures (No raw image rendering)
function buildManualTemplatePuzzle(slot, promptText, choicesStr, targetIdx) {
  // If prompt has equation characters (e.g. 10 + 1 = 11), map it as text equation rows!
  if (promptText && (promptText.includes('\n') || promptText.includes('='))) {
    state.customManager.setCustomRebuiltPuzzle(slot, {
      kind: 'text',
      type: 'text',
      prompt: targetIdx === 0 ? 'Can you solve this puzzle?' : 'Find the hidden logical rule.',
      options: choicesStr ? choicesStr.split(',').map(c => c.trim()) : ['A', 'B', 'C', 'D'],
      answer: choicesStr ? choicesStr.split(',')[0].trim() : 'A',
      explanation: 'Rebuilt based on manual equations.',
      equation: promptText
    });
  } else {
    // Else, pull clean matrix/series templates from local seeded pool and patch choices/answers
    const dateStr = elements.datePick.value || new Date().toISOString().split('T')[0];
    const seed = `${dateStr}_fallback_${slot}_offset_${state.shuffleOffset}`;
    const fallbackBase = generateLocalSeededPuzzle(seed)[slot];
    
    const userChoices = choicesStr ? choicesStr.split(',').map(c => c.trim()) : null;
    
    state.customManager.setCustomRebuiltPuzzle(slot, {
      kind: fallbackBase.kind || (fallbackBase.type === 'matrix' ? 'matrix' : fallbackBase.type === 'numerical' ? 'numerical' : 'text'),
      type: fallbackBase.type,
      prompt: promptText || fallbackBase.prompt,
      options: userChoices || fallbackBase.options,
      answer: userChoices ? userChoices[0] : fallbackBase.answer,
      explanation: fallbackBase.explanation,
      equation: fallbackBase.equation,
      matrixData: fallbackBase.matrixData,
      sequenceData: fallbackBase.sequenceData,
      analogyData: fallbackBase.analogyData
    });
  }
}


// DOM-only reset of the "Attach Your Puzzle Images" thumbnail/file input for one slot.
// Does NOT touch the override itself — used both by clearPriorityUpload (which does
// clear the override) and by the "Replace Question X" section when it takes over the
// same slot, so the two override paths never show a stale confirmation state at once.
function resetAttachSectionFields(targetIdx) {
  const thumb = targetIdx === 0 ? elements.apThumb0 : elements.apThumb1;
  thumb.classList.remove('has-img');
  thumb.innerHTML = `<i class="fa-regular fa-image"></i><span>No image</span>`;

  const fileInput = targetIdx === 0 ? elements.apFile0 : elements.apFile1;
  fileInput.value = '';

  const clearBtn = targetIdx === 0 ? elements.apClear0 : elements.apClear1;
  clearBtn.style.display = 'none';
}

function clearPriorityUpload(targetIdx) {
  resetAttachSectionFields(targetIdx);
  state.customManager.clearOverride(targetIdx === 0 ? 'q1' : 'q2');
  generateFrames(state, elements, updateStepLabel);
}


// ── Music Track Upload / Management ──────────────────
function handleAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  state.bgmFile = file;
  elements.audioName.textContent = file.name;
  elements.btnClearAudio.style.display = 'inline-flex';
  updateMusicSettings();
}

function clearAudioTrack() {
  state.bgmFile = null;
  elements.audioInput.value = '';
  elements.audioName.textContent = 'Upload your track (WAV/MP3)';
  elements.btnClearAudio.style.display = 'none';
  stopAudioPreview();
}

function updateMusicSettings() {
  state.audioSettings.startPoint = parseInt(elements.musicStart.value);
  state.audioSettings.fadeIn = parseFloat(elements.fadeIn.value);
  state.audioSettings.fadeOut = parseFloat(elements.fadeOut.value);
  state.audioSettings.volume = parseFloat(elements.volume.value);
  
  const start = state.audioSettings.startPoint;
  elements.musicWindowLabel.textContent = `Clip: ${start}s → ${start + 60}s (1 min) · fade-in ${state.audioSettings.fadeIn}s / fade-out ${state.audioSettings.fadeOut}s`;
  elements.fadeInVal.textContent = `${state.audioSettings.fadeIn}s`;
  elements.fadeOutVal.textContent = `${state.audioSettings.fadeOut}s`;
}

// ── BGM Audio Preview ────────────────────────────────
async function playAudioPreview() {
  if (state.isPlayingPreview) return;
  if (!state.bgmFile) {
    alert("Please upload a BGM track first.");
    return;
  }
  
  try {
    elements.btnPreviewMusic.disabled = true;
    elements.btnPreviewMusic.textContent = "Loading...";
    
    await state.audioProcessor.decodeFile(state.bgmFile);
    
    const audioBuffer = await state.audioProcessor.create60sClipBuffer(
      state.audioSettings.startPoint,
      state.audioSettings.volume,
      state.audioSettings.fadeIn,
      state.audioSettings.fadeOut
    );

    
    state.audioProcessor.initContext();
    const ctx = state.audioProcessor.audioCtx;
    
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(ctx.destination);
    
    sourceNode.start(0);
    state.previewSourceNode = sourceNode;
    state.isPlayingPreview = true;
    
    elements.btnPreviewMusic.style.display = 'none';
    elements.btnStopMusic.style.display = 'inline-flex';
    elements.btnPreviewMusic.disabled = false;
    elements.btnPreviewMusic.textContent = "Preview 1-min clip";
    elements.audioFlash.textContent = "Previewing music track live... 🎵";
    elements.audioFlash.style.opacity = '1';
  } catch (err) {
    alert("Audio preview failed: " + err.message);
    elements.btnPreviewMusic.disabled = false;
    elements.btnPreviewMusic.textContent = "Preview 1-min clip";
  }
}

function stopAudioPreview() {
  if (state.previewSourceNode) {
    try {
      state.previewSourceNode.stop();
    } catch (e) {}
    state.previewSourceNode = null;
  }
  state.isPlayingPreview = false;
  elements.btnPreviewMusic.style.display = 'inline-flex';
  elements.btnStopMusic.style.display = 'none';
  elements.audioFlash.style.opacity = '0';
}

// ── Custom Override Business Logic (Q1 & Q2 Split) ──
// Accepts ANY typed puzzle (equation grid, sequence, analogy, worded). A stacked-equation
// grid gets solved locally for speed; then the revision sub-agent (Claude Opus 4.8) verifies
// and normalizes it into the template. Non-equation input goes straight to the revision agent.
async function applyCustomTextPuzzle(slot) {
  const isQ1 = slot === 'q1';
  const prompt = isQ1 ? elements.customPrompt0.value : elements.customPrompt1.value;
  const rawText = (isQ1 ? elements.customText0.value : elements.customText1.value).trim();
  const msgEl = isQ1 ? elements.customMsg0 : elements.customMsg1;
  const applyBtn = isQ1 ? elements.btnApplyCustomText0 : elements.btnApplyCustomText1;

  if (!rawText) {
    alert("Please enter your puzzle first.");
    return;
  }

  // Fast local pass for stacked-equation puzzles (may not match — that's fine).
  const local = solveEquationPuzzle(rawText);

  // Draft handed to the revision agent.
  const draft = {
    kind: 'text',
    type: 'text',
    prompt: prompt || (local.success ? 'Can you solve this puzzle?' : 'Find the hidden logical rule.'),
    equation: rawText,
    options: [],
    answer: local.success ? String(local.answer) : '',
    explanation: local.success ? `Local rule candidate: ${local.ruleName}.` : ''
  };

  applyBtn.disabled = true;
  msgEl.textContent = '✨ Refining into the template via Claude Opus 4.8…';

  try {
    const context = local.success
      ? `User typed a stacked-equation puzzle. A local solver derived answer=${local.answer} using rule "${local.ruleName}". Verify and produce 4 real numeric options.`
      : `User typed a puzzle that is NOT a simple equation grid. Infer the intended rule and rebuild it cleanly.`;
    const revised = await fetchClaudeRevisePuzzle(draft, context);
    if (prompt) revised.prompt = prompt; // preserve the user's own prompt wording
    state.customManager.setCustomRebuiltPuzzle(slot, revised);
    msgEl.textContent = `✅ Applied (QA-verified). Answer: ${revised.answer}`;
  } catch (err) {
    console.warn('Revision agent unavailable for typed puzzle:', err.message);
    if (local.success) {
      // Offline / no-key fallback: keep the locally-solved equation puzzle.
      state.customManager.setCustomTextPuzzle(
        slot,
        prompt,
        rawText,
        local.answer,
        `Solved logic: ${local.ruleName}. Decoy row: ${local.decoy ? local.decoy.a + 'x' + local.decoy.b : 'none'}`
      );
      msgEl.textContent = `Applied (offline). Derived Answer: ${local.answer}`;
    } else {
      alert("Couldn't interpret this puzzle, and the revision agent is unavailable. Reason: " + local.error);
      msgEl.textContent = 'Could not interpret the puzzle (revision agent unavailable).';
      applyBtn.disabled = false;
      return;
    }
  }

  applyBtn.disabled = false;
  // This slot's override now comes from this section — clear a stale attached
  // image in the other section so it doesn't look like it's still active.
  resetAttachSectionFields(isQ1 ? 0 : 1);
  generateFrames(state, elements, updateStepLabel);
}

// DOM-only reset of the "Replace Question X with Your Own Puzzle" (manual equation) section
// for one slot. Does NOT touch the override itself — used both by resetSingleOverride (which
// does clear the override) and by the "Attach Your Puzzle Images" section when it takes over
// the same slot, so the two override paths never show a stale confirmation state at once.
function resetReplaceSectionFields(slot, message) {
  const isQ1 = slot === 'q1';
  if (isQ1) {
    elements.customPrompt0.value = '';
    elements.customText0.value = '';
    elements.customMsg0.textContent = message || 'Q1 reset to automatic.';
  } else {
    elements.customPrompt1.value = '';
    elements.customText1.value = '';
    elements.customMsg1.textContent = message || 'Q2 reset to automatic.';
  }
}

function resetSingleOverride(slot) {
  state.customManager.clearOverride(slot);
  resetReplaceSectionFields(slot);
  generateFrames(state, elements, updateStepLabel);
}

// ── Hook Generator Render ──
function renderHooks(hooks) {
  elements.hookResults.innerHTML = '';
  hooks.forEach(hook => {
    const el = document.createElement('button');
    el.className = 'hp-chip';
    el.textContent = hook;
    el.addEventListener('click', () => {
      state.hookText = hook;
      elements.hookCurrent.textContent = hook;
      updateHookDisplays(state, elements);
    });
    elements.hookResults.appendChild(el);
  });
}

// Helper to update progress of video rendering process
function updateProgress(percentage, text) {
  elements.progressBar.style.width = `${percentage}%`;
  elements.progressText.textContent = text;
}

// Maps a failed Claude call to a short, human reason shown on the offline badge.
function offlineReason(err) {
  const msg = ((err && (err.detail || err.message)) || '').toLowerCase();
  const status = err && err.status;
  if (/credit|billing|balance|quota/.test(msg)) return 'API credit too low';
  if (status === 401 || /api key|authentication|unauthor/.test(msg)) return 'invalid/missing API key';
  if (status === 429 || /rate limit|overloaded/.test(msg)) return 'rate limited';
  if (/key is missing|api key is missing/.test(msg)) return 'no API key set';
  return 'Claude unavailable';
}

// Reflects where the current puzzle set came from so the user always knows whether
// Claude Opus 4.8 actually produced it (live) or it fell back to the offline pool —
// and, on fallback, WHY (e.g. credit too low, bad key, rate limit).
function setGenSource(mode, err) {
  if (!elements.genSource) return;
  const map = {
    loading: { text: '⏳ Generating via Claude Opus 4.8…', color: 'var(--text-dim)' },
    claude:  { text: '✨ Live · Claude Opus 4.8', color: 'var(--green)' },
    offline: { text: `⚠️ Offline — ${offlineReason(err)}`, color: 'var(--gold)' }
  };
  const s = map[mode] || map.loading;
  elements.genSource.textContent = s.text;
  elements.genSource.style.color = s.color;
}

// Non-blocking nudge: puzzles are always generated with the uploaded track as BGM, so if the
// user generates (or attaches an image) before adding music, gently point them to Step 1.
function hintAddMusicIfMissing() {
  if (state.bgmFile || !elements.audioFlash) return;
  elements.audioFlash.textContent = '🎵 Tip: add music in Step 1 — it becomes the BGM in Auto-play & the MP4.';
  elements.audioFlash.style.opacity = '1';
  setTimeout(() => {
    if (!state.isPlayingPreview && !state.bgmFile) elements.audioFlash.style.opacity = '0';
  }, 4500);
}
