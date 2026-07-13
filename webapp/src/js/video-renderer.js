import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { fitFrame } from './frame-renderer';

// Captures every active frame (frames 2..6 — the intro frame was removed) as a PNG blob.
// Shows exactly one frame at a time (so frames don't stack in the capture) with its fade-in
// animation frozen (so html2canvas grabs it at full opacity, not mid-fade) on an opaque dark
// background. Restores the viewed frame afterwards. Returns [{ id, blob }] in play order.
async function captureFrameBlobs(elements, state) {
  const originalFrame = state.currentFrame || state.firstFrame;
  const captures = [];
  for (let i = state.firstFrame; i <= state.totalFrames; i++) {
    for (let k = state.firstFrame; k <= state.totalFrames; k++) {
      const fk = document.getElementById(`frame-${k}`);
      fk.hidden = k !== i;
      fk.style.animation = 'none';
    }
    const canvas = await html2canvas(elements.frameCanvasCard, { scale: 3, useCORS: true, backgroundColor: '#050816' });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    captures.push({ id: i, blob });
  }
  for (let k = state.firstFrame; k <= state.totalFrames; k++) {
    const fk = document.getElementById(`frame-${k}`);
    fk.hidden = k !== originalFrame;
    fk.style.animation = '';
  }
  return captures;
}

// Sets the countdown widget on a question frame to a specific second, so per-second captures
// animate the timer in the rendered video instead of freezing it on one value.
function setTimerVisual(frameId, secondsLeft, total) {
  const el = document.getElementById(`frame-${frameId}`);
  if (!el) return;
  const numEl = el.querySelector('.timer-num');
  const progEl = el.querySelector('.prog');
  if (numEl) numEl.textContent = String(secondsLeft);
  if (progEl) progEl.style.strokeDashoffset = String(264 * (total - secondsLeft) / total);
}

// Captures the full render timeline as an ordered list of { duration, blob } slides.
// Question frames (2 = Q1, 4 = Q2) are captured once PER SECOND with the countdown decremented,
// so the timer visibly ticks down in the video; the other frames are single static slides.
// One frame is shown at a time with its fade-in frozen, on an opaque dark background.
async function captureSlides(elements, state, updateProgress) {
  const originalFrame = state.currentFrame || state.firstFrame;
  const slides = [];

  const grab = async () => {
    const canvas = await html2canvas(elements.frameCanvasCard, { scale: 3, useCORS: true, backgroundColor: '#050816' });
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  };
  const showOnly = (frameId) => {
    for (let k = state.firstFrame; k <= state.totalFrames; k++) {
      const fk = document.getElementById(`frame-${k}`);
      fk.hidden = k !== frameId;
      fk.style.animation = 'none';
    }
  };

  // Ordered timeline. `count` = animate the countdown for that many seconds (1 slide/sec);
  // `duration` = a single static slide held for that many seconds.
  const plan = [
    { frame: 2, count: state.timings.p1 },    // Q1 countdown
    { frame: 3, duration: state.timings.a1 },  // Answer 1
    { frame: 4, count: state.timings.p2 },     // Q2 countdown
    { frame: 5, duration: state.timings.comm }, // Comment CTA
    { frame: 6, duration: state.timings.cta }   // Final CTA
  ];

  const totalCaptures = plan.reduce((n, s) => n + (s.count || 1), 0);
  let done = 0;

  for (const step of plan) {
    showOnly(step.frame);
    fitFrame(step.frame); // auto-fit this frame's content before capturing
    if (step.count) {
      for (let s = step.count; s >= 1; s--) {
        setTimerVisual(step.frame, s, step.count);
        slides.push({ duration: 1, blob: await grab() });
        done++;
        if (updateProgress) updateProgress(30 + Math.round(50 * done / totalCaptures), `Capturing frames… (${done}/${totalCaptures})`);
      }
    } else {
      slides.push({ duration: step.duration, blob: await grab() });
      done++;
      if (updateProgress) updateProgress(30 + Math.round(50 * done / totalCaptures), `Capturing frames… (${done}/${totalCaptures})`);
    }
  }

  // Restore the view + reset the question timers to their full value.
  setTimerVisual(2, state.timings.p1, state.timings.p1);
  setTimerVisual(4, state.timings.p2, state.timings.p2);
  for (let k = state.firstFrame; k <= state.totalFrames; k++) {
    const fk = document.getElementById(`frame-${k}`);
    fk.hidden = k !== originalFrame;
    fk.style.animation = '';
  }
  return slides;
}

