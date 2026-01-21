let audioContext = null;
let backgroundOscillators = [];
let gainNode = null;
let isPlaying = false;
let musicEnabled = localStorage.getItem('impostor-music') === 'true';

function initAudio() {
    if (audioContext) return audioContext;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.4;
        console.log('Audio initialized');
        return audioContext;
    } catch (e) {
        console.log('Audio not supported:', e);
        return null;
    }
}

function startMysteryMusic() {
    if (!musicEnabled || isPlaying) return;
    
    const ctx = initAudio();
    if (!ctx) return;
    
    isPlaying = true;
    ctx.resume().then(() => {
        console.log('Audio context resumed');
        createBackgroundAmbience();
        playRandomMelody();
    });
}

function createBackgroundAmbience() {
    if (!audioContext || !isPlaying) return;
    
    const freqs = [55, 82.5, 110, 165];
    const types = ['sine', 'triangle'];
    
    backgroundOscillators = [];
    
    freqs.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        const panner = audioContext.createStereoPanner();
        
        osc.type = types[i % 2];
        osc.frequency.value = freq;
        oscGain.gain.value = 0;
        panner.pan.value = (Math.random() - 0.5) * 1.5;
        
        osc.connect(oscGain);
        oscGain.connect(panner);
        panner.connect(gainNode);
        osc.start();
        
        backgroundOscillators.push({ osc, oscGain, panner });
        
        setTimeout(() => {
            if (isPlaying && oscGain) {
                oscGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 3);
            }
        }, i * 800);
    });
}

function playRandomMelody() {
    if (!isPlaying || !audioContext) return;
    
    const freqs = [130.81, 155.56, 174.61, 196.00, 220.00, 261.63, 293.66, 329.63, 349.23, 392.00];
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    setTimeout(() => {
        if (!isPlaying) return;
        
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        const panner = audioContext.createStereoPanner();
        
        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        panner.pan.value = (Math.random() - 0.5) * 1.5;
        
        noteGain.gain.setValueAtTime(0, audioContext.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
        
        osc.connect(noteGain);
        noteGain.connect(panner);
        panner.connect(gainNode);
        
        osc.start();
        osc.stop(audioContext.currentTime + 1.5);
        
        playRandomMelody();
    }, 800 + Math.random() * 1500);
}

function stopMysteryMusic() {
    isPlaying = false;
    
    if (backgroundOscillators.length > 0) {
        backgroundOscillators.forEach(item => {
            if (item.oscGain) {
                try {
                    item.oscGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
                } catch (e) {}
            }
            if (item.osc) {
                setTimeout(() => {
                    try { item.osc.stop(); } catch(e) {}
                }, 400);
            }
        });
        backgroundOscillators = [];
    }
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    localStorage.setItem('impostor-music', musicEnabled);
    
    updateMusicButton();
    
    if (musicEnabled) {
        startMysteryMusic();
    } else {
        stopMysteryMusic();
    }
    
    return musicEnabled;
}

function updateMusicButton() {
    const btn = document.getElementById('music-toggle-btn');
    if (btn) {
        btn.textContent = musicEnabled ? '🔊' : '🔇';
        btn.setAttribute('aria-label', musicEnabled ? 'Desactivar música' : 'Activar música');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateMusicButton();
});
