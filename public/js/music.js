let audioContext = null;
let backgroundOscillators = [];
let gainNode = null;
let isPlaying = false;
let musicEnabled = localStorage.getItem('impostor-music') === 'true';

function initAudio() {
    if (audioContext) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.15;
    } catch (e) {
        console.log('Audio not supported');
    }
}

function createOscillator(freq, type, pan = 0) {
    if (!audioContext) return;
    
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    const panner = audioContext.createStereoPanner();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    oscGain.gain.value = 0;
    
    panner.pan.value = pan;
    
    osc.connect(oscGain);
    oscGain.connect(panner);
    panner.connect(gainNode);
    
    osc.start();
    
    return { osc, oscGain, panner };
}

function startMysteryMusic() {
    if (!musicEnabled || isPlaying) return;
    initAudio();
    
    if (!audioContext) return;
    
    isPlaying = true;
    
    audioContext.resume();
    
    const baseFreqs = [55, 82.5, 110, 165, 220];
    const types = ['sine', 'triangle'];
    
    backgroundOscillators = [];
    
    baseFreqs.forEach((freq, i) => {
        const type = types[i % 2];
        const pan = (Math.random() - 0.5) * 1.5;
        const osc = createOscillator(freq, type, pan);
        if (osc) {
            backgroundOscillators.push(osc);
        }
    });
    
    backgroundOscillators.forEach((item, i) => {
        const delay = i * 0.5;
        setTimeout(() => {
            if (isPlaying && item.oscGain) {
                item.oscGain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 2);
            }
        }, delay * 1000);
    });
    
    startRandomNotes();
}

function stopMysteryMusic() {
    isPlaying = false;
    
    backgroundOscillators.forEach(item => {
        if (item.oscGain) {
            item.oscGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        }
        if (item.osc) {
            setTimeout(() => {
                try { item.osc.stop(); } catch(e) {}
            }, 600);
        }
    });
    
    backgroundOscillators = [];
}

function startRandomNotes() {
    if (!isPlaying || !audioContext) return;
    
    const intervals = [1000, 2000, 3000, 4000];
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    
    setTimeout(() => {
        if (isPlaying) {
            playMysteryNote();
            startRandomNotes();
        }
    }, interval);
}

function playMysteryNote() {
    if (!audioContext || !isPlaying) return;
    
    const freqs = [130.81, 155.56, 174.61, 196.00, 220.00, 261.63, 311.13, 349.23];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    
    const osc = audioContext.createOscillator();
    const noteGain = audioContext.createGain();
    const panner = audioContext.createStereoPanner();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    panner.pan.value = (Math.random() - 0.5) * 2;
    
    noteGain.gain.value = 0;
    noteGain.gain.setValueAtTime(0, audioContext.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
    
    osc.connect(noteGain);
    noteGain.connect(panner);
    panner.connect(gainNode);
    
    osc.start();
    osc.stop(audioContext.currentTime + 1.5);
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
    if (musicEnabled) {
        updateMusicButton();
    }
});
