function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particle.style.width = (Math.random() * 6 + 4) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', createParticles);
