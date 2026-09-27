const fs = require('fs');

const sampleRate = 44100;
const duration = 0.3; // slightly longer
const numSamples = sampleRate * duration;
const buffer = Buffer.alloc(44 + numSamples * 2);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

const baseFreq = 200; // lower, smoother base frequency

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  
  // Smooth envelope: ease in, long ease out
  let envelope;
  const attackEnd = 0.05;
  if (t < attackEnd) {
      envelope = t / attackEnd; // linear attack
  } else {
      // Exponential decay
      envelope = Math.exp(-15 * (t - attackEnd));
  }
  
  // Modulate frequency slightly downwards
  const freq = baseFreq - (t * 50); 
  const sample = Math.sin(2 * Math.PI * freq * t) * envelope;
  
  // 16-bit PCM (lower volume natively so it's not harsh)
  const val = Math.max(-32768, Math.min(32767, Math.floor(sample * 16000)));
  buffer.writeInt16LE(val, 44 + i * 2);
}

fs.writeFileSync('public/hover.wav', buffer);
console.log('Smoother WAV file generated.');
