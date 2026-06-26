/**
 * BiteGamez Retro 8-bit Audio synthesizer
 * Using HTML5 Web Audio API to generate arcade effects completely offline with 0kb asset weight.
 */

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.musicInterval = null;
        this.currentSources = [];
        this.musicTempo = 130; // BPM
        this.melodicStep = 0;
        
        // Simple retro cute looping melody notes (frequencies in Hz)
        // C4, D4, E4, G4, A4, C5
        this.melody = [
            261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00,
            329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 523.25, 392.00
        ];
        this.bassline = [
            130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 196.00, 196.00,
            130.81, 130.81, 164.81, 164.81, 220.00, 220.00, 196.00, 196.00
        ];
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
        } catch (e) {
            console.warn("Web Audio API not supported on this browser context", e);
        }
    }

    resumeContext() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSFX(enabled) {
        this.sfxEnabled = enabled;
        this.playTap();
    }

    toggleMusic(enabled) {
        this.musicEnabled = enabled;
        if (enabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
    }

    createOscillator(type, freq, duration, gainStart = 0.1) {
        this.resumeContext();
        if (!this.ctx || !this.sfxEnabled) return null;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        // Exponential decay for clean tail end
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
        
        return { osc, gainNode };
    }

    playTap() {
        // High frequency direct pop
        this.createOscillator('sine', 1200, 0.08, 0.05);
    }

    playSelect() {
        // Short double tone
        this.createOscillator('square', 300, 0.1, 0.04);
        setTimeout(() => this.createOscillator('square', 600, 0.12, 0.04), 80);
    }

    playJump() {
        // Upward pitch bend sweep
        this.resumeContext();
        if (!this.ctx || !this.sfxEnabled) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.18);
        
        gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }

    playHit() {
        // Exploding retro noise
        this.resumeContext();
        if (!this.ctx || !this.sfxEnabled) return;

        try {
            // Reconstruct noise using a low-frequency oscillator and high ramp decay
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.25);
            
            gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) {
            // Fallback square
            this.createOscillator('square', 80, 0.25, 0.15);
        }
    }

    playMerge() {
        // Bright metallic chime arpeggio
        this.createOscillator('sine', 523.25, 0.15, 0.08); // C5
        setTimeout(() => this.createOscillator('sine', 659.25, 0.15, 0.08), 60); // E5
        setTimeout(() => this.createOscillator('sine', 783.99, 0.25, 0.08), 120); // G5
    }

    playWin() {
        // Cheerful major arpeggio fanfare
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major chord up
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.createOscillator('square', freq, 0.25, 0.06);
            }, idx * 75);
        });
    }

    playLose() {
        // Gloomy downbending pitch
        this.resumeContext();
        if (!this.ctx || !this.sfxEnabled) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playFlag() {
        // Tiny crisp ping
        this.createOscillator('sine', 950, 0.06, 0.04);
    }

    startMusic() {
        this.resumeContext();
        if (!this.ctx || !this.musicEnabled) return;
        if (this.musicInterval) clearInterval(this.musicInterval);

        const stepTime = 60000 / this.musicTempo / 2; // Eighth notes
        
        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled || !this.ctx) return;
            
            const step = this.melodicStep % this.melody.length;
            
            // Generate a light synth note for high track harmony melody
            if (step % 2 === 0 || Math.random() > 0.4) {
                this.playTrackerNote('triangle', this.melody[step], 0.18, 0.015);
            }
            
            // Bass line note
            if (step % 2 === 0) {
                this.playTrackerNote('sine', this.bassline[step], 0.25, 0.025);
            }
            
            this.melodicStep++;
        }, stepTime);
    }

    playTrackerNote(type, freq, duration, volume) {
        if (!this.ctx || !this.musicEnabled) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global Export Singleton
const SoundFX = new SoundSystem();
window.SoundFX = SoundFX;
