const socket = io();

let playerName = '';
let isHost = false;
let selectedCategory = 'general';
let impostorCount = 1;
let myRole = null;
let playersList = [];

let localPlayerNames = [];
let localImpostorCount = 1;
let localSelectedCategory = 'general';
let localPlayerRoles = [];
let localCurrentIndex = 0;
let isLocalMode = false;

socket.on('connect', () => {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) statusEl.classList.remove('hidden');
    const textEl = document.getElementById('status-text');
    if (textEl) textEl.textContent = 'Conectado';
});

socket.on('disconnect', () => {
    const textEl = document.getElementById('status-text');
    if (textEl) textEl.textContent = 'Desconectado';
});

socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
    showNotification('Error de conexión');
});

function showScreen(id) {
    ['screen-connect', 'screen-join', 'screen-create', 'screen-lobby', 'screen-local', 'screen-waiting', 'screen-reveal', 'screen-playing', 'screen-voting', 'screen-results'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
}

function showConnectScreen() { showScreen('screen-connect'); }
function showJoinScreen() { showScreen('screen-join'); }
function showCreateScreen() { showScreen('screen-create'); }
function showLocalScreen() { 
    showScreen('screen-local'); 
    updateLocalPlayersList();
}

function selectLocalCategory(cat) {
    localSelectedCategory = cat;
    document.querySelectorAll('#screen-local .category-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`cat-local-${cat}`);
    if (btn) btn.classList.add('active');
}

function setLocalImpostorCount(count) {
    localImpostorCount = count;
    document.querySelectorAll('#local-impostor-count .count-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx + 1 === count);
    });
}

function addLocalPlayer() {
    const container = document.getElementById('local-names-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = "flex gap-2";
    div.innerHTML = `
        <div class="neon-input flex-1">
            <input type="text" placeholder="Nombre..." class="local-player-input" maxlength="15">
        </div>
        <button onclick="this.parentElement.remove(); updateLocalPlayersList();" class="remove-btn">✕</button>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeLastLocalPlayer() {
    const container = document.getElementById('local-names-container');
    if (container && container.children.length > 0) {
        container.removeChild(container.lastChild);
    }
    updateLocalPlayersList();
}

function updateLocalPlayersList() {
    const inputs = document.querySelectorAll('.local-player-input');
    localPlayerNames = Array.from(inputs).map(i => i.value.trim()).filter(n => n !== "");
    const countEl = document.getElementById('local-player-count');
    if (countEl) countEl.textContent = `${localPlayerNames.length}/12`;
}

const wordBank = {
    general: ["Pizza", "París", "iPhone", "Fútbol", "Elefante", "Netflix", "Guitarra", "Dinosaurio", "Chocolate", "Tiburón", "Espada", "Marte", "Cine", "Hamburguesa", "Avión", "Batman", "Zombi", "Minecraft", "Sushi", "Playa", "Robot", "Nube", "Fuego", "Hielo", "Luna", "Sol", "Estrella", "Teléfono", "Reloj", "Cerveza", "Gato", "Perro", "Pájaro", "Coche", "Casa", "Libro", "Agua", "Tierra", "Viento", "Música", "Danza", "Café", "Ratón", "Teclado", "Monitor", "Zapato", "Llave", "Puerta", "Ventana", "Silla", "Mesa"],
    peliculas: ["Matrix", "Titanic", "Avatar", "Gladiador", "Frozen", "Toy Story", "Jurassic Park", "El Rey León", "Volver al Futuro", "Star Wars", "Harry Potter", "El Señor de los Anillos", "Spider-Man", "Iron Man", "Batman", "Terminator", "Alien", "Depredador", "Jaws", "Psicosis", "Inception", "Interstellar", "Coco", "Encanto", "Moana", "Buscando a Nemo", "Los Increíbles", "Shrek", "Mi Villano Favorito", "Minions", "Wonder Woman", "Black Panther", "Thor", "Capitán América", "Guardians of the Galaxy"],
    paises: ["España", "Francia", "Italia", "Alemania", "Japón", "Brasil", "Argentina", "México", "Canadá", "Estados Unidos", "China", "India", "Australia", "Egipto", "Grecia", "Rusia", "Inglaterra", "Portugal", "Colombia", "Perú", "Chile", "Uruguay", "Venezuela", "Cuba", "Corea", "Tailandia", "Vietnam", "Marruecos", "Turquía", "Suiza", "Países Bajos", "Suecia", "Noruega", "Dinamarca", "Finlandia"],
    comida: ["Tacos", "Paella", "Sushi", "Pizza", "Hamburguesa", "Lasaña", "Curry", "Ramen", "Ceviche", "Empanadas", "Churrasco", "Milanesa", "Feijoada", "Bandeja Paisa", "Arepa", "Patacón", "Causa", "Anticuchos", "Chicha", "Pisco Sour", "Guisado", "Tamales", "Pupusas", "Chimichanga", "Enchiladas", "Tostada", "Gordita", "Quesadilla", "Burrito", "Pollo", "Carne", "Pescado", "Arroz", "Fideos"],
    tecnologia: ["Computadora", "Internet", "Inteligencia Artificial", "Robot", "Aplicación", "Videojuego", "Redes Sociales", "Smartphone", "Tablet", "Wifi", "Bluetooth", "Nube", "Big Data", "Ciberseguridad", "Blockchain", "Criptomoneda", "Realidad Virtual", "Realidad Aumentada", "Drone", "Impresora 3D", "GitHub", "ChatGPT", "Netflix", "Spotify", "YouTube"],
    deportes: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Atletismo", "Béisbol", "Fútbol Americano", "Voleibol", "Boxeo", "Artes Marciales", "Gimnasia", "Ciclismo", "Esquí", "Surf", "Escalada", "Golf", "Hockey", "Rugby", "Críquet", "Ping Pong"],
    animales: ["León", "Tigre", "Elefante", "Jirafa", "Mono", "Conejo", "Perro", "Gato", "Pájaro", "Pez", "Delfín", "Ballena", "Tiburón", "Serpiente", "Lagarto", "Rana", "Tortuga", "Cocodrilo", "Hipopótamo", "Rinoceronte"],
    colores: ["Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado", "Rosa", "Negro", "Blanco", "Gris", "Marrón", "Beige", "Celeste", "Turquesa", "Violeta", "Lila", "Dorado", "Plateado", "Cyan", "Magenta"],
    profesiones: ["Doctor", "Abogado", "Ingeniero", "Maestro", "Chef", "Piloto", "Enfermero", "Actor", "Artista", "Arquitecto", "Programador", "Periodista", "Policía", "Bombero", "Agricultor", "Músico", "Escritor", "Dentista", "Veterinario", "Científico"],
    musica: ["Guitarra", "Piano", "Violín", "Batería", "Bajo", "Saxofón", "Trompeta", "Flauta", "Arpa", "Órgano", "Ukulele", "Banjo", "Clarinete", "Corneta", "Armónica", "Laúd", "Caja", "Maracas", "Xilófono", "Melodía"],
    viajes: ["Playa", "Montaña", "Ciudad", "Desierto", "Selva", "Cueva", "Cascada", "Volcán", "Isla", "Bosque", "Rio", "Lago", "Castillo", "Museo", "Mercado", "Aventura", "Exploración", "Backpack", "Maleta", "Pasaporte"],
    naturaleza: ["Arbol", "Flor", "Roca", "Montaña", "Río", "Lago", "Cielo", "Lluvia", "Nieve", "Viento", "Tormenta", "Arcoíris", "Cielo", "Estrella", "Luna", "Sol", "Volcán", "Cascada", "Hoja", "Rama"],
    espacio: ["Estrella", "Planeta", "Luna", "Sol", "Asteroide", "Cometa", "Galaxia", "Nebulosa", "Agujero Negro", "Universo", "Cohete", "Nave", "Astronauta", "Marte", "Júpiter", "Saturno", "Vía Láctea", "Meteorito", "Estación Espacial", "Telescopio"],
    historia: ["Faraón", "Cesar", "Napoleón", "Colón", "Darwin", "Einstein", "Tesla", "Mujer", "Machu Picchu", "Pirámide", "Castillo", "Templo", "Batalla", "Reino", "Imperio", "Revolución", "Descubrimiento", "Invento", "Guerra", "Paz"],
    arte: ["Pintura", "Escultura", "Danza", "Teatro", "Cine", "Música", "Poesía", "Arquitectura", "Fotografía", "Cómic", "Mural", "Graffiti", "Ópera", "Ballet", "Tango", "Salsa", "Jazz", "Rock", "Literatura", "Animación"],
    emociones: ["Alegría", "Tristeza", "Miedo", "Ira", "Amor", "Odio", "Sorpresa", "Ansiedad", "Calma", "Paz", "Esperanza", "Desesperación", "Envidia", "Orgullo", "Curiosidad", "Ansia", "Éxtasis", "Pánico", "Vergüenza", "Culpa"]
};

function startLocalGame() {
    console.log('=== START LOCAL GAME ===');
    console.log('localPlayerNames:', localPlayerNames);
    console.log('localSelectedCategory:', localSelectedCategory);
    
    isLocalMode = true;
    updateLocalPlayersList();
    
    if (localPlayerNames.length < 3) {
        showNotification('Se necesitan al menos 3 jugadores');
        return;
    }
    if (localPlayerNames.length > 12) {
        showNotification('Máximo 12 jugadores');
        return;
    }

    const words = wordBank[localSelectedCategory];
    console.log('Words available:', words.length);
    
    const secretWord = words[Math.floor(Math.random() * words.length)];
    console.log('Secret word:', secretWord);
    
    localPlayerRoles = new Array(localPlayerNames.length).fill(secretWord);
    
    let impostors = new Set();
    while(impostors.size < localImpostorCount) {
        impostors.add(Math.floor(Math.random() * localPlayerNames.length));
    }
    
    console.log('Impostor indices:', [...impostors]);
    
    impostors.forEach(idx => {
        localPlayerRoles[idx] = { word: "IMPOSTOR", isImpostor: true };
    });

    console.log('localPlayerRoles:', localPlayerRoles);
    
    localCurrentIndex = 0;
    showLocalTransitionScreen();
}

function showLocalTransitionScreen() {
    console.log('=== SHOW LOCAL TRANSITION ===');
    console.log('Current index:', localCurrentIndex);
    console.log('Player name:', localPlayerNames[localCurrentIndex]);
    
    const msgEl = document.getElementById('waiting-message');
    const codeEl = document.getElementById('waiting-room-code');
    if (msgEl) msgEl.textContent = `Pasá el teléfono a: ${localPlayerNames[localCurrentIndex].toUpperCase()}`;
    if (codeEl) codeEl.textContent = 'LOCAL';
    showScreen('screen-waiting');
}

function confirmLocalReveal() {
    console.log('=== CONFIRM LOCAL REVEAL ===');
    console.log('localCurrentIndex:', localCurrentIndex);
    console.log('localPlayerRoles:', localPlayerRoles);
    
    const display = document.getElementById('secret-word');
    const role = localPlayerRoles[localCurrentIndex];
    const indicator = document.getElementById('role-indicator');
    
    console.log('Role for current player:', role);
    console.log('typeof role:', typeof role);
    
    if (!display || !role || !indicator) {
        console.log('ERROR: Missing elements');
        return;
    }
    
    if (typeof role === 'object' && role.isImpostor) {
        console.log('Player is IMPOSTOR');
        display.innerText = '🕵️ IMPOSTOR 🕵️';
        display.classList.add('impostor');
        indicator.classList.remove('hidden');
        indicator.className = 'px-4 py-2 rounded-lg font-bold text-sm';
        indicator.style.background = 'linear-gradient(135deg, #ec4899, #a855f7)';
        indicator.style.color = '#fff';
        indicator.innerText = '¡No tienes palabra!';
    } else {
        console.log('Player word:', role);
        display.innerText = typeof role === 'string' ? role : '???';
        display.classList.remove('impostor');
        indicator.classList.remove('hidden');
        indicator.className = 'px-4 py-2 rounded-lg font-bold text-sm';
        indicator.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        indicator.style.color = '#fff';
        indicator.innerText = '¡No reveles!';
    }
    
    showScreen('screen-reveal');
}

function nextLocalStep() {
    console.log('=== NEXT LOCAL STEP ===');
    const display = document.getElementById('secret-word');
    if (display) display.classList.remove('impostor');
    localCurrentIndex++;
    
    console.log('New index:', localCurrentIndex);
    console.log('Total players:', localPlayerNames.length);
    
    if (localCurrentIndex < localPlayerNames.length) {
        showLocalTransitionScreen();
    } else {
        console.log('All players revealed, showing playing screen');
        showScreen('screen-playing');
        const hostControls = document.getElementById('host-controls');
        const playerControls = document.getElementById('player-controls');
        if (hostControls) hostControls.classList.remove('hidden');
        if (playerControls) playerControls.classList.add('hidden');
    }
}

function selectCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const btn = document.getElementById(`cat-${cat}`);
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
    }
    
    if (isHost && playersList.length > 0) {
        socket.emit('update-settings', { category: cat });
    }
}

function selectLocalCategory(cat) {
    localSelectedCategory = cat;
    document.querySelectorAll('#screen-local .category-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const btn = document.getElementById(`cat-local-${cat}`);
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
    }
}

function setImpostorCount(count) {
    impostorCount = count;
    document.querySelectorAll('.count-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx + 1 === count);
    });
    
    if (isHost && playersList.length > 0) {
        socket.emit('update-settings', { impostorCount: count });
    }
}

function joinRoom() {
    const codeInput = document.getElementById('room-code-input');
    const nameInput = document.getElementById('player-name');
    const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
    playerName = nameInput ? nameInput.value.trim() : '';
    
    if (!playerName) {
        showNotification('Ingresa tu nombre');
        return;
    }
    if (!code) {
        showNotification('Ingresa el código de sala');
        return;
    }

    socket.emit('join-room', { code, name: playerName });
}

function createRoom() {
    const nameInput = document.getElementById('player-name');
    playerName = nameInput ? nameInput.value.trim() : '';
    
    if (!playerName) {
        showNotification('Ingresa tu nombre');
        return;
    }

    if (!socket.connected) {
        showNotification('Conectando... intenta de nuevo');
        return;
    }

    socket.emit('create-room', playerName);
}

socket.on('room-joined', (data) => {
    isHost = data.isHost;
    playersList = data.players;
    
    const codeDisplay = document.getElementById('room-code-display');
    const waitingCode = document.getElementById('waiting-room-code');
    const votingCode = document.getElementById('voting-room-code');
    
    if (codeDisplay) codeDisplay.textContent = data.code;
    if (waitingCode) waitingCode.textContent = data.code;
    if (votingCode) votingCode.textContent = data.code;
    
    updatePlayersList();
    showScreen('screen-lobby');
    
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
        if (isHost) {
            startBtn.classList.remove('hidden');
            socket.emit('update-settings', { 
                category: selectedCategory, 
                impostorCount: impostorCount 
            });
        } else {
            startBtn.classList.add('hidden');
        }
    }
});

socket.on('players-updated', (players) => {
    playersList = players;
    updatePlayersList();
});

function updatePlayersList() {
    const container = document.getElementById('players-list');
    if (!container) return;
    
    container.innerHTML = playersList.map(p => `
        <div class="player-card">
            <span class="font-bold">${p.name}${p.isHost ? ' 👑' : ''}</span>
            <span class="player-badge">${p.isHost ? 'HOST' : 'JUGADOR'}</span>
        </div>
    `).join('');
    
    const countEl = document.getElementById('player-count');
    if (countEl) countEl.textContent = `${playersList.length}/12`;
}

socket.on('error', (msg) => {
    showNotification(msg);
});

function startGame() {
    if (playersList.length < 3) {
        showNotification('Se necesitan al menos 3 jugadores');
        return;
    }
    socket.emit('start-game');
}

socket.on('game-started', (data) => {
    showScreen('screen-waiting');
    const msgEl = document.getElementById('waiting-message');
    if (msgEl) msgEl.textContent = `Jugador ${data.currentPlayer + 1} de ${data.totalPlayers} está viendo su rol...`;
});

socket.on('your-role', (data) => {
    console.log('your-role event received:', JSON.stringify(data));
    myRole = data.role;
    console.log('myRole:', myRole);
    
    const display = document.getElementById('secret-word');
    const indicator = document.getElementById('role-indicator');
    
    console.log('display element:', display);
    console.log('indicator element:', indicator);
    
    if (!display || !indicator) {
        console.log('ERROR: Elements not found!');
        return;
    }
    
    if (myRole && myRole.isImpostor) {
        console.log('Player is IMPOSTOR');
        display.innerText = '🕵️ IMPOSTOR 🕵️';
        display.classList.add('impostor');
        indicator.classList.remove('hidden');
        indicator.className = 'px-4 py-2 rounded-lg font-bold text-sm';
        indicator.style.background = 'linear-gradient(135deg, #ec4899, #a855f7)';
        indicator.style.color = '#fff';
        indicator.innerText = '¡No tienes palabra!';
    } else if (typeof myRole === 'string') {
        console.log('Player word:', myRole);
        display.innerText = myRole;
        display.classList.remove('impostor');
        indicator.classList.remove('hidden');
        indicator.className = 'px-4 py-2 rounded-lg font-bold text-sm';
        indicator.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        indicator.style.color = '#fff';
        indicator.innerText = '¡No reveles tu palabra!';
    } else {
        console.log('ERROR: Invalid role:', myRole);
        display.innerText = '???';
        display.classList.remove('impostor');
        indicator.classList.remove('hidden');
        indicator.className = 'px-4 py-2 rounded-lg font-bold text-sm';
        indicator.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        indicator.style.color = '#fff';
        indicator.innerText = 'Error: Rol inválido';
    }
    
    console.log('Showing reveal screen...');
    showScreen('screen-reveal');
    console.log('Current screen should be screen-reveal');
});

function confirmReveal() {
    const display = document.getElementById('secret-word');
    if (display) display.classList.remove('impostor');
    socket.emit('role-revealed');
}

function handleRevealConfirm() {
    if (isLocalMode) {
        confirmLocalReveal();
    } else {
        confirmReveal();
    }
}

socket.on('next-player', (data) => {
    showScreen('screen-waiting');
    const msgEl = document.getElementById('waiting-message');
    if (msgEl) msgEl.textContent = `Jugador ${data.currentPlayer + 1} de ${data.totalPlayers} está viendo su rol...`;
});

socket.on('all-revealed', () => {
    showScreen('screen-playing');
    updateGameControls();
});

socket.on('timer-update', (data) => {
    const timerDisplay = document.getElementById('timer-display');
    const timerBar = document.getElementById('timer-bar');
    if (timerDisplay) {
        const mins = Math.floor(data.timeLeft / 60);
        const secs = data.timeLeft % 60;
        timerDisplay.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    if (timerBar) timerBar.style.width = `${(data.timeLeft / 120) * 100}%`;
});

socket.on('timer-ended', () => {
    showNotification('¡Tiempo agotado!');
});

function updateGameControls() {
    const hostControls = document.getElementById('host-controls');
    const playerControls = document.getElementById('player-controls');
    if (isHost) {
        if (hostControls) hostControls.classList.remove('hidden');
        if (playerControls) playerControls.classList.add('hidden');
    } else {
        if (hostControls) hostControls.classList.add('hidden');
        if (playerControls) playerControls.classList.remove('hidden');
    }
}

function startVoting() {
    socket.emit('start-voting');
}

socket.on('voting-started', (data) => {
    showScreen('screen-voting');
    renderVotingPlayers(data.players, data.votes);
});

function renderVotingPlayers(players, votes) {
    const container = document.getElementById('voting-players');
    if (!container) return;
    
    container.innerHTML = players.map(p => `
        <div class="vote-card ${p.hasVoted ? 'voted' : ''}" onclick="castVote('${p.name}')">
            <span class="font-bold">${p.name}</span>
            <span class="voted-badge">${votes[p.name] || 0} votos</span>
        </div>
    `).join('');
}

function castVote(playerName) {
    socket.emit('cast-vote', playerName);
}

socket.on('vote-cast', (data) => {
    renderVotingPlayers(data.voters, data.votes);
});

socket.on('game-results', (data) => {
    showScreen('screen-results');
    
    const resultEmoji = document.getElementById('result-emoji');
    const resultTitle = document.getElementById('result-title');
    
    if (data.isImpostorEliminated) {
        if (resultEmoji) resultEmoji.innerText = '🎉';
        if (resultTitle) {
            resultTitle.innerText = '¡GANARON LOS CIUDADANOS!';
            resultTitle.className = 'text-2xl font-black uppercase';
            resultTitle.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            resultTitle.style.webkitBackgroundClip = 'text';
            resultTitle.style.webkitTextFillColor = 'transparent';
            resultTitle.style.backgroundClip = 'text';
        }
        launchConfetti();
    } else {
        if (resultEmoji) resultEmoji.innerText = '😈';
        if (resultTitle) {
            resultTitle.innerText = '¡GANARON LOS IMPOSTORES!';
            resultTitle.className = 'text-2xl font-black uppercase';
            resultTitle.style.background = 'linear-gradient(135deg, #ec4899, #a855f7)';
            resultTitle.style.webkitBackgroundClip = 'text';
            resultTitle.style.webkitTextFillColor = 'transparent';
            resultTitle.style.backgroundClip = 'text';
        }
    }
    
    let content = `<p class="font-bold text-white">${data.eliminated} fue eliminado/a</p>`;
    content += `<p class="text-slate-400 text-xs">Recibió ${data.maxVotes} votos</p>`;
    
    content += `<p class="font-bold text-white mt-3">Impostores:</p>`;
    data.impostors.forEach(name => {
        content += `<p class="text-sm" style="color: #ec4899;">👤 ${name}</p>`;
    });
    
    content += `<p class="font-bold text-white mt-3">Palabra secreta:</p>`;
    content += `<p class="text-sm" style="color: #22c55e;">${data.secretWord}</p>`;
    
    const resultContent = document.getElementById('result-content');
    if (resultContent) resultContent.innerHTML = content;
});

function resetGame() {
    socket.emit('reset-game');
}

socket.on('game-reset', (data) => {
    isLocalMode = false;
    playersList = data.players;
    updatePlayersList();
    showScreen('screen-lobby');
    
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
        if (isHost) {
            startBtn.classList.remove('hidden');
        } else {
            startBtn.classList.add('hidden');
        }
    }
});

function leaveRoom() {
    isLocalMode = false;
    socket.emit('leave-room');
    showConnectScreen();
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.className = "fixed inset-0 flex items-center justify-center z-50 pointer-events-none";
    div.innerHTML = `<div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.875rem; box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);">${msg}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    container.innerHTML = '';
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#eab308'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
            pointer-events: none;
        `;
        container.appendChild(confetti);
    }
    
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
