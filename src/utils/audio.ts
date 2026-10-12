class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aquasort_muted');
      this.isMuted = saved === 'true';
    }
  }

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aquasort_muted', this.isMuted.toString());
    }
    return this.isMuted;
  }

  /**
   * Delicate glass clink sound when selecting or deselecting a vial
   */
  public playClink(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(800 * pitchMultiplier, now + 0.12);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(2800 * pitchMultiplier, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 0.2);
    oscHarmonic.stop(now + 0.2);
  }

  /**
   * Realistic pouring water stream with fluid bubbling drops
   */
  public playPour(duration: number = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Filtered noise for water splash
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + duration);
    filter.Q.value = 4.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);

    // Bubbly tone droplets (water glug glug)
    const bubbleCount = Math.floor(duration * 6);
    for (let i = 0; i < bubbleCount; i++) {
      const bubbleTime = now + (i / bubbleCount) * duration;
      const osc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 400 + Math.random() * 300 + i * 80;
      osc.frequency.setValueAtTime(baseFreq, bubbleTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, bubbleTime + 0.08);

      bGain.gain.setValueAtTime(0.15, bubbleTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, bubbleTime + 0.08);

      osc.connect(bGain);
      bGain.connect(this.ctx.destination);

      osc.start(bubbleTime);
      osc.stop(bubbleTime + 0.09);
    }
  }

  /**
   * Crisp popping sound when cork seals a tube
   */
  public playCorkPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Harmonious chime when a tube is successfully completed
   */
  public playCompleteTube() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.playCorkPop();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime + 0.04;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  /**
   * Joyful victory fanfare when level is completed
   */
  public playWinFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Triumphant melody chords
    const chordSeq = [
      { notes: [440, 554.37, 659.25], time: 0.0, dur: 0.18 }, // A major
      { notes: [493.88, 622.25, 739.99], time: 0.18, dur: 0.18 }, // B major
      { notes: [554.37, 659.25, 830.61], time: 0.36, dur: 0.22 }, // C#m
      { notes: [659.25, 830.61, 987.77, 1318.5], time: 0.58, dur: 0.7 }, // E Major high climax!
    ];

    chordSeq.forEach(({ notes, time, dur }) => {
      notes.forEach((freq) => {
        if (!this.ctx) return;
        const noteStart = now + time;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + dur + 0.05);
      });
    });
  }

  /**
   * Sound for Undo action
   */
  public playUndo() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Hint chime
   */
  public playHint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [880, 1108.73, 1318.51].forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  /**
   * Invalid move feedback
   */
  public playError() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const sound = new SoundEngine();
