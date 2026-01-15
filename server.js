const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Room storage
const rooms = new Map();

// Generate short room code
function generateRoomCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Room code endpoint
app.get('/api/new-room', (req, res) => {
    let code;
    do {
        code = generateRoomCode();
    } while (rooms.has(code));
    
    rooms.set(code, {
        code,
        players: [],
        host: null,
        gameState: 'lobby', // lobby, revealing, playing, voting, results
        currentPlayer: 0,
        wordBank: {
            general: ["Pizza", "París", "iPhone", "Fútbol", "Elefante", "Netflix", "Guitarra", "Dinosaurio", "Chocolate", "Tiburón", "Espada", "Marte", "Cine", "Hamburguesa", "Avión", "Batman", "Zombi", "Minecraft", "Sushi", "Playa", "Robot", "Nube", "Fuego", "Hielo", "Luna", "Sol", "Estrella", "Teléfono", "Reloj", "Cerveza", "Gato", "Perro", "Pájaro", "Coche", "Casa", "Libro", "Agua", "Tierra", "Viento", "Música", "Danza"],
            peliculas: ["Matrix", "Titanic", "Avatar", "Gladiador", "Frozen", "Toy Story", "Jurassic Park", "El Rey León", "Volver al Futuro", "Star Wars", "Harry Potter", "El Señor de los Anillos", "Spider-Man", "Iron Man", "Batman", "Terminator", "Alien", "Depredador", "Jaws", "Psicosis", "Inception", "Interstellar", "Coco", "Encanto", "Moana", "Buscando a Nemo", "Los Increíbles", "Shrek", "Mi Villano Favorito", "Minions", "Piratas del Caribe", "El Mago de Oz", "E.T.", "Tibbie", "Forrest Gump", "Pulp Fiction"],
            paises: ["España", "Francia", "Italia", "Alemania", "Japón", "Brasil", "Argentina", "México", "Canadá", "Estados Unidos", "China", "India", "Australia", "Egipto", "Grecia", "Rusia", "Inglaterra", "Portugal", "Colombia", "Perú", "Chile", "Uruguay", "Venezuela", "Cuba", "Corea", "Tailandia", "Vietnam", "Marruecos", "Turquía", "Noruega", "Suecia", "Finlandia", "Dinamarca", "Holanda", "Bélgica", "Suiza", "Austria", "Irlanda", "Escocia"],
            comida: ["Tacos", "Paella", "Sushi", "Pizza", "Hamburguesa", "Lasaña", "Curry", "Ramen", "Ceviche", "Empanadas", "Churrasco", "Milanesa", "Feijoada", "Bandeja Paisa", "Arepa", "Patacón", "Causa", "Anticuchos", "Chicha", "Pisco Sour", "Guisado", "Tamales", "Pupusas", "Chimichanga", "Enchiladas", "Tostada", "Gordita", "Quesadilla", "Burrito", "Taco", "Pasta", "Risotto", "Paella", "Tortilla", "Croissant", "Bagel", "Donut", "Cupcake", "Brownie"],
            tecnologia: ["Computadora", "Internet", "Inteligencia Artificial", "Robot", "Aplicación", "Videojuego", "Redes Sociales", "Smartphone", "Tablet", "Wifi", "Bluetooth", "Nube", "Big Data", "Ciberseguridad", "Blockchain", "Criptomoneda", "Realidad Virtual", "Realidad Aumentada", "Drone", "Impresora 3D", "GPS", "Sensor", "Pantalla Táctil", "Procesador", "Memoria", "Disco Duro", "Batería", "Cargador", "Cable", "Auriculares", "Teclado", "Mouse", "Cámara", "Micrófono", "Altavoz", "Router", "Módem", "Servidor", "Base de Datos"],
            deportes: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Atletismo", "Béisbol", "Fútbol Americano", "Voleibol", "Boxeo", "Artes Marciales", "Gimnasia", "Ciclismo", "Esquí", "Surf", "Escalada", "Golf", "Hockey", "Rugby", "Críquet", "Ping Pong", "Bádminton", "Patinaje", "Lucha", "Carrera", "Maratón", "Triatlón", "Equitación", "Tiro", "Arquería", "Lacrosse", "Handball", "Waterpolo", "Remo", "Piragüismo", "Snowboard", "Skateboard", "BMX", "Wrestling"],
            animales: ["León", "Tigre", "Elefante", "Jirafa", "Mono", "Conejo", "Perro", "Gato", "Pájaro", "Pez", "Delfín", "Ballena", "Tiburón", "Serpiente", "Lagarto", "Rana", "Tortuga", "Cocodrilo", "Hipopótamo", "Rinoceronte", "Zebra", "Caballo", "Vaca", "Cerdo", "Oveja", "Gallo", "Pato", "Águila", "Búho", "Murciélago", "Lobo", "Zorro", "Oso", "Panda", "Koala", "Canguro", "Pingüino", "Foca", "Ballena", "Pulpo"],
            colores: ["Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado", "Rosa", "Negro", "Blanco", "Gris", "Marrón", "Beige", "Celeste", "Turquesa", "Violeta", "Lila", "Dorado", "Plateado", "Cyan", "Magenta", "Oscuro", "Claro", "Brillante", "Opaco", "Neón", "Pastel", "Matizado", "Sólido", "Transparente", "Opaco", "Carmesí", "Escarlata", "Grisáceo", "Azulado", "Verdoso", "Amarillento", "Anaranjado"]
        },
        selectedCategory: 'general',
        impostorCount: 1,
        secretWord: null,
        playerRoles: [],
        votes: {},
        timeLeft: 120,
        timerRunning: false,
        timerInterval: null
    });
    
    res.json({ code });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    let currentRoom = null;
    let playerName = null;

    // Create room
    socket.on('create-room', (name) => {
        const room = rooms.get(socket.roomCode);
        if (!room) return;

        playerName = name.trim();
        if (!playerName) {
            socket.emit('error', 'Nombre inválido');
            return;
        }

        // Check if name already exists in room
        const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (existingPlayer) {
            socket.emit('error', 'Este nombre ya está en uso');
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            role: null,
            hasVoted: false,
            revealed: false
        };

        room.players.push(player);
        room.host = socket.id;
        socket.join(room.code);
        currentRoom = room.code;

        socket.emit('room-joined', {
            code: room.code,
            players: room.players.map(p => ({ id: p.id, name: p.name, isHost: p.id === room.host })),
            isHost: true,
            gameState: room.gameState
        });

        io.to(room.code).emit('players-updated', room.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            isHost: p.id === room.host 
        })));
    });

    // Join room
    socket.on('join-room', ({ code, name }) => {
        const room = rooms.get(code.toUpperCase());
        
        if (!room) {
            socket.emit('error', 'La sala no existe');
            return;
        }

        if (room.gameState !== 'lobby') {
            socket.emit('error', 'El juego ya comenzó');
            return;
        }

        if (room.players.length >= 12) {
            socket.emit('error', 'La sala está llena (máx. 12 jugadores)');
            return;
        }

        playerName = name.trim();
        if (!playerName) {
            socket.emit('error', 'Nombre inválido');
            return;
        }

        const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (existingPlayer) {
            socket.emit('error', 'Este nombre ya está en uso');
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            role: null,
            hasVoted: false,
            revealed: false
        };

        room.players.push(player);
        socket.join(room.code);
        currentRoom = room.code;

        socket.emit('room-joined', {
            code: room.code,
            players: room.players.map(p => ({ id: p.id, name: p.name, isHost: p.id === room.host })),
            isHost: false,
            gameState: room.gameState
        });

        io.to(room.code).emit('players-updated', room.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            isHost: p.id === room.host 
        })));
    });

    // Update settings (host only)
    socket.on('update-settings', ({ category, impostorCount }) => {
        const room = rooms.get(currentRoom);
        if (!room || room.host !== socket.id) return;

        if (category) room.selectedCategory = category;
        if (impostorCount) room.impostorCount = impostorCount;

        socket.emit('settings-updated', {
            category: room.selectedCategory,
            impostorCount: room.impostorCount
        });
    });

    // Start game (host only)
    socket.on('start-game', () => {
        const room = rooms.get(currentRoom);
        if (!room || room.host !== socket.id) return;
        if (room.players.length < 3) {
            socket.emit('error', 'Se necesitan al menos 3 jugadores');
            return;
        }

        // Assign roles
        const words = room.wordBank[room.selectedCategory];
        room.secretWord = words[Math.floor(Math.random() * words.length)];
        
        room.playerRoles = new Array(room.players.length).fill(room.secretWord);
        
        let impostors = new Set();
        while(impostors.size < room.impostorCount) {
            impostors.add(Math.floor(Math.random() * room.players.length));
        }
        
        impostors.forEach(idx => {
            room.playerRoles[idx] = { word: "IMPOSTOR", isImpostor: true };
        });

        // Reset player states
        room.players.forEach((p, idx) => {
            p.role = room.playerRoles[idx];
            p.hasVoted = false;
            p.revealed = false;
        });

        room.gameState = 'revealing';
        room.currentPlayer = 0;
        room.votes = {};
        room.players.forEach(p => room.votes[p.name] = 0);
        room.timeLeft = 120;
        room.timerRunning = false;
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
        }

        io.to(room.code).emit('game-started', {
            currentPlayer: room.currentPlayer,
            players: room.players.map(p => ({ id: p.id, name: p.name, isHost: p.id === room.host }))
        });

        // Send role to each player
        room.players.forEach(player => {
            io.to(player.id).emit('your-role', {
                role: player.role,
                currentPlayer: room.currentPlayer,
                totalPlayers: room.players.length
            });
        });
    });

    // Player revealed their role
    socket.on('role-revealed', () => {
        const room = rooms.get(currentRoom);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        player.revealed = true;

        // Check if all players have revealed
        const allRevealed = room.players.every(p => p.revealed);
        
        if (allRevealed) {
            room.gameState = 'playing';
            room.timerRunning = true;
            room.timerInterval = setInterval(() => {
                room.timeLeft--;
                io.to(room.code).emit('timer-update', {
                    timeLeft: room.timeLeft,
                    timerRunning: room.timerRunning
                });
                if (room.timeLeft <= 0) {
                    clearInterval(room.timerInterval);
                    room.timerRunning = false;
                    io.to(room.code).emit('timer-ended');
                }
            }, 1000);

            io.to(room.code).emit('all-revealed');
        } else {
            room.currentPlayer++;
            io.to(room.code).emit('next-player', {
                currentPlayer: room.currentPlayer,
                totalPlayers: room.players.length
            });

            // Send role to next player
            const nextPlayer = room.players[room.currentPlayer];
            if (nextPlayer) {
                io.to(nextPlayer.id).emit('your-role', {
                    role: nextPlayer.role,
                    currentPlayer: room.currentPlayer,
                    totalPlayers: room.players.length
                });
            }
        }
    });

    // Cast vote
    socket.on('cast-vote', (playerName) => {
        const room = rooms.get(currentRoom);
        if (!room || room.gameState !== 'voting') return;

        const voter = room.players.find(p => p.id === socket.id);
        if (!voter || voter.hasVoted) return;

        voter.hasVoted = true;
        if (room.votes[playerName] !== undefined) {
            room.votes[playerName]++;
        }

        io.to(room.code).emit('vote-cast', {
            voters: room.players.map(p => ({ name: p.name, hasVoted: p.hasVoted })),
            votes: room.votes
        });

        // Check if all have voted
        const allVoted = room.players.every(p => p.hasVoted);
        if (allVoted) {
            room.gameState = 'results';
            clearInterval(room.timerInterval);
            
            // Calculate results
            let maxVotes = 0;
            let eliminated = null;
            Object.entries(room.votes).forEach(([name, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    eliminated = name;
                }
            });

            const isImpostorEliminated = room.players.find(p => p.name === eliminated)?.role?.isImpostor;
            const impostors = room.players.filter(p => p.role?.isImpostor).map(p => p.name);

            io.to(room.code).emit('game-results', {
                eliminated,
                maxVotes,
                isImpostorEliminated,
                impostors,
                secretWord: room.secretWord,
                votes: room.votes
            });
        }
    });

    // Start voting phase (host only)
    socket.on('start-voting', () => {
        const room = rooms.get(currentRoom);
        if (!room || room.host !== socket.id) return;

        room.gameState = 'voting';
        room.players.forEach(p => p.hasVoted = false);

        io.to(room.code).emit('voting-started', {
            players: room.players.map(p => ({ name: p.name, hasVoted: p.hasVoted })),
            votes: room.votes
        });
    });

    // Reset game (host only)
    socket.on('reset-game', () => {
        const room = rooms.get(currentRoom);
        if (!room || room.host !== socket.id) return;

        room.gameState = 'lobby';
        room.currentPlayer = 0;
        room.secretWord = null;
        room.playerRoles = [];
        room.votes = {};
        room.timeLeft = 120;
        room.timerRunning = false;
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
        }

        room.players.forEach(p => {
            p.role = null;
            p.hasVoted = false;
            p.revealed = false;
        });

        io.to(room.code).emit('game-reset', {
            players: room.players.map(p => ({ id: p.id, name: p.name, isHost: p.id === room.host }))
        });
    });

    // Leave room
    socket.on('leave-room', () => {
        handleDisconnect();
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        handleDisconnect();
    });

    function handleDisconnect() {
        if (!currentRoom) return;
        
        const room = rooms.get(currentRoom);
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex === -1) return;

        const playerName = room.players[playerIndex].name;
        room.players.splice(playerIndex, 1);

        // If host left, assign new host
        if (room.host === socket.id && room.players.length > 0) {
            room.host = room.players[0].id;
        }

        // If room is empty, delete it
        if (room.players.length === 0) {
            if (room.timerInterval) {
                clearInterval(room.timerInterval);
            }
            rooms.delete(currentRoom);
        } else {
            io.to(room.code).emit('players-updated', room.players.map(p => ({ 
                id: p.id, 
                name: p.name, 
                isHost: p.id === room.host 
            })));
        }

        socket.leave(currentRoom);
        currentRoom = null;
        playerName = null;
    }
});

httpServer.listen(PORT, () => {
    console.log(`🚀 El Impostor server running on http://localhost:${PORT}`);
    console.log(`📱 Landing: http://localhost:${PORT}/`);
    console.log(`🎮 Game: http://localhost:${PORT}/game`);
});
