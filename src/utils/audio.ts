/**
 * Synthesizes a warm, gentle bell chime using the Web Audio API.
 * No external sound files or dependencies required.
 */
export const playReminderChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();

    // Two harmonics for a rich, warm meditative bell chime
    const fundamental = 587.33; // D5
    const harmonic = 880.00;    // A5

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(fundamental, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.9);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(harmonic, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(audioCtx.destination);
    gain2.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.95);
    osc2.stop(audioCtx.currentTime + 0.95);
  } catch (e) {
    // Audio playback blocked by browser gesture policies or disabled
  }
};
