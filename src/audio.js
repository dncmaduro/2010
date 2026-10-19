export class AudioManager {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
  }

  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = .12;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
    return true;
  }

  toggle() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : .12, this.context.currentTime, .03);
    return this.muted;
  }

  tone(frequency, duration, type = "sine", volume = .2, endFrequency = frequency) {
    if (this.muted || !this.ensure()) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }

  noise(duration = .12, volume = .08, highpass = 800) {
    if (this.muted || !this.ensure()) return;
    const length = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
  }

  click() { this.tone(520, .045, "square", .11, 760); }
  slash() { this.tone(180, .11, "sawtooth", .14, 820); this.noise(.08, .045, 1200); }
  hit() { this.tone(92, .18, "triangle", .2, 48); this.tone(440, .09, "square", .08, 220); }
  hurt() { this.tone(120, .22, "sawtooth", .13, 55); }
  warning() { this.tone(140, .26, "square", .12, 80); this.tone(280, .22, "square", .07, 180); }
  victory() { this.tone(392, .16, "triangle", .13, 520); setTimeout(() => this.tone(523, .24, "triangle", .15, 784), 130); setTimeout(() => this.tone(784, .46, "sine", .18, 1047), 300); }
  unlock() { this.tone(660, .11, "square", .1, 880); setTimeout(() => this.tone(990, .18, "triangle", .12, 1320), 85); }
}
