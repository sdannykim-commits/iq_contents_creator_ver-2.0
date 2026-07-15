// The question card must NEVER explain the puzzle's rule (that gives the answer away).
// Only the answer card carries the explanation. If a model returns a long, rule-revealing
// prompt, fall back to a short generic instruction per type.
function displayPrompt(q) {
  const generic = {
    numerical: 'Find the missing number.',
    matrix: 'Find the missing value in the grid.',
    analogy: 'Complete the analogy.',
    text: 'Solve for the missing value.'
  };
  const g = generic[q.type] || 'Find the missing value.';
  const p = (q.prompt || '').trim();
  // A short prompt (hook / user-typed CTA) is fine; anything long is a rule explanation → drop it.
  if (!p || p.length > 55) return g;
  return p;
}

// Updates hook text values across active preview frames
export function updateHookDisplays(state, elements) {
  elements.hookDisplayQ1.textContent = state.hookText;
  elements.hookDisplayQ2.textContent = state.hookText;
}

// Readability floor for the auto-fit scale — the puzzle never shrinks below this.
// Paired with content caps (iq-engine) so this floor is enough for any allowed content.
const MIN_FIT = 0.62;

// Auto-fits ONE visible frame so long content never pushes the options out of the fixed card:
//  • puzzle area (series/matrix/analogy/equation) is measured and scaled via --fit to fit the
//    available height, clamped to MIN_FIT (readability floor);
//  • long option values shrink a touch via --ofit;
//  • long answer explanations shrink via --rfit.
// The frame MUST be visible (not hidden) to measure — callers invoke this right after showing it.
export function fitFrame(frameId) {
  const frame = document.getElementById(`frame-${frameId}`);
  if (!frame || frame.hidden) return;

  const qd = frame.querySelector('.q-display');
  const puz = frame.querySelector('.eq-lines, .series, .matrix-grid, .analogy');
  if (qd && puz) {
    puz.style.setProperty('--fit', '1');            // measure at full size first
    // scrollHeight EXCLUDES the element's own vertical margins (e.g. .eq-lines has margin:20px 0),
    // so add them back — otherwise a puzzle can be measured ~40px short and overflow/clip a whole
    // row (the missing margin ≈ one equation line). Margins scale with --fit, measured here at 1.
    const cs = getComputedStyle(puz);
    const margins = (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
    const availH = qd.clientHeight;
    const availW = qd.clientWidth;
    const naturalH = puz.scrollHeight + margins;    // reading forces reflow → reflects --fit:1
    const naturalW = puz.scrollWidth;               // widest single-line row (eq-lines are nowrap)
    // Scale by BOTH axes so long rows (e.g. "12 + 8 = 104") shrink instead of clipping/wrapping,
    // and tall stacks shrink instead of overflowing. Use the tighter of the two ratios.
    const ratioH = naturalH > availH && availH > 0 ? availH / naturalH : 1;
    const ratioW = naturalW > availW && availW > 0 ? availW / naturalW : 1;
    const ratio = Math.min(ratioH, ratioW);
    const fit = ratio < 1 ? Math.max(MIN_FIT, ratio * 0.95) : 1; // 0.95 = small breathing room
    puz.style.setProperty('--fit', fit.toFixed(3));
  }

  // Options: numeric answers are short, but word/large-number options can be long → shrink a bit.
  const choices = frame.querySelector('.choices');
  if (choices) {
    const maxOpt = [...choices.querySelectorAll('.opt-val')]
      .reduce((m, e) => Math.max(m, (e.textContent || '').length), 0);
    choices.style.setProperty('--ofit', maxOpt > 10 ? '0.72' : maxOpt > 6 ? '0.85' : '1');
  }

  // Answer explanation box: shrink font for long explanations so it always fits.
  const reveal = frame.querySelector('.reveal-box');
  if (reveal) {
    const len = (reveal.textContent || '').length;
    reveal.style.setProperty('--rfit', len > 240 ? '0.72' : len > 160 ? '0.86' : '1');
  }
}

// Renders the overall 5-frame slideshow structure (Q1 → Answer 1 → Q2 → Comment → Final CTA)
export function generateFrames(state, elements, updateStepLabel) {
  // Guard: an override can be applied while the daily puzzle is still being fetched from
  // Claude. Bail out safely — loadDailyPuzzle re-runs generateFrames once the set arrives,
  // and the override is already stored in customManager, so it renders then.
  if (!state.cta || !state.dailyPuzzle) return;

  elements.framePlaceholder.style.display = 'none';
  elements.frameCanvasCard.style.display = 'flex';
  
  updateHookDisplays(state, elements);
  
  // Fetch Q1 & Q2
  const q1 = state.customManager.getQuestion('q1', state.dailyPuzzle.q1);
  const q2 = state.customManager.getQuestion('q2', state.dailyPuzzle.q2);
  
  // Render Frame 2 (Q1 Problem)
  elements.promptQ1.textContent = displayPrompt(q1);
  renderFrameQuestion(q1, elements.frame2ImgContainer, elements.frame2Img, elements.frame2TextPuzzle, elements.frame2OptionsContainer);
  
  // Render Frame 3 (A1 Answer Reveal) & Rotate Reveal Hook Copy!
  renderFrameQuestion(q1, elements.frame3ImgContainer, elements.frame3Img, elements.frame3TextPuzzle, null);
  elements.hookDisplayA1.textContent = state.cta.revealHook;
  elements.answerQ1Display.textContent = q1.answer;
  elements.explanationQ1Display.textContent = q1.explanation || '';

  // Render Frame 4 (Q2 Problem)
  elements.promptQ2.textContent = displayPrompt(q2);
  renderFrameQuestion(q2, elements.frame4ImgContainer, elements.frame4Img, elements.frame4TextPuzzle, elements.frame4OptionsContainer);
  
  // Check comment bait for Q2 & Rotate Engagement Line!
  const commBaitEl = document.querySelector('#frame-5 .comment-bait.big');
  if (commBaitEl) {
    commBaitEl.innerHTML = `<span>Mensa Logic Level</span>${state.cta.engageLine}`;
  }

  if (!q2.options || q2.options.length === 0) {
    elements.frame4OptionsContainer.style.display = 'none';
    elements.commentBaitIndicator.style.display = 'block';
    elements.commentBaitIndicator.textContent = state.cta.engageLine;
  } else {
    elements.frame4OptionsContainer.style.display = 'grid';
    elements.commentBaitIndicator.style.display = 'none';
  }

  // Render Frame 6 (Final CTA Copy Rotation!)
  const fcHead = document.querySelector('#frame-6 .fc-head');
  const fcSub = document.querySelector('#frame-6 .fc-sub');
  const fcBtn = document.querySelector('#frame-6 .fc-btn');
  const fcUrl = document.querySelector('#frame-6 .fc-url');
  
  if (fcHead) fcHead.innerHTML = state.cta.finalCTA.headline;
  if (fcSub) fcSub.textContent = state.cta.finalCTA.sub;
  if (fcBtn) {
    fcBtn.textContent = state.cta.finalCTA.button;
    fcBtn.href = `https://${state.cta.brandUrl}`;
  }
  if (fcUrl) fcUrl.textContent = state.cta.brandUrl;

  // Preserve current preview frame slide instead of resetting on update
  const targetFrame = state.currentFrame || state.firstFrame;
  for (let i = state.firstFrame; i <= state.totalFrames; i++) {
    document.getElementById(`frame-${i}`).hidden = i !== targetFrame;
  }
  state.currentFrame = targetFrame;
  updateStepLabel(state, elements);
  fitFrame(targetFrame); // auto-fit the visible frame after (re)rendering
}

// Draws one visual-matrix cell as an inline SVG shape (circle/square/diamond/triangle),
// with an optional fill (solid/outline/hatched) and a small corner dot (TL/TR/BL/BR).
// This is what makes uploaded VISUAL IQ matrices render as shapes instead of garbled text.
function shapeCellSvg(cell) {
  const V = '#8fa4ff';                 // shape stroke
  const R = '#ff5470';                 // corner dot
  const fillMap = { solid: V, hatched: 'rgba(143,164,255,0.30)', outline: 'none' };
  const fill = fillMap[(cell.fill || 'outline').toLowerCase()] || 'none';
  const sw = 3.5;
  let el;
  switch ((cell.shape || '').toLowerCase()) {
    case 'square':   el = `<rect x="10" y="10" width="28" height="28" rx="2" fill="${fill}" stroke="${V}" stroke-width="${sw}"/>`; break;
    case 'diamond':  el = `<rect x="11" y="11" width="26" height="26" transform="rotate(45 24 24)" fill="${fill}" stroke="${V}" stroke-width="${sw}"/>`; break;
    case 'triangle': el = `<polygon points="24,9 39,37 9,37" fill="${fill}" stroke="${V}" stroke-width="${sw}" stroke-linejoin="round"/>`; break;
    case 'circle':
    default:         el = `<circle cx="24" cy="24" r="14" fill="${fill}" stroke="${V}" stroke-width="${sw}"/>`;
  }
  const dp = { TL: [11, 11], TR: [37, 11], BL: [11, 37], BR: [37, 37] }[(cell.dot || '').toUpperCase()];
  const dot = dp ? `<circle cx="${dp[0]}" cy="${dp[1]}" r="4.5" fill="${R}"/>` : '';
  return `<svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">${el}${dot}</svg>`;
}

// Renders individual question data onto its respective DOM fields
export function renderFrameQuestion(q, imgCont, imgEl, txtEl, optCont) {
  // Force 100% template-based text/grid component rendering. Never output raw screenshot images!
  imgCont.style.display = 'none';
  txtEl.style.display = 'flex';

  // Render text-based equation lines if equation data is populated
  if (q.equation && q.equation.trim().length > 0) {
    txtEl.className = 'eq-lines';
    const rows = q.equation.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    txtEl.innerHTML = rows.map(r => `<div class="eq-line">${r}</div>`).join('');
  } 
  else {


    imgCont.style.display = 'none';
    txtEl.style.display = 'flex';
    
    if (q.type === 'matrix') {
      txtEl.className = 'matrix-grid';
      if (Array.isArray(q.matrixShapes) && q.matrixShapes.length >= 9) {
        // Visual shape matrix → render real SVG shapes (not text descriptions).
        txtEl.innerHTML = q.matrixShapes.slice(0, 9).map(cell => {
          const isQ = !cell || cell.shape === '?' || String(cell.shape || '').trim() === '';
          return `<div class="g ${isQ ? 'q' : ''} ${isQ ? '' : 'g-shape'}">${isQ ? '?' : shapeCellSvg(cell)}</div>`;
        }).join('');
      } else if (q.matrixData && q.matrixData.length > 0) {
        txtEl.innerHTML = q.matrixData.map(val => `<div class="g ${val === '?' ? 'q' : ''}">${val}</div>`).join('');
      } else {
        txtEl.innerHTML = `
          <div class="g">1</div><div class="g">2</div><div class="g">3</div>
          <div class="g">2</div><div class="g">4</div><div class="g">6</div>
          <div class="g">3</div><div class="g">6</div><div class="g g">?</div>
        `;
      }
    } else if (q.type === 'numerical' || q.type === 'sequence_reasoning') {
      txtEl.className = 'series';
      if (q.sequenceData && q.sequenceData.length > 0) {
        txtEl.innerHTML = q.sequenceData.map(val => `<div class="cell ${val === '?' ? 'q' : ''}">${val}</div>`).join('');
      } else {
        txtEl.innerHTML = `
          <div class="cell">2</div>
          <div class="cell">3</div>
          <div class="cell">5</div>
          <div class="cell">7</div>
          <div class="cell cell q">?</div>
        `;
      }
    } else if (q.type === 'analogy') {
      txtEl.className = 'analogy';
      if (q.analogyData && q.analogyData.length >= 4) {
        const d = q.analogyData;
        txtEl.innerHTML = `
          <div class="term">${d[0]}</div><div class="op">:</div><div class="term">${d[1]}</div>
          <div class="op">::</div>
          <div class="term">${d[2]}</div><div class="op">:</div><div class="term q">${d[3]}</div>
        `;
      } else {
        txtEl.innerHTML = `
          <div class="term">Sun</div><div class="op">:</div><div class="term">Day</div>
          <div class="op">::</div>
          <div class="term">Moon</div><div class="op">:</div><div class="term q">?</div>
        `;
      }
    } else {
      txtEl.className = 'eq-lines';
      txtEl.innerHTML = `<div class="eq-line" style="font-size: 20px;">[Algorithm: ${q.type}]</div>`;
    }
  }

  // Setup options (4 Choices grid)
  if (optCont) {
    if (q.options && q.options.length > 0) {
      optCont.style.display = 'grid';
      const choicesList = optCont.querySelectorAll('.choice');
      // optCont is only ever passed for the active question cards (frame-2 / frame-4),
      // so every rendered option gets the interactive tap feedback.
      q.options.forEach((opt, idx) => {
        const choiceEl = choicesList[idx];
        if (!choiceEl) return;

        choiceEl.className = 'choice';
        choiceEl.querySelector('.opt-val').textContent = opt;

        // Clone to drop any previous click listeners, then bind fresh feedback.
        const clonedEl = choiceEl.cloneNode(true);
        choiceEl.parentNode.replaceChild(clonedEl, choiceEl);
        clonedEl.addEventListener('click', () => {
          optCont.querySelectorAll('.choice').forEach(c => c.className = 'choice');
          clonedEl.classList.add('selected');
          clonedEl.classList.add(opt === q.answer ? 'correct' : 'wrong');
        });
      });
    } else {
      optCont.style.display = 'none';
    }
  }
}

