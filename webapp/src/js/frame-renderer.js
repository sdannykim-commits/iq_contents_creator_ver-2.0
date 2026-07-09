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
  elements.hookDisplayIntro.textContent = state.hookText;
  elements.hookDisplayQ1.textContent = state.hookText;
  elements.hookDisplayQ2.textContent = state.hookText;
}

// Renders the overall 6-frame slideshow structure
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

  // Preserve current preview frame slide instead of resetting to 1 on update
  const targetFrame = state.currentFrame || 1;
  for (let i = 1; i <= 6; i++) {
    document.getElementById(`frame-${i}`).hidden = i !== targetFrame;
  }
  state.currentFrame = targetFrame;
  updateStepLabel(state, elements);
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
      if (q.matrixData && q.matrixData.length > 0) {
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
      q.options.forEach((opt, idx) => {
        const choiceEl = choicesList[idx];
        if (choiceEl) {
          // Reset styling state
          choiceEl.className = 'choice';
          choiceEl.querySelector('.opt-val').textContent = opt;
          
          // Mark correct choice visually on reveal frames (Frame 3 A1, etc.)
          const isAnswer = opt === q.answer;
          const isRevealFrame = !optCont.id.includes('frame-2') && !optCont.id.includes('frame-4');
          if (isAnswer && isRevealFrame) {
            choiceEl.classList.add('correct');
          }

          // Interactive click listener (only on active questions, not reveal frames)
          if (!isRevealFrame) {
            // Remove previous listeners (cloning node avoids duplicate bindings)
            const clonedEl = choiceEl.cloneNode(true);
            choiceEl.parentNode.replaceChild(clonedEl, choiceEl);
            
            clonedEl.addEventListener('click', () => {
              // Clear previous selection states in this container
              optCont.querySelectorAll('.choice').forEach(c => c.className = 'choice');
              
              clonedEl.classList.add('selected');
              if (opt === q.answer) {
                clonedEl.classList.add('correct');
              } else {
                clonedEl.classList.add('wrong');
              }
            });
          }
        }
      });
    } else {
      optCont.style.display = 'none';
    }
  }
}