// Captures current single frame and downloads as PNG
export async function saveCurrentFramePng(state, elements) {
  try {
    const canvas = await html2canvas(elements.frameCanvasCard, { scale: 3, useCORS: true, backgroundColor: '#050816' });
    const url = canvas.toDataURL('image/png');
    const today = elements.datePick.value || new Date().toISOString().split('T')[0];
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `iqspark_${today}_frame_${state.currentFrame}.png`;
    a.click();
  } catch (err) {
    alert("PNG capture failed: " + err.message);
  }
}

// Compiles portrait 1080x1920 MP4 Video using ffmpeg.wasm
export async function renderVideo(state, elements, updateProgress) {
  elements.btnRenderMp4.disabled = true;
  elements.progressSection.hidden = false;
  elements.progressBar.style.width = '0%';
  updateProgress(10, 'Initializing FFmpeg.wasm...');
  
  try {
    if (!state.ffmpeg) {
      state.ffmpeg = new FFmpeg();
      await state.ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
      });
    }

    updateProgress(30, 'Capturing animated frames (html2canvas)...');

    // Question frames are captured once per second so the countdown timer actually ticks.
    const slides = await captureSlides(elements, state, updateProgress);

    // Write every slide to the virtual file system as f000.png, f001.png, …
    for (let i = 0; i < slides.length; i++) {
      await state.ffmpeg.writeFile(`f${String(i).padStart(3, '0')}.png`, await fetchFile(slides[i].blob));
    }
    
    updateProgress(60, 'Processing BGM Audio...');
    let hasAudio = false;
    if (state.bgmFile) {
      try {
        await state.audioProcessor.decodeFile(state.bgmFile);
        const audioBuffer = await state.audioProcessor.create60sClipBuffer(
          state.audioSettings.startPoint,
          state.audioSettings.volume,
          state.audioSettings.fadeIn,
          state.audioSettings.fadeOut
        );
        
        const wavBlob = audioBufferToWav(audioBuffer);
        await state.ffmpeg.writeFile('bgm.wav', await fetchFile(wavBlob));
        hasAudio = true;
      } catch (err) {
        console.error("Audio conversion failed:", err);
      }
    }
    
    updateProgress(82, 'Compiling video (FFmpeg)...');

    // Concat every slide with its duration (question frames = 1s each, so the timer animates).
    // Total = 24 + 6 + 24 + 2 + 4 = 60s. Repeat the last file so its duration is honored.
    const slidesTxt = slides
      .map((s, i) => `file f${String(i).padStart(3, '0')}.png\nduration ${s.duration}`)
      .join('\n') + `\nfile f${String(slides.length - 1).padStart(3, '0')}.png`;

    await state.ffmpeg.writeFile('slides.txt', slidesTxt);
    
    // Render video. Constant 30fps + a keyframe every second (-g 30 + forced keyframes) so the
    // MP4 is smoothly seekable — without this, x264 emitted only ~2 keyframes for the whole clip
    // and scrubbing snapped back to the start (looked like a frozen timer / wrong question).
    const audioArgs = hasAudio ? ['-i', 'bgm.wav', '-c:a', 'aac', '-shortest'] : [];
    await state.ffmpeg.exec([
      '-f', 'concat', '-safe', '0', '-i', 'slides.txt',
      ...audioArgs,
      '-vsync', 'vfr', '-pix_fmt', 'yuv420p', '-c:v', 'libx264',
      '-g', '30', '-keyint_min', '30', '-force_key_frames', 'expr:gte(t,n_forced)',
      '-vf', 'scale=1080:1920', '-r', '30', 'portrait.mp4'
    ]);
    
    const videoData = await state.ffmpeg.readFile('portrait.mp4');
    const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
    // Free the previous render's blob URL (the current one stays alive for the Save Video button).
    if (state.lastVideoUrl) { try { URL.revokeObjectURL(state.lastVideoUrl); } catch (e) {} }
    const url = URL.createObjectURL(videoBlob);
    state.lastVideoUrl = url;

    const today = elements.datePick.value || new Date().toISOString().split('T')[0];
    const subdir = today.replace(/-/g, ''); // yyyymmdd dated folder
    const filename = `iqspark_${today}_shorts.mp4`;

    // Under `npm run dev`, drop the file straight into webapp/output/<yyyymmdd>/ (no download
    // dialog) and save Q2's answer + explanation beside it (Q2 goes in the pinned comment).
    // In a production build (no dev server / fs) fall back to a normal browser download.
    let savedTo = null;
    if (import.meta.env.DEV) {
      try {
        updateProgress(95, `Saving to output/${subdir}/ …`);
        const resp = await fetch('/api/save-render', {
          method: 'POST',
          headers: { 'content-type': 'application/octet-stream', 'x-filename': filename, 'x-subdir': subdir },
          body: videoBlob
        });
        const j = await resp.json();
        if (j.ok) savedTo = j.path;
        else throw new Error(j.error || 'unknown error');

        // Q2 answer + explanation for the pinned comment.
        try {
          const q2 = state.customManager.getQuestion('q2', state.dailyPuzzle.q2);
          await fetch('/api/save-render', {
            method: 'POST',
            headers: { 'content-type': 'text/plain; charset=utf-8', 'x-filename': 'q2_pinned_comment.txt', 'x-subdir': subdir },
            body: buildQ2CommentText(today, q2)
          });
        } catch (e2) {
          console.warn('Q2 pinned-comment file save failed:', e2.message);
        }
      } catch (e) {
        console.warn('Auto-save to output/ failed, falling back to download:', e.message);
      }
    }

    if (!savedTo) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }

    updateProgress(100, savedTo
      ? `Saved to ${savedTo} 🎬`
      : 'Video Compiled and Downloaded Successfully! 🎬');

    elements.exportStatus.hidden = false;
    elements.exportFiles.innerHTML = `
      <div class="export-file-item">
        <span class="export-file-name">${savedTo || filename}</span>
        <span class="export-file-size">${(videoBlob.size / 1024 / 1024).toFixed(2)} MB</span>
        <button class="export-file-btn" onclick="window.open('${url}')">Save Video</button>
      </div>
    `;
  } catch (err) {
    console.error(err);
    updateProgress(0, `Render failed: ${err.message}`);
  } finally {
    elements.btnRenderMp4.disabled = false;
  }
}

