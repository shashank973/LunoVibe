class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.channels = {};
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Setup Channels
      this.setupRainChannel();
      this.setupBellsChannel();
      this.setupKeyboardChannel();
      this.setupTrainChannel();
      
      this.initialized = true;
      console.log("LunoVibe Web Audio Ambient Engine Initialized.");
    } catch (e) {
      console.error("Failed to initialize Web Audio API:", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Rain Synthesizer (White noise with Biquad Filter modulated by LFO)
  setupRainChannel() {
    const ctx = this.ctx;
    
    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to make it sound like rain
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.0;

    // LFO to simulate wind/rain gusts
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // very slow

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300; // modulate filter center by 300Hz

    // Master volume control for rain
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // default mute

    // Connections
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start oscillators
    noiseSource.start(0);
    lfo.start(0);

    this.channels['rain'] = { gain: gainNode, source: noiseSource, filter, lfo };
  }

  // 2. Temple Bells Synthesizer (FM Synthesis generating metallic overtones and echoes)
  setupBellsChannel() {
    const ctx = this.ctx;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // default mute
    gainNode.connect(ctx.destination);

    let isPlaying = false;
    let bellInterval = null;

    const triggerBell = () => {
      if (gainNode.gain.value === 0) return;
      
      const now = ctx.currentTime;
      const duration = 5.0; // long ring

      // Simple FM synthesis for metallic chime
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const bellGain = ctx.createGain();

      carrier.type = 'sine';
      modulator.type = 'sine';

      // Varanasi bell frequencies: fundamental at ~440Hz + high frequency metallic overtones
      const baseFreq = 300 + Math.random() * 200; // randomized pitches
      carrier.frequency.setValueAtTime(baseFreq, now);
      modulator.frequency.setValueAtTime(baseFreq * 2.76, now); // inharmonic multiplier

      modGain.gain.setValueAtTime(400, now);
      modGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      // Bell volume envelope (exponential decay)
      bellGain.gain.setValueAtTime(0.3, now);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Connect modulator to carrier frequency
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      // Connect carrier to output
      carrier.connect(bellGain);
      bellGain.connect(gainNode);

      // Start and Stop
      modulator.start(now);
      carrier.start(now);

      modulator.stop(now + duration);
      carrier.stop(now + duration);
    };

    const startLoop = () => {
      if (isPlaying) return;
      isPlaying = true;
      
      const loop = () => {
        if (!isPlaying) return;
        triggerBell();
        // Ring bell randomly every 4-8 seconds
        const delay = 4000 + Math.random() * 4000;
        bellInterval = setTimeout(loop, delay);
      };
      loop();
    };

    const stopLoop = () => {
      isPlaying = false;
      if (bellInterval) clearTimeout(bellInterval);
    };

    this.channels['bells'] = { 
      gain: gainNode, 
      start: startLoop, 
      stop: stopLoop,
      trigger: triggerBell
    };
  }

  // 3. Mechanical Keyboard (Short envelopes of filtered noise bursts triggered randomly)
  setupKeyboardChannel() {
    const ctx = this.ctx;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // default mute
    gainNode.connect(ctx.destination);

    let isPlaying = false;
    let keyInterval = null;

    const playKeyClick = () => {
      if (gainNode.gain.value === 0) return;

      const now = ctx.currentTime;
      
      // Noise burst for key click clickyness
      const bufferSize = ctx.sampleRate * 0.05; // 50ms click
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // High pass filter to capture plastic friction
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1500;

      // Click envelope
      const keyGain = ctx.createGain();
      keyGain.gain.setValueAtTime(0.15, now);
      keyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      noise.connect(filter);
      filter.connect(keyGain);
      keyGain.connect(gainNode);

      noise.start(now);
      noise.stop(now + 0.05);

      // Low mechanical thud frequency (metallic spring sound)
      const thud = ctx.createOscillator();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(120 + Math.random() * 30, now);
      
      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.2, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      thud.connect(thudGain);
      thudGain.connect(gainNode);

      thud.start(now);
      thud.stop(now + 0.06);
    };

    const startLoop = () => {
      if (isPlaying) return;
      isPlaying = true;

      const loop = () => {
        if (!isPlaying) return;
        playKeyClick();
        // Keyboard typing rhythm (bursts and pauses)
        const delay = 150 + Math.random() * (Math.random() > 0.85 ? 1200 : 350);
        keyInterval = setTimeout(loop, delay);
      };
      loop();
    };

    const stopLoop = () => {
      isPlaying = false;
      if (keyInterval) clearTimeout(keyInterval);
    };

    this.channels['keyboard'] = {
      gain: gainNode,
      start: startLoop,
      stop: stopLoop
    };
  }

  // 4. Train Tracks Click-Clack (Low filtered impulses in rhythmic groups)
  setupTrainChannel() {
    const ctx = this.ctx;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // default mute
    gainNode.connect(ctx.destination);

    let isPlaying = false;
    let trainInterval = null;

    const playClickClack = () => {
      if (gainNode.gain.value === 0) return;
      
      const now = ctx.currentTime;

      // Generates "click-clack ... click-clack" using 4 micro envelope bursts
      const triggerImpulse = (timeOffset, volumeMultiplier) => {
        const triggerTime = now + timeOffset;

        // Bandpass filtered noise burst for the wheels hitting track gap
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 250; // low click
        filter.Q.value = 1.5;

        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.08 * volumeMultiplier, triggerTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, triggerTime + 0.06);

        source.connect(filter);
        filter.connect(clickGain);
        clickGain.connect(gainNode);

        source.start(triggerTime);
        source.stop(triggerTime + 0.08);

        // Low bass rumble for train weight
        const rumble = ctx.createOscillator();
        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(45, triggerTime);

        const rumbleGain = ctx.createGain();
        rumbleGain.gain.setValueAtTime(0.35 * volumeMultiplier, triggerTime);
        rumbleGain.gain.exponentialRampToValueAtTime(0.0001, triggerTime + 0.12);

        rumble.connect(rumbleGain);
        rumbleGain.connect(gainNode);

        rumble.start(triggerTime);
        rumble.stop(triggerTime + 0.15);
      };

      // Rhythmic layout for train wheels
      triggerImpulse(0.0, 1.0);     // Wheel 1
      triggerImpulse(0.12, 0.7);    // Wheel 2 (clack)
      triggerImpulse(0.35, 0.95);   // Wheel 3 (next axle)
      triggerImpulse(0.47, 0.65);   // Wheel 4 (clack)
    };

    const startLoop = () => {
      if (isPlaying) return;
      isPlaying = true;

      const loop = () => {
        if (!isPlaying) return;
        playClickClack();
        // Train track joints every 1.8 seconds (average speed)
        trainInterval = setTimeout(loop, 1800);
      };
      loop();
    };

    const stopLoop = () => {
      isPlaying = false;
      if (trainInterval) clearTimeout(trainInterval);
    };

    this.channels['train'] = {
      gain: gainNode,
      start: startLoop,
      stop: stopLoop
    };
  }

  // Set individual volumes (0.0 to 1.0)
  setVolume(channelName, volume) {
    this.init(); // Auto-initialize on volume update
    this.resume(); // Ensure context is awake
    
    const channel = this.channels[channelName];
    if (!channel) return;

    // Linear ramp to avoid audio pops/cracks
    if (this.ctx) {
      const targetGain = Math.max(0, Math.min(1, volume));
      channel.gain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
      
      // If the channel has looping script handlers (like bells/keyboard/train)
      if (channel.start && channel.stop) {
        if (targetGain > 0) {
          channel.start();
        } else {
          channel.stop();
        }
      }
    }
  }

  // Get current state of volumes for UI display
  getVolume(channelName) {
    const channel = this.channels[channelName];
    return channel ? channel.gain.gain.value : 0;
  }
}

// Single exported instance for global application use
export const ambientEngine = new AmbientEngine();
