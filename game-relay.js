class PenaltyGameRelay {
    constructor() {
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
            roundInProgress: false,
            playerId: this.generatePlayerId()
        };

        this.connectionType = 'none'; // 'p2p', 'relay', 'none'
        this.peer = null;
        this.connection = null;
        this.firebaseRef = null;
        this.isConnected = false;
        this.processedMessages = new Set();
        this.relayPollInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.tryP2PFirst();
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

        this.actionButtons = document.querySelectorAll('.action-btn');
    }

    setupEventListeners() {
        this.buttons.createGame.addEventListener('click', () => this.createGame());
        this.buttons.joinGame.addEventListener('click', () => this.showJoinGameInput());
        this.buttons.playAgain.addEventListener('click', () => this.resetGame());

        this.gameCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });

        this.gameCodeInput.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase();
            e.target.value = value;
        });

        this.actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.gameState.roundInProgress || this.gameState.isChoiceMade) return;
                
                const direction = button.dataset.direction;
                this.makeChoice(direction);
            });
        });
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    tryP2PFirst() {
        this.showConnectionStatus('Intentando conexión P2P...', 'warning');
        
        try {
            this.peer = new Peer({
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                }
            });

            const p2pTimeout = setTimeout(() => {
                if (!this.peer.open) {
                    this.fallbackToRelay();
                }
            }, 8000);

            this.peer.on('open', (id) => {
                clearTimeout(p2pTimeout);
                this.connectionType = 'p2p';
                this.showConnectionStatus('✅ P2P Disponible', 'success');
                this.setupP2PListeners();
            });

            this.peer.on('error', (err) => {
                clearTimeout(p2pTimeout);
                console.log('P2P falló, usando relay...', err);
                this.fallbackToRelay();
            });

        } catch (error) {
            console.log('P2P no disponible, usando relay...', error);
            this.fallbackToRelay();
        }
    }

    fallbackToRelay() {
        this.connectionType = 'relay';
        this.showConnectionStatus('🔄 Usando servidor relay...', 'warning');
        this.initializeFirebase();
    }

    initializeFirebase() {
        // Simulamos Firebase con localStorage para esta demo
        // En producción, usarías Firebase real
        this.showConnectionStatus('✅ Relay Disponible', 'success');
    }

    setupP2PListeners() {
        this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
        });
    }

    // Funciones de conexión
    createGame() {
        this.gameState.isHost = true;
        this.gameState.playerRole = 'kicker';
        this.gameState.gameCode = this.generateGameCode();
        
        if (this.connectionType === 'p2p') {
            this.createP2PGame();
        } else {
            this.createRelayGame();
        }
        
        this.gameElements.gameCode.textContent = this.gameState.gameCode;
        this.showScreen('waiting');
    }

    createP2PGame() {
        // Lógica P2P original
        this.showConnectionStatus('Esperando conexión P2P...', 'warning');
    }

    createRelayGame() {
        this.showConnectionStatus('Sala creada en servidor relay', 'success');
        
        // Limpiar datos anteriores
        this.clearOldGames();
        
        // Simular sala en "servidor"
        const gameData = {
            host: this.gameState.playerId,
            guest: null,
            status: 'waiting',
            created: Date.now(),
            messages: {},
            lastUpdate: Date.now()
        };
        
        localStorage.setItem(`game_${this.gameState.gameCode}`, JSON.stringify(gameData));
        
        // Polling para esperar al otro jugador
        this.startWaitingForPlayer();
    }

    clearOldGames() {
        // Limpiar partidas antiguas (más de 5 minutos)
        const cutoff = Date.now() - (5 * 60 * 1000);
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('game_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    if (data.created < cutoff) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    startWaitingForPlayer() {
        const pollInterval = setInterval(() => {
            const gameData = JSON.parse(localStorage.getItem(`game_${this.gameState.gameCode}`) || '{}');
            
            if (gameData.guest && gameData.guest !== this.gameState.playerId) {
                clearInterval(pollInterval);
                this.isConnected = true;
                this.startGame();
            }
        }, 1000);

        // Timeout después de 2 minutos
        setTimeout(() => {
            clearInterval(pollInterval);
            if (!this.isConnected) {
                this.showConnectionStatus('Timeout esperando jugador', 'error');
            }
        }, 120000);
    }

    joinGame() {
        const code = this.gameCodeInput.value.trim().toUpperCase();
        
        if (!code || code.length !== 6) {
            this.showConnectionStatus('Código inválido', 'error');
            return;
        }

        this.gameState.isHost = false;
        this.gameState.playerRole = 'goalkeeper';
        this.gameState.gameCode = code;
        
        if (this.connectionType === 'p2p') {
            this.joinP2PGame(code);
        } else {
            this.joinRelayGame(code);
        }
    }

    joinP2PGame(code) {
        this.showConnectionStatus('Conectando via P2P...', 'warning');
        
        const conn = this.peer.connect(code);
        
        const timeout = setTimeout(() => {
            this.showConnectionStatus('P2P falló, probando relay...', 'warning');
            this.fallbackToRelay();
            setTimeout(() => this.joinRelayGame(code), 1000);
        }, 8000);

        conn.on('open', () => {
            clearTimeout(timeout);
            this.handleConnection(conn);
            this.sendMessage({ type: 'join', data: { joined: true } });
        });

        conn.on('error', () => {
            clearTimeout(timeout);
            this.showConnectionStatus('P2P falló, probando relay...', 'warning');
            this.fallbackToRelay();
            setTimeout(() => this.joinRelayGame(code), 1000);
        });
    }

    joinRelayGame(code) {
        this.showConnectionStatus('Conectando via relay...', 'warning');
        
        const gameData = JSON.parse(localStorage.getItem(`game_${code}`) || '{}');
        
        if (!gameData.host) {
            this.showConnectionStatus('Código no encontrado', 'error');
            return;
        }

        if (gameData.guest) {
            this.showConnectionStatus('Partida llena', 'error');
            return;
        }

        // Unirse a la partida
        gameData.guest = this.gameState.playerId;
        gameData.status = 'playing';
        localStorage.setItem(`game_${code}`, JSON.stringify(gameData));
        
        this.isConnected = true;
        this.connectionType = 'relay';
        this.showConnectionStatus('✅ Conectado via relay', 'success');
        this.startGame();
    }

    // Funciones P2P originales
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
            this.showConnectionStatus('Conexión perdida', 'error');
        });
    }

    sendMessage(message) {
        if (this.connectionType === 'p2p' && this.connection && this.connection.open) {
            this.connection.send(message);
        } else if (this.connectionType === 'relay') {
            this.sendRelayMessage(message);
        }
    }

    sendRelayMessage(message) {
        const gameKey = `game_${this.gameState.gameCode}`;
        const gameData = JSON.parse(localStorage.getItem(gameKey) || '{}');
        
        if (!gameData.messages) {
            gameData.messages = {};
        }
        
        const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        gameData.messages[messageId] = {
            from: this.gameState.playerId,
            message: message,
            timestamp: Date.now()
        };
        
        gameData.lastUpdate = Date.now();
        localStorage.setItem(gameKey, JSON.stringify(gameData));
        
        // Limpiar mensajes antiguos (más de 30 segundos)
        this.cleanupOldMessages(gameData);
    }

    cleanupOldMessages(gameData) {
        if (!gameData.messages) return;
        
        const cutoff = Date.now() - 30000; // 30 segundos
        const messagesToDelete = [];
        
        for (const [id, msg] of Object.entries(gameData.messages)) {
            if (msg.timestamp < cutoff) {
                messagesToDelete.push(id);
            }
        }
        
        messagesToDelete.forEach(id => {
            delete gameData.messages[id];
        });
        
        if (messagesToDelete.length > 0) {
            localStorage.setItem(`game_${this.gameState.gameCode}`, JSON.stringify(gameData));
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
            default:
                console.log('Mensaje recibido:', message);
        }
    }

    // Resto de funciones del juego (copiadas del original)
    startGame() {
        this.showScreen('game');
        this.updateGameDisplay();
        this.startRound();
        
        if (this.connectionType === 'relay') {
            this.startRelayPolling();
        }
    }

    startRelayPolling() {
        this.relayPollInterval = setInterval(() => {
            this.checkForRelayMessages();
        }, 500);
    }

    checkForRelayMessages() {
        const gameData = JSON.parse(localStorage.getItem(`game_${this.gameState.gameCode}`) || '{}');
        
        if (!gameData.messages) return;
        
        // Procesar mensajes nuevos
        for (const [messageId, messageData] of Object.entries(gameData.messages)) {
            if (messageData.from !== this.gameState.playerId && 
                !this.processedMessages.has(messageId)) {
                
                this.handleMessage(messageData.message);
                this.processedMessages.add(messageId);
            }
        }
        
        // Limpiar mensajes procesados antiguos
        this.cleanupProcessedMessages();
    }

    cleanupProcessedMessages() {
        if (!this.processedMessages) {
            this.processedMessages = new Set();
            return;
        }
        
        // Si hay demasiados mensajes procesados, limpiar
        if (this.processedMessages.size > 50) {
            const toKeep = Array.from(this.processedMessages).slice(-20);
            this.processedMessages = new Set(toKeep);
        }
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
        
        if (!this.gameState.isChoiceMade) {
            this.makeChoice('center');
        }
    }

    makeChoice(direction) {
        if (this.gameState.isChoiceMade) return;

        this.gameState.isChoiceMade = true;
        this.gameState.playerChoice = direction;

        this.actionButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.direction === direction) {
                btn.classList.add('selected');
            }
        });

        this.gameElements.choiceDisplay.textContent = `Tu elección: ${this.getDirectionText(direction)}`;

        this.sendMessage({
            type: 'choice',
            data: { choice: direction }
        });

        if (this.gameState.opponentChoice) {
            this.resolveRound();
        }
    }

    handleOpponentChoice(data) {
        this.gameState.opponentChoice = data.choice;
        
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
            result = this.calculateKickResult(playerChoice, opponentChoice);
        } else {
            result = this.calculateKickResult(opponentChoice, playerChoice);
        }

        this.animateResult(result);
        this.updateScore(result);
        this.displayRoundResult(result);

        setTimeout(() => {
            this.gameState.currentRound++;
            
            if (this.gameState.currentRound > this.gameState.maxRounds) {
                this.endGame();
            } else {
                this.gameState.playerRole = this.gameState.playerRole === 'kicker' ? 'goalkeeper' : 'kicker';
                this.updateGameDisplay();
                this.startRound();
            }
        }, 3000);
    }

    calculateKickResult(kickDirection, saveDirection) {
        return kickDirection === saveDirection ? 'save' : 'goal';
    }

    animateResult(result) {
        const goalkeeper = this.gameElements.goalkeeper;
        const ball = this.gameElements.ball;

        if (this.gameState.playerRole === 'goalkeeper') {
            goalkeeper.className = `goalkeeper ${this.gameState.playerChoice}`;
            ball.className = `ball ${this.gameState.opponentChoice}`;
        } else {
            goalkeeper.className = `goalkeeper ${this.gameState.opponentChoice}`;
            ball.className = `ball ${this.gameState.playerChoice}`;
        }
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
        
        // Limpiar polling de relay
        if (this.relayPollInterval) {
            clearInterval(this.relayPollInterval);
        }
        
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

    showJoinGameInput() {
        this.gameCodeInput.style.display = 'block';
        this.buttons.joinGame.textContent = 'Conectar';
        this.buttons.joinGame.onclick = () => this.joinGame();
        this.gameCodeInput.focus();
    }

    generateGameCode() {
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

    showConnectionStatus(message, type = 'info') {
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
        
        if (type !== 'error') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }

    resetGame() {
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        
        if (this.relayPollInterval) {
            clearInterval(this.relayPollInterval);
        }

        // Limpiar mensajes procesados
        this.processedMessages = new Set();

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
            roundInProgress: false,
            playerId: this.generatePlayerId()
        };

        this.gameCodeInput.style.display = 'none';
        this.buttons.joinGame.textContent = 'Unirse a Partida';
        this.buttons.joinGame.onclick = () => this.showJoinGameInput();
        this.gameCodeInput.value = '';

        this.showScreen('start');
    }
}

// Inicializar juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Peer === 'undefined') {
        console.error('PeerJS no está disponible. Cargando desde CDN...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js';
        script.onload = () => {
            new PenaltyGameRelay();
        };
        document.head.appendChild(script);
    } else {
        new PenaltyGameRelay();
    }
}); 