// Studio-grade UI Audio Engine
// Provides subtle, modern micro-interactions (similar to Linear, Apple, Stripe)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.lastHoverTime = 0;
    this.lastClickTime = 0;
    this.enabled = true;
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Subtle, luxury tactile micro-tick for hover
  playHover() {
    if (!this.enabled) return;
    const now = performance.now();
    // 40ms debounce to avoid audio spam during fast cursor movement
    if (now - this.lastHoverTime < 40) return;
    this.lastHoverTime = now;

    try {
      this.init();
      if (!this.ctx) {
        this.fallbackPlay('/hover.wav', 0.25);
        return;
      }

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Bandpass centered at 2400Hz for a crisp, glassy acoustic tick
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.setValueAtTime(1.8, t);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.028);

      // Micro envelope: instant attack, 28ms exponential decay
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      this.fallbackPlay('/hover.wav', 0.25);
    }
  }

  // High-precision tactile click for buttons and links
  playClick() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastClickTime < 50) return;
    this.lastClickTime = now;

    try {
      this.init();
      if (!this.ctx) {
        this.fallbackPlay('/click.wav', 0.3);
        return;
      }

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, t);
      filter.frequency.exponentialRampToValueAtTime(800, t + 0.04);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.0015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.042);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch {
      this.fallbackPlay('/click.wav', 0.3);
    }
  }

  // Subtle pitch sweep for switch toggles (Settings, Themes)
  playToggle(isActive) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startFreq = isActive ? 1150 : 1550;
      const endFreq = isActive ? 1650 : 1050;

      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.04);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Graceful fallback
    }
  }

  fallbackPlay(src, volume = 0.25) {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {
      // Ignore audio autoplay restrictions
    }
  }
}

export const soundEngine = new SoundEngine();
