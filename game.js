class PenaltyGame {
    constructor() {
        this.gameState = {
            currentScreen: 'start',
            gameCode: '',
            isHost: false,
            playerRole: 'kicker', // 'kicker' o 'goalkeeper'
            currentRound: 1,
            maxRounds: 5,
            playerScore: 0,
            opponentScore: 0,
            playerChoice: null,
            opponentChoice: null,
            isChoiceMade: false,
            timeLeft: 5,
            timer: null,
            roundInProgress: false
        };

        this.connection = null;
        this.peer = null;
        this.isConnected = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeP2P();
    }

    initializeElements() {
        // Pantallas
        this.screens = {
            start: document.getElementById('startScreen'),
            waiting: document.getElementById('waitingScreen'),
            game: document.getElementById('gameScreen'),
            result: document.getElementById('resultScreen')
        };

        // Botones
        this.buttons = {
            createGame: document.getElementById('createGameBtn'),
            joinGame: document.getElementById('joinGameBtn'),
            playAgain: document.getElementById('playAgainBtn')
        };

        // Inputs
        this.gameCodeInput = document.getElementById('gameCodeInput');

        // Elementos del juego
        this.gameElements = {
            gameCode: document.getElementById('gameCode'),
            playerRole: document.getElementById('playerRole'),
            playerScore: document.getElementById('playerScore'),
            opponentScore: document.getElementById('opponentScore'),
            countdown: document.getElementById('countdown'),
            currentRound: document.getElementById('currentRound'),
            roundResult: document.getElementById('roundResult'),
            actionTitle: document.getElementById('actionTitle'),
            choiceDisplay: document.getElementById('choiceDisplay'),
            goalkeeper: document.getElementById('goalkeeper'),
            ball: document.getElementById('ball'),
            finalPlayerScore: document.getElementById('finalPlayerScore'),
            finalOpponentScore: document.getElementById('finalOpponentScore'),
            winnerMessage: document.getElementById('winnerMessage')
        };

        // Botones de acción
        this.actionButtons = document.querySelectorAll('.action-btn');
    }

    setupEventListeners() {
        // Botones principales
        this.buttons.createGame.addEventListener('click', () => this.createGame());
        this.buttons.joinGame.addEventListener('click', () => this.showJoinGameInput());
        this.buttons.playAgain.addEventListener('click', () => this.resetGame());
        
        // Botón de reintentar conexión
        const retryBtn = document.getElementById('retryConnectionBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryConnection());
        }

        // Input de código
        this.gameCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });

        // Botones de acción del juego
        this.actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.gameState.roundInProgress || this.gameState.isChoiceMade) return;
                
                const direction = button.dataset.direction;
                this.makeChoice(direction);
            });
        });
    }

    initializeP2P() {
        // Configuración mejorada para PeerJS con servidores STUN
        const peerConfig = {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' }
                ]
            },
            debug: 2 // Activar logs para debugging
        };

        // Inicializar PeerJS con configuración mejorada (usando servidor público)
        this.peer = new Peer(peerConfig);
        
        this.peer.on('open', (id) => {
            console.log('Peer ID:', id);
            this.showConnectionStatus('Listo para conectar', 'success');
        });

        this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            this.handleConnectionError(err);
        });

        this.peer.on('disconnected', () => {
            console.log('Peer desconectado, intentando reconectar...');
            this.showConnectionStatus('Reconectando...', 'warning');
            setTimeout(() => {
                if (!this.peer.destroyed) {
                    this.peer.reconnect();
                }
            }, 1000);
        });
    }

    // Funciones de conexión
    createGame() {
        this.gameState.isHost = true;
        this.gameState.playerRole = 'kicker';
        this.gameState.gameCode = this.generateGameCode();
        
        this.gameElements.gameCode.textContent = this.gameState.gameCode;
        this.showScreen('waiting');
    }

    showJoinGameInput() {
        this.gameCodeInput.style.display = 'block';
        this.buttons.joinGame.textContent = 'Conectar';
        this.buttons.joinGame.onclick = () => this.joinGame();
        this.gameCodeInput.focus();
    }

    joinGame() {
        const code = this.gameCodeInput.value.trim().toUpperCase();
        if (!code) return;

        this.gameState.isHost = false;
        this.gameState.playerRole = 'goalkeeper';
        this.gameState.gameCode = code;
        
        this.connectToPeer(code);
    }

    connectToPeer(peerId) {
        this.showConnectionStatus('Conectando...', 'warning');
        
        const conn = this.peer.connect(peerId, {
            reliable: true,
            serialization: 'json'
        });
        
        // Timeout para conexión
        const connectionTimeout = setTimeout(() => {
            if (!this.isConnected) {
                this.showConnectionStatus('Timeout de conexión', 'error');
                conn.close();
            }
        }, 10000); // 10 segundos timeout
        
        conn.on('open', () => {
            clearTimeout(connectionTimeout);
            this.handleConnection(conn);
            this.sendMessage({ type: 'join', data: { joined: true } });
            this.showConnectionStatus('¡Conectado!', 'success');
        });

        conn.on('error', (err) => {
            clearTimeout(connectionTimeout);
            console.error('Connection error:', err);
            this.showConnectionStatus('Error de conexión', 'error');
            setTimeout(() => {
                alert('No se pudo conectar. Intenta con un código diferente o verifica tu conexión.');
            }, 500);
        });
    }

    handleIncomingConnection(conn) {
        this.handleConnection(conn);
        this.startGame();
    }

    handleConnection(conn) {
        this.connection = conn;
        this.isConnected = true;

        conn.on('data', (data) => {
            this.handleMessage(data);
        });

        conn.on('close', () => {
            this.isConnected = false;
            alert('Conexión perdida con el oponente');
            this.resetGame();
        });
    }

    sendMessage(message) {
        if (this.connection && this.connection.open) {
            this.connection.send(message);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'join':
                this.startGame();
                break;
            case 'choice':
                this.handleOpponentChoice(message.data);
                break;
            case 'nextRound':
                this.nextRound();
                break;
            case 'gameOver':
                this.endGame();
                break;
            case 'playAgain':
                this.resetGame();
                break;
        }
    }

    // Funciones del juego
    startGame() {
        this.showScreen('game');
        this.updateGameDisplay();
        this.startRound();
    }

    startRound() {
        this.gameState.roundInProgress = true;
        this.gameState.isChoiceMade = false;
        this.gameState.playerChoice = null;
        this.gameState.opponentChoice = null;
        this.gameState.timeLeft = 5;

        this.updateRoundDisplay();
        this.resetVisualElements();
        this.startTimer();
    }

    startTimer() {
        this.gameElements.countdown.textContent = this.gameState.timeLeft;
        
        this.gameState.timer = setInterval(() => {
            this.gameState.timeLeft--;
            this.gameElements.countdown.textContent = this.gameState.timeLeft;

            if (this.gameState.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    handleTimeUp() {
        clearInterval(this.gameState.timer);
        
        // Si el jugador no eligió, se asigna centro por defecto
        if (!this.gameState.isChoiceMade) {
            this.makeChoice('center');
        }
    }

    makeChoice(direction) {
        if (this.gameState.isChoiceMade) return;

        this.gameState.isChoiceMade = true;
        this.gameState.playerChoice = direction;

        // Marcar botón seleccionado
        this.actionButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.direction === direction) {
                btn.classList.add('selected');
            }
        });

        this.gameElements.choiceDisplay.textContent = `Tu elección: ${this.getDirectionText(direction)}`;

        // Enviar elección al oponente
        this.sendMessage({
            type: 'choice',
            data: { choice: direction }
        });

        // Verificar si ambos jugadores han elegido
        if (this.gameState.opponentChoice) {
            this.resolveRound();
        }
    }

    handleOpponentChoice(data) {
        this.gameState.opponentChoice = data.choice;
        
        // Verificar si ambos jugadores han elegido
        if (this.gameState.isChoiceMade) {
            this.resolveRound();
        }
    }

    resolveRound() {
        clearInterval(this.gameState.timer);
        
        const playerChoice = this.gameState.playerChoice;
        const opponentChoice = this.gameState.opponentChoice;
        
        let result;
        
        if (this.gameState.playerRole === 'kicker') {
            // El jugador patea, el oponente ataja
            result = this.calculateKickResult(playerChoice, opponentChoice);
        } else {
            // El jugador ataja, el oponente patea
            result = this.calculateKickResult(opponentChoice, playerChoice);
        }

        this.animateResult(result);
        this.updateScore(result);
        this.displayRoundResult(result);

        // Continuar después de la animación
        setTimeout(() => {
            this.gameState.currentRound++;
            
            if (this.gameState.currentRound > this.gameState.maxRounds) {
                this.endGame();
            } else {
                // Cambiar roles
                this.gameState.playerRole = this.gameState.playerRole === 'kicker' ? 'goalkeeper' : 'kicker';
                this.updateGameDisplay();
                this.startRound();
            }
        }, 3000);
    }

    calculateKickResult(kickDirection, saveDirection) {
        // Si el portero adivina la dirección, es parada
        if (kickDirection === saveDirection) {
            return 'save';
        } else {
            return 'goal';
        }
    }

    animateResult(result) {
        const goalkeeper = this.gameElements.goalkeeper;
        const ball = this.gameElements.ball;

        // Mover portero
        if (this.gameState.playerRole === 'goalkeeper') {
            goalkeeper.className = `goalkeeper ${this.gameState.playerChoice}`;
        } else {
            goalkeeper.className = `goalkeeper ${this.gameState.opponentChoice}`;
        }

        // Mover pelota
        if (this.gameState.playerRole === 'kicker') {
            ball.className = `ball ${this.gameState.playerChoice}`;
        } else {
            ball.className = `ball ${this.gameState.opponentChoice}`;
        }

        // Aplicar animación
        setTimeout(() => {
            if (result === 'goal') {
                ball.classList.add('goal-animation');
            } else {
                goalkeeper.classList.add('save-animation');
            }
        }, 500);
    }

    updateScore(result) {
        if (result === 'goal') {
            if (this.gameState.playerRole === 'kicker') {
                this.gameState.playerScore++;
            } else {
                this.gameState.opponentScore++;
            }
        } else {
            if (this.gameState.playerRole === 'goalkeeper') {
                this.gameState.playerScore++;
            } else {
                this.gameState.opponentScore++;
            }
        }

        this.gameElements.playerScore.textContent = this.gameState.playerScore;
        this.gameElements.opponentScore.textContent = this.gameState.opponentScore;
    }

    displayRoundResult(result) {
        let message;
        
        if (result === 'goal') {
            if (this.gameState.playerRole === 'kicker') {
                message = '⚽ ¡GOL! Anotaste';
            } else {
                message = '😞 Gol del oponente';
            }
        } else {
            if (this.gameState.playerRole === 'goalkeeper') {
                message = '🙌 ¡ATAJASTE! Gran parada';
            } else {
                message = '😅 El portero atajó tu disparo';
            }
        }

        this.gameElements.roundResult.textContent = message;
    }

    endGame() {
        this.showScreen('result');
        
        this.gameElements.finalPlayerScore.textContent = this.gameState.playerScore;
        this.gameElements.finalOpponentScore.textContent = this.gameState.opponentScore;

        let winnerMessage;
        if (this.gameState.playerScore > this.gameState.opponentScore) {
            winnerMessage = '🎉 ¡GANASTE! Eres el campeón de penales';
        } else if (this.gameState.playerScore < this.gameState.opponentScore) {
            winnerMessage = '😔 Perdiste... ¡Mejor suerte la próxima vez!';
        } else {
            winnerMessage = '🤝 ¡EMPATE! Ambos son grandes jugadores';
        }

        this.gameElements.winnerMessage.textContent = winnerMessage;
    }

    // Funciones de manejo de errores y conexión
    handleConnectionError(err) {
        let message = 'Error de conexión';
        
        if (err.type === 'network') {
            message = 'Error de red. Verifica tu conexión a internet.';
        } else if (err.type === 'peer-unavailable') {
            message = 'El código de partida no existe o el jugador no está disponible.';
        } else if (err.type === 'server-error') {
            message = 'Error del servidor. Intenta de nuevo en unos minutos.';
        } else if (err.type === 'socket-error') {
            message = 'Error de socket. Verifica tu conexión.';
        } else if (err.message && err.message.includes('Could not connect to peer')) {
            message = 'No se pudo conectar al oponente. Verifiquen su conexión.';
        }
        
        this.showConnectionStatus(message, 'error');
        
        // Mostrar botón de reintentar
        const retryBtn = document.getElementById('retryConnectionBtn');
        if (retryBtn) {
            retryBtn.style.display = 'block';
        }
        
        // No intentar reconectar automáticamente, esperar acción del usuario
        console.log('Error details:', err);
    }

    retryConnection() {
        // Ocultar botón de reintentar
        const retryBtn = document.getElementById('retryConnectionBtn');
        if (retryBtn) {
            retryBtn.style.display = 'none';
        }
        
        // Limpiar conexión anterior
        if (this.peer && !this.peer.destroyed) {
            this.peer.destroy();
        }
        
        this.showConnectionStatus('Reiniciando conexión...', 'warning');
        
        // Reinicializar P2P
        setTimeout(() => {
            this.isConnected = false;
            this.connection = null;
            this.initializeP2P();
            
            // Si estaba esperando, generar nuevo código
            if (this.gameState.currentScreen === 'waiting' && this.gameState.isHost) {
                setTimeout(() => {
                    this.gameState.gameCode = this.generateGameCode();
                    this.gameElements.gameCode.textContent = this.gameState.gameCode;
                    this.showConnectionStatus('Nuevo código generado', 'success');
                }, 1000);
            }
        }, 1000);
    }

    showConnectionStatus(message, type = 'info') {
        // Crear elemento de estado si no existe
        let statusElement = document.getElementById('connectionStatus');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'connectionStatus';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: bold;
                z-index: 1000;
                transition: all 0.3s ease;
                max-width: 300px;
                text-align: center;
            `;
            document.body.appendChild(statusElement);
        }
        
        // Configurar estilo según el tipo
        let backgroundColor, color;
        switch (type) {
            case 'success':
                backgroundColor = 'rgba(46, 204, 113, 0.9)';
                color = 'white';
                break;
            case 'error':
                backgroundColor = 'rgba(231, 76, 60, 0.9)';
                color = 'white';
                break;
            case 'warning':
                backgroundColor = 'rgba(243, 156, 18, 0.9)';
                color = 'white';
                break;
            default:
                backgroundColor = 'rgba(52, 152, 219, 0.9)';
                color = 'white';
        }
        
        statusElement.style.backgroundColor = backgroundColor;
        statusElement.style.color = color;
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        
        // Auto-ocultar después de 5 segundos (excepto errores)
        if (type !== 'error') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }

    // Funciones auxiliares
    updateGameDisplay() {
        const roleText = this.gameState.playerRole === 'kicker' ? 'Pateador' : 'Portero';
        this.gameElements.playerRole.textContent = `Tu rol: ${roleText}`;
        
        const actionText = this.gameState.playerRole === 'kicker' ? 
            'Elige dónde patear:' : 'Elige dónde atajar:';
        this.gameElements.actionTitle.textContent = actionText;
    }

    updateRoundDisplay() {
        this.gameElements.currentRound.textContent = this.gameState.currentRound;
        this.gameElements.roundResult.textContent = '';
        this.gameElements.choiceDisplay.textContent = '';
    }

    resetVisualElements() {
        this.gameElements.goalkeeper.className = 'goalkeeper';
        this.gameElements.ball.className = 'ball';
        
        this.actionButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = false;
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        this.screens[screenName].classList.add('active');
        this.gameState.currentScreen = screenName;
    }

    generateGameCode() {
        // Generar código más robusto evitando caracteres confusos
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    getDirectionText(direction) {
        const directions = {
            'left': 'Izquierda',
            'center': 'Centro',
            'right': 'Derecha'
        };
        return directions[direction] || direction;
    }

    resetGame() {
        // Limpiar timer
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }

        // Resetear estado
        this.gameState = {
            currentScreen: 'start',
            gameCode: '',
            isHost: false,
            playerRole: 'kicker',
            currentRound: 1,
            maxRounds: 5,
            playerScore: 0,
            opponentScore: 0,
            playerChoice: null,
            opponentChoice: null,
            isChoiceMade: false,
            timeLeft: 5,
            timer: null,
            roundInProgress: false
        };

        // Resetear UI
        this.gameCodeInput.style.display = 'none';
        this.buttons.joinGame.textContent = 'Unirse a Partida';
        this.buttons.joinGame.onclick = () => this.showJoinGameInput();
        this.gameCodeInput.value = '';

        // Mostrar pantalla de inicio
        this.showScreen('start');
    }
}

// Inicializar juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si PeerJS está disponible
    if (typeof Peer === 'undefined') {
        console.error('PeerJS no está disponible. Cargando desde CDN...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js';
        script.onload = () => {
            new PenaltyGame();
        };
        document.head.appendChild(script);
    } else {
        new PenaltyGame();
    }
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

// Manejar cierre de ventana
window.addEventListener('beforeunload', (e) => {
    if (window.penaltyGame && window.penaltyGame.isConnected) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Se perderá la conexión con tu oponente.';
    }
}); 