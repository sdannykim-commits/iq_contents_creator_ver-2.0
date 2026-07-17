import { fitFrame } from './frame-renderer';

// Global timer interval reference inside this module scope
let currentTimerInterval = null;

// Switches the carousel slides visually (Prev / Next)
export function switchFrame(direction, state, elements, updateStepLabel) {
  const newFrame = state.currentFrame + direction;
  if (newFrame < state.firstFrame || newFrame > state.totalFrames) return;

  document.getElementById(`frame-${state.currentFrame}`).hidden = true;
  document.getElementById(`frame-${newFrame}`).hidden = false;
  state.currentFrame = newFrame;

  fitFrame(newFrame); // auto-fit the newly shown frame
  updateStepLabel(state, elements);

  // Re-start or reset countdown timer for the newly switched frame
  startTimerForFrame(state.currentFrame, elements, state);
}

// Synchronizes playback status indicators and step dots
export function updateStepLabel(state, elements) {
  // Flow runs over frames 2..6, shown to the user as steps 1..5.
  const labels = [
    '1/5 · Question 1',
    '2/5 · Answer 1',
    '3/5 · Question 2',
    '4/5 · Comment CTA',
    '5/5 · Final CTA'
  ];
  const idx = state.currentFrame - state.firstFrame;
  elements.stepLabel.textContent = labels[idx];

  elements.btnPrev.disabled = state.currentFrame === state.firstFrame;
  elements.btnNext.disabled = state.currentFrame === state.totalFrames;

  // Sync step dots
  const dots = elements.steps.querySelectorAll('.s');
  dots.forEach((dot, i) => {
    if (i === idx) {
      dot.classList.add('on');
    } else {
      dot.classList.remove('on');
    }
  });
}

// Starts auto-play sequence with Web Audio BGM and hardcoded 60s timelines
export function startAutoPlay(state, elements, playAudioPreview, stopAudioPreview, updateStepLabel) {
  if (state.isPlayingAutoPlay) return;
  
  state.isPlayingAutoPlay = true;
  elements.btnPlay.disabled = true;
  
  if (state.bgmFile) {
    try {
      playAudioPreview();
    } catch (e) {
      console.warn("Audio preview playback error: ", e);
    }
  }


  // Timelines totaling exactly 60 seconds (no intro — starts on Q1)
  const timeline = [
    { frame: 2, duration: state.timings.p1 * 1000 },
    { frame: 3, duration: state.timings.a1 * 1000 },
    { frame: 4, duration: state.timings.p2 * 1000 },
    { frame: 5, duration: state.timings.comm * 1000 },
    { frame: 6, duration: state.timings.cta * 1000 }
  ];

  let currentStep = 0;
  
  function nextStep() {
    if (!state.isPlayingAutoPlay) return;
    
    if (currentStep >= timeline.length) {
      stopAutoPlay(state, elements, stopAudioPreview);
      return;
    }

    const step = timeline[currentStep];
    for (let i = state.firstFrame; i <= state.totalFrames; i++) {
      document.getElementById(`frame-${i}`).hidden = i !== step.frame;
    }
    state.currentFrame = step.frame;
    fitFrame(step.frame); // auto-fit the newly shown frame
    updateStepLabel(state, elements);

    // Trigger timer countdown logic for this frame step
    startTimerForFrame(step.frame, elements, state);

    currentStep++;
    state.autoPlayTimer = setTimeout(nextStep, step.duration);
  }

  nextStep();
}

// Halts auto-play sequence and stops music
export function stopAutoPlay(state, elements, stopAudioPreview) {
  state.isPlayingAutoPlay = false;
  elements.btnPlay.disabled = false;
  
  if (state.autoPlayTimer) {
    clearTimeout(state.autoPlayTimer);
    state.autoPlayTimer = null;
  }
  
  // Safe stop countdown timer
  clearCountdownTimer(elements, state);
  stopAudioPreview();
}

// Starts the circular timer countdown for active question frames (Frame 2 & 4).
// Duration comes from state.timings.p1 / p2 — the same values that drive the
// actual auto-play frame advance — so the visible countdown never drifts from
// when the slide really changes.
export function startTimerForFrame(frameId, elements, state) {
  // Clear any existing active timer first
  clearCountdownTimer(elements, state);

  const isActiveQuestion = (frameId === 2 || frameId === 4);
  if (!isActiveQuestion) return;

  const durationSec = frameId === 2 ? state.timings.p1 : state.timings.p2;

  const activeFrameEl = document.getElementById(`frame-${frameId}`);
  if (!activeFrameEl) return;

  const timerNumEl = activeFrameEl.querySelector('.timer-num');
  const progCircleEl = activeFrameEl.querySelector('.prog');

  if (!timerNumEl || !progCircleEl) return;

  let timeLeft = durationSec;
  timerNumEl.textContent = timeLeft;
  progCircleEl.style.strokeDashoffset = '0'; // reset ring to full

  currentTimerInterval = setInterval(() => {
    timeLeft--;
    // Stop at 1 (never display 0) so the preview matches the MP4 countdown exactly: the
    // question shows 24 → 1 and transitions to the answer the moment time is up.
    if (timeLeft < 1) {
      clearInterval(currentTimerInterval);
      currentTimerInterval = null;
      return;
    }

    // Update seconds number
    timerNumEl.textContent = timeLeft;

    // Update SVG Circle dash offset gauge (Circumference is 264px)
    const offset = 264 * (durationSec - timeLeft) / durationSec;
    progCircleEl.style.strokeDashoffset = offset;
  }, 1000);
}

// Helper to safely clear active countdown timers and reset visual rings
function clearCountdownTimer(elements, state) {
  if (currentTimerInterval) {
    clearInterval(currentTimerInterval);
    currentTimerInterval = null;
  }

  // Reset SVG circles of both Q1 (Frame 2) and Q2 (Frame 4) to clean default states
  [{ frameId: 2, duration: state.timings.p1 }, { frameId: 4, duration: state.timings.p2 }].forEach(({ frameId, duration }) => {
    const el = document.getElementById(`frame-${frameId}`);
    if (el) {
      const timerNumEl = el.querySelector('.timer-num');
      const progCircleEl = el.querySelector('.prog');
      if (timerNumEl) timerNumEl.textContent = String(duration);
      if (progCircleEl) progCircleEl.style.strokeDashoffset = '0';
    }
  });
}
