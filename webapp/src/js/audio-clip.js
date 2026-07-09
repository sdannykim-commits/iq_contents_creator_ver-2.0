export class AudioClipProcessor {
  constructor() {
    this.audioCtx = null;
    this.audioBuffer = null;
  }

  initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  async decodeFile(file) {
    this.initContext();
    const arrayBuffer = await file.arrayBuffer();
    // Decode audio file to AudioBuffer
    this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    return this.audioBuffer;
  }

  // Create a 60-second slice with fade-in and fade-out starting from a specific offset
  create60sClipBuffer(startTime = 0, volume = 0.35, fadeInDuration = 1.0, fadeOutDuration = 2.0) {
    if (!this.audioBuffer) throw new Error("No audio buffer decoded yet.");

    const sampleRate = this.audioBuffer.sampleRate;
    const targetDuration = 60; // 60 seconds
    const totalSamples = sampleRate * targetDuration;
    const channels = this.audioBuffer.numberOfChannels;

    // Create a new AudioBuffer for 60 seconds
    const offlineCtx = new OfflineAudioContext(channels, totalSamples, sampleRate);
    
    // Create source node
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = this.audioBuffer;
    bufferSource.loop = true; // Loop if source is shorter than 60s

    // Create gain node for volume and fades
    const gainNode = offlineCtx.createGain();
    
    // Set baseline volume control
    gainNode.gain.setValueAtTime(0, 0);
    // Fade in
    gainNode.gain.linearRampToValueAtTime(volume, fadeInDuration);
    // Keep constant volume
    gainNode.gain.setValueAtTime(volume, targetDuration - fadeOutDuration);
    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, targetDuration);

    // Connections
    bufferSource.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    // Start playback from the designated startTime offset (in seconds)
    bufferSource.start(0, startTime);

    // Render the 60-second audio
    return offlineCtx.startRendering();
  }
}