// Packages all 5 frames + metadata text file into a ZIP archive
export async function exportAllZip(state, elements) {
  const zip = new JSZip();
  const today = elements.datePick.value || new Date().toISOString().split('T')[0];

  const captures = await captureFrameBlobs(elements, state);
  captures.forEach(({ blob }, idx) => {
    zip.file(`IQSpark_Desktop/${today}/iqspark_${today}_frame_${idx + 1}.png`, blob);
  });

  const metaTxt = `
===================================================
IQ Spark Studio v2.0 - Platform Metadata
Date: ${today}
===================================================

[Scroll-stopping Hook (Q1)]
${state.hookText}

[Description & Caption (All platforms)]
${state.captionText}

---------------------------------------------------
Save all frames in "Downloads/IQSpark_Desktop/${today}/"
Assemble PNG frames + music track inside your video editor.
===================================================
`.trim();

  zip.file(`IQSpark_Desktop/${today}/metadata_copy.txt`, metaTxt);
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `iqspark_desktop_export_${today}.zip`;
  a.click();
}

// Renders Q2's puzzle values as a one-line string for the pinned-comment note.
function puzzleToText(q) {
  if (q.equation) return q.equation.replace(/\n/g, '  |  ');
  if (q.sequenceData && q.sequenceData.length) return q.sequenceData.join(', ');
  if (q.matrixData && q.matrixData.length) {
    const m = q.matrixData;
    return [m.slice(0, 3), m.slice(3, 6), m.slice(6, 9)].map(r => r.join(' ')).join('  /  ');
  }
  if (q.analogyData && q.analogyData.length) return q.analogyData.join(' ');
  return '';
}

// Builds the pinned-comment text file for Question 2 (answer + explanation only).
function buildQ2CommentText(today, q2) {
  const opts = (q2.options || []).join('  /  ');
  return [
    `IQ SPARK — Daily IQ Challenge · ${today}`,
    `Question 2 / 2 (pinned comment)`,
    ``,
    `Puzzle:  ${puzzleToText(q2)}`,
    opts ? `Options: ${opts}` : ``,
    ``,
    `✅ Answer: ${q2.answer}`,
    `💡 Explanation: ${q2.explanation || ''}`,
    ``
  ].filter(l => l !== null && l !== undefined).join('\n');
}

// Convert AudioBuffer to WAV format helper
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferArr = new ArrayBuffer(length),
        view = new DataView(bufferArr),
        channels = [], sampleRate = buffer.sampleRate;
        
  let offset = 0, pos = 0;

  function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * numOfChan * 2);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([bufferArr], { type: 'audio/wav' });
}
