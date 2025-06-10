const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Constantes do jogo
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 5,
    PLAYER_RADIUS: 22,
    QUESTION_DURATION: 20,
    PAUSE_BETWEEN_QUESTIONS: 10,
    INITIAL_DELAY: 20,
    
    // Física melhorada
    COLLISION_RESTITUTION: 0.8,
    COLLISION_DAMPING: 0.95,
    FRICTION: 0.88,
    MIN_VELOCITY: 0.05,
    MAX_VELOCITY: 12,
    ACCELERATION: 0.4,
    WALL_RESTITUTION: 4,
    
    SEPARATION_ITERATIONS: 3000,
    MIN_SEPARATION_DISTANCE: 0.5,
};

// Áreas de resposta no canvas
const ANSWER_AREAS = {
    TOP_LEFT: { x: 0, y: 0, width: 400, height: 300, answer: 'A' },
    TOP_RIGHT: { x: 400, y: 0, width: 400, height: 300, answer: 'B' },
    BOTTOM_LEFT: { x: 0, y: 300, width: 400, height: 300, answer: 'C' },
    BOTTOM_RIGHT: { x: 400, y: 300, width: 400, height: 300, answer: 'D' }
};

// Lista de jogadores e estado do jogo
let players = [];
let gameState = {
    currentQuestionIndex: 0,
    currentQuestion: null,
    isQuestionActive: false,
    isPaused: false,
    timer: null,
    questions: [
        {
            text: "Qual é a melhor forma de usar IA ?",
            options: { A: "Pedindo para gerar códigos complexos e com muitas linhas", B: "dando instruções simples para resolver um problema de cada coisa", C: "copiar e colar o script inteiro pronto", D: "Pedir tarefas confusas e difíceis de entender" },
            correctAnswer: 'C',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
        {
            text: "Na história bíblica, quantos pares de cada animal Moisés colocou na arca para salvar os animais do dilúvio?",
            options: { A: "2", B: "1", C: "7", D: "Nenhum" },
            correctAnswer: 'D',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
        {
            text: "O que significa IA",
            options: { A: "Artificial Inteligence", B: "Inteligência Artificial", C: "Inteligência das Artimanhas", D: "Iteraction Analyzer" },
            correctAnswer: 'B',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Um fazendeiro tem um galo de briga muito esperto que sempre sobe no topo do telhado da casa. Se esse galo botar um ovo lá em cima, para que lado o ovo vai rolar?",
            options: { A: "Para a esquerda", B: "Para a direita", C: "Para baixo", D: "Que ovo ?" },
            correctAnswer: 'D',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Para que serve o Google?",
            options: { A: "Ingrediente para receita de bolo", B: "Para buscar informações na internet", C: "Para fazer compras online", D: "Hackear a NASA" },
            correctAnswer: 'B',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Um avião estava voando de São Paulo para Buenos Aires quando teve problemas e caiu exatamente na linha da fronteira entre Brasil e Argentina. Onde devem ser enterrados os sobreviventes do acidente?",
            options: { A: "No Brasil", B: "Na Argentina", C: "Metade em cada país", D: "Não devem ser enterrados" },
            correctAnswer: 'D',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "A IA é prejudicial para a sociedade?",
            options: { A: "Sim, é muito perigosa", B: "Não, é benéfica", C: "Depende do uso", D: "Não sei, só sei que uso" },
            correctAnswer: 'C',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Estamos no meio do ano e você precisa planejar o calendário. Quantos meses do ano têm 28 dias no próximo ano?",
            options: { A: "Apenas 1 mês", B: "Mais de 6 meses", C: "6 meses", D: "2 meses" },
            correctAnswer: 'B',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "O que você pode quebrar sem nunca ter tocado nele(a)?",
            options: { A: "Um espelho", B: "Um ovo", C: "Uma promessa", D: "Um galho de árvore" },
            correctAnswer: 'C',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Quem criou a Microsoft ?",
            options: { A: "Bill Gates", B: "Bob Marley", C: "Robério Alencar", D: "Jotaro Kujo" },
            correctAnswer: 'A',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Na aula de física, o professor Erasmo pergunta: em uma balança de precisão, o que pesa mais - 1 quilograma de algodão ou 1 quilograma de ferro ?",
            options: { A: "1 kg de ferro", B: "1 kg de algodão", C: "Ambos pesam igual", D: "Depende da gravidade" },
            correctAnswer: 'C',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "O que tem dentes mas não come?",
            options: { A: "Uma dentadura", B: "Um banguela", C: "Um boneco", D: "Uma estátua" },
            correctAnswer: 'A',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "O que é um computador?",
            options: { A: "Uma máquina de destruição", B: "Um PC", C: "Qualquer aparelho eletrônico", D: "Um tipo de televisão" },
            correctAnswer: 'C',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Pedro estava acampando e entrou numa cabana completamente escura. Ele tinha uma caixa de fósforos, uma vela, uma lamparina a óleo e lenha para a lareira. O que Pedro deve acender primeiro para iluminar o ambiente?",
            options: { A: "A vela", B: "A lamparina", C: "Um parquinho", D: "O fósforo" },
            correctAnswer: 'D',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                {
            text: "Qual é o maior planeta do sistema solar?",
            options: { A: "Terra", B: "Júpiter", C: "Sol", D: "Netuno" },
            correctAnswer: 'B',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
                   {
            text: "Três gerações da família Silva foram pescar juntas: o avô Carlos, seu filho Roberto e o neto Miguel. Cada pessoa pescou exatamente um peixe, mas quando contaram, só havia 3 peixes no total. Como isso é possível?",
            options: { A: "Um peixe escapou", B: "Eles contaram errado", C: "São apenas 3 pessoas", D: "Dividiram os peixes" },
            correctAnswer: 'C',
            duration: GAME_CONFIG.QUESTION_DURATION
        },
        {
            text: "Para que serve o TikTok?",
            options: { A: "Fazer dancinha", B: "Criar e assistir vídeos curtos", C: "Estudar", D: "Debuggar uma rede LAN" },
            correctAnswer: 'B',
            duration: GAME_CONFIG.QUESTION_DURATION
        }
    ]
};

// Classe para gerenciar física de colisões
class PhysicsEngine {
    static calculateDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static normalizeVector(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }

    static clampVelocity(velocity, maxVel = GAME_CONFIG.MAX_VELOCITY) {
        const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (magnitude > maxVel) {
            const scale = maxVel / magnitude;
            return { x: velocity.x * scale, y: velocity.y * scale };
        }
        return velocity;
    }

    static resolvePlayerSeparation() {
        for (let iteration = 0; iteration < GAME_CONFIG.SEPARATION_ITERATIONS; iteration++) {
            let hasOverlap = false;
            
            for (let i = 0; i < players.length; i++) {
                for (let j = i + 1; j < players.length; j++) {
                    const p1 = players[i];
                    const p2 = players[j];
                    
                    const distance = this.calculateDistance(p1, p2);
                    const minDistance = GAME_CONFIG.PLAYER_RADIUS * 2;
                    
                    if (distance < minDistance - GAME_CONFIG.MIN_SEPARATION_DISTANCE) {
                        hasOverlap = true;
                        const overlap = minDistance - distance;
                        
                        let dx = p2.x - p1.x;
                        let dy = p2.y - p1.y;
                        
                        if (distance < 0.001) {
                            const angle = Math.random() * Math.PI * 2;
                            dx = Math.cos(angle);
                            dy = Math.sin(angle);
                        } else {
                            dx /= distance;
                            dy /= distance;
                        }
                        
                        const separation = overlap * 0.5;
                        p1.x -= dx * separation;
                        p1.y -= dy * separation;
                        p2.x += dx * separation;
                        p2.y += dy * separation;
                        
                        this.constrainToBounds(p1);
                        this.constrainToBounds(p2);
                    }
                }
            }
            
            if (!hasOverlap) break;
        }
    }

    static handlePlayerCollisions() {
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                const p1 = players[i];
                const p2 = players[j];
                
                const distance = this.calculateDistance(p1, p2);
                const minDistance = GAME_CONFIG.PLAYER_RADIUS * 2;
                
                if (distance < minDistance && distance > 0.001) {
                    const dx = (p2.x - p1.x) / distance;
                    const dy = (p2.y - p1.y) / distance;
                    
                    const v1x = p1.velocityX || 0;
                    const v1y = p1.velocityY || 0;
                    const v2x = p2.velocityX || 0;
                    const v2y = p2.velocityY || 0;
                    
                    const relativeVelX = v1x - v2x;
                    const relativeVelY = v1y - v2y;
                    const relativeVelNormal = relativeVelX * dx + relativeVelY * dy;
                    
                    if (relativeVelNormal > 0) continue;
                    
                    const impulse = -2 * relativeVelNormal * GAME_CONFIG.COLLISION_RESTITUTION;
                    const impulseX = impulse * dx;
                    const impulseY = impulse * dy;
                    
                    p1.velocityX = (v1x + impulseX) * GAME_CONFIG.COLLISION_DAMPING;
                    p1.velocityY = (v1y + impulseY) * GAME_CONFIG.COLLISION_DAMPING;
                    p2.velocityX = (v2x - impulseX) * GAME_CONFIG.COLLISION_DAMPING;
                    p2.velocityY = (v2y - impulseY) * GAME_CONFIG.COLLISION_DAMPING;
                    
                    const v1Clamped = this.clampVelocity({ x: p1.velocityX, y: p1.velocityY });
                    const v2Clamped = this.clampVelocity({ x: p2.velocityX, y: p2.velocityY });
                    
                    p1.velocityX = v1Clamped.x;
                    p1.velocityY = v1Clamped.y;
                    p2.velocityX = v2Clamped.x;
                    p2.velocityY = v2Clamped.y;
                    
                    p1.lastCollisionTime = Date.now();
                    p2.lastCollisionTime = Date.now();
                }
            }
        }
    }

    static constrainToBounds(player) {
        const radius = GAME_CONFIG.PLAYER_RADIUS;
        
        if (player.x < radius) {
            player.x = radius;
        } else if (player.x > GAME_CONFIG.CANVAS_WIDTH - radius) {
            player.x = GAME_CONFIG.CANVAS_WIDTH - radius;
        }
        
        if (player.y < radius) {
            player.y = radius;
        } else if (player.y > GAME_CONFIG.CANVAS_HEIGHT - radius) {
            player.y = GAME_CONFIG.CANVAS_HEIGHT - radius;
        }
    }

    static handleWallCollisions() {
        players.forEach(player => {
            const radius = GAME_CONFIG.PLAYER_RADIUS;
            const restitution = GAME_CONFIG.WALL_RESTITUTION;
            
            if (player.x < radius) {
                player.x = radius;
                if (player.velocityX < 0) {
                    player.velocityX = -player.velocityX * restitution;
                }
            }
            
            if (player.x > GAME_CONFIG.CANVAS_WIDTH - radius) {
                player.x = GAME_CONFIG.CANVAS_WIDTH - radius;
                if (player.velocityX > 0) {
                    player.velocityX = -player.velocityX * restitution;
                }
            }
            
            if (player.y < radius) {
                player.y = radius;
                if (player.velocityY < 0) {
                    player.velocityY = -player.velocityY * restitution;
                }
            }
            
            if (player.y > GAME_CONFIG.CANVAS_HEIGHT - radius) {
                player.y = GAME_CONFIG.CANVAS_HEIGHT - radius;
                if (player.velocityY > 0) {
                    player.velocityY = -player.velocityY * restitution;
                }
            }
        });
    }

    static updatePhysics() {
        if (gameState.isPaused) return;
        players.forEach(player => {
            player.x += player.velocityX || 0;
            player.y += player.velocityY || 0;
            
            if (player.velocityX) {
                player.velocityX *= GAME_CONFIG.FRICTION;
                if (Math.abs(player.velocityX) < GAME_CONFIG.MIN_VELOCITY) {
                    player.velocityX = 0;
                }
            }
            
            if (player.velocityY) {
                player.velocityY *= GAME_CONFIG.FRICTION;
                if (Math.abs(player.velocityY) < GAME_CONFIG.MIN_VELOCITY) {
                    player.velocityY = 0;
                }
            }
        });
        
        this.handleWallCollisions();
        this.resolvePlayerSeparation();
        this.handlePlayerCollisions();
    }
}

// Loop de física executado a 60 FPS
function startPhysicsLoop() {
    setInterval(() => {
        if (players.length > 0) {
            PhysicsEngine.updatePhysics();
            io.emit('updatePlayers', players);
        }
    }, 1000 / 60);
}

// Função para determinar em qual área o jogador está
function getPlayerArea(x, y) {
    for (const [key, area] of Object.entries(ANSWER_AREAS)) {
        if (x >= area.x && x < area.x + area.width && 
            y >= area.y && y < area.y + area.height) {
            return area.answer;
        }
    }
    return null;
}

// Função para enviar nova pergunta
function sendNewQuestion() {
    if (gameState.isPaused) return;
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        gameState.currentQuestionIndex = 0;
    }
    
    gameState.currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    gameState.isQuestionActive = true;
    
    io.emit('newQuestion', gameState.currentQuestion);
    
    let timeLeft = gameState.currentQuestion.duration;
    gameState.timer = setInterval(() => {
        if (gameState.isPaused) return;
        timeLeft--;
        io.emit('updateTimer', timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(gameState.timer);
            gameState.isQuestionActive = false;
            checkAnswers();
            gameState.currentQuestionIndex++;
            
            setTimeout(() => {
                sendNewQuestion();
            }, GAME_CONFIG.PAUSE_BETWEEN_QUESTIONS * 1000);
        }
    }, 1000);
}

// Verifica respostas dos jogadores
function checkAnswers() {
    const results = players.map(player => {
        const playerArea = getPlayerArea(player.x, player.y);
        const isCorrect = playerArea === gameState.currentQuestion.correctAnswer;
        
        if (isCorrect) {
            player.score += 10;
        } else if (playerArea !== null) {
            player.lives = Math.max(0, player.lives - 1);
        }
        
        return { 
            id: player.id, 
            isCorrect, 
            playerAnswer: playerArea,
            correctAnswer: gameState.currentQuestion.correctAnswer,
            lives: player.lives
        };
    });
    
    // Verifica jogadores eliminados
    const eliminatedPlayers = players.filter(player => player.lives === 0);
    eliminatedPlayers.forEach(player => {
        io.emit('playerEliminated', { id: player.id, name: player.name });
    });
    
    players = players.filter(player => player.lives > 0);
    
    io.emit('updatePlayers', players);
    io.emit('questionResult', results);
}

// Manipula conexões de jogadores
io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    socket.on('join', (data) => {
        const userType = data.userType;
        if (userType === 'admin') {
            socket.emit('updatePlayers', players);
            if (gameState.currentQuestion && gameState.isQuestionActive) {
                socket.emit('newQuestion', gameState.currentQuestion);
                socket.emit('updateTimer', gameState.currentQuestion.duration);
            }
            socket.emit('gameState', { isPaused: gameState.isPaused });
            return;
        }

        let x, y;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            x = GAME_CONFIG.PLAYER_RADIUS + Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_RADIUS * 2);
            y = GAME_CONFIG.PLAYER_RADIUS + Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_RADIUS * 2);
            attempts++;
        } while (attempts < maxAttempts && players.some(p => 
            PhysicsEngine.calculateDistance({ x, y }, p) < GAME_CONFIG.PLAYER_RADIUS * 3
        ));
        
        const player = {
            id: socket.id,
            name: data.name,
            color: data.color,
            x: x,
            y: y,
            velocityX: 0,
            velocityY: 0,
            score: 0,
            lives: 3, // Inicializa com 3 vidas
            lastMoveTime: Date.now(),
            lastCollisionTime: 0
        };
        
        players.push(player);
        io.emit('updatePlayers', players);
        
        if (gameState.currentQuestion && gameState.isQuestionActive) {
            socket.emit('newQuestion', gameState.currentQuestion);
            socket.emit('updateTimer', gameState.currentQuestion.duration);
        }
        socket.emit('gameState', { isPaused: gameState.isPaused });
        
        console.log(`Jogador ${data.name} entrou no jogo`);
    });

    socket.on('move', (data) => {
        if (gameState.isPaused) return;
        const player = players.find(p => p.id === socket.id);
        if (!player) return;
        
        const now = Date.now();
        if (now - player.lastMoveTime < 16) return;
        
        player.lastMoveTime = now;
        
        let deltaX = 0;
        let deltaY = 0;
        const speed = GAME_CONFIG.PLAYER_SPEED;
        const diagonalFactor = 0.707;
        
        switch(data.direction) {
            case 'up':
                deltaY = -speed;
                break;
            case 'down':
                deltaY = speed;
                break;
            case 'left':
                deltaX = -speed;
                break;
            case 'right':
                deltaX = speed;
                break;
            case 'up-left':
                deltaX = -speed * diagonalFactor;
                deltaY = -speed * diagonalFactor;
                break;
            case 'up-right':
                deltaX = speed * diagonalFactor;
                deltaY = -speed * diagonalFactor;
                break;
            case 'down-left':
                deltaX = -speed * diagonalFactor;
                deltaY = speed * diagonalFactor;
                break;
            case 'down-right':
                deltaX = speed * diagonalFactor;
                deltaY = speed * diagonalFactor;
                break;
        }
        
        const acceleration = GAME_CONFIG.ACCELERATION;
        player.velocityX = (player.velocityX || 0) + deltaX * acceleration;
        player.velocityY = (player.velocityY || 0) + deltaY * acceleration;
        
        const velocity = PhysicsEngine.clampVelocity({ 
            x: player.velocityX, 
            y: player.velocityY 
        }, GAME_CONFIG.PLAYER_SPEED * 1.5);
        
        player.velocityX = velocity.x;
        player.velocityY = velocity.y;
    });

    socket.on('pauseGame', () => {
        if (gameState.isPaused) return;
        gameState.isPaused = true;
        if (gameState.timer) clearInterval(gameState.timer);
        io.emit('gameState', { isPaused: true });
        console.log('Jogo pausado pelo admin');
    });

    socket.on('resumeGame', () => {
        if (!gameState.isPaused) return;
        gameState.isPaused = false;
        if (gameState.currentQuestion && gameState.isQuestionActive) {
            let timeLeft = gameState.currentQuestion.duration;
            gameState.timer = setInterval(() => {
                if (gameState.isPaused) return;
                timeLeft--;
                io.emit('updateTimer', timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(gameState.timer);
                    gameState.isQuestionActive = false;
                    checkAnswers();
                    gameState.currentQuestionIndex++;
                    setTimeout(() => {
                        sendNewQuestion();
                    }, GAME_CONFIG.PAUSE_BETWEEN_QUESTIONS * 1000);
                }
            }, 1000);
        } else {
            sendNewQuestion();
        }
        io.emit('gameState', { isPaused: false });
        console.log('Jogo retomado pelo admin');
    });

    socket.on('skipQuestion', () => {
        if (gameState.timer) clearInterval(gameState.timer);
        gameState.isQuestionActive = false;
        gameState.currentQuestionIndex++;
        io.emit('questionResult', []);
        setTimeout(() => {
            sendNewQuestion();
        }, GAME_CONFIG.PAUSE_BETWEEN_QUESTIONS * 1000);
        console.log('Pergunta pulada pelo admin');
    });

    socket.on('previousQuestion', () => {
        if (gameState.timer) clearInterval(gameState.timer);
        gameState.isQuestionActive = false;
        gameState.currentQuestionIndex = Math.max(0, gameState.currentQuestionIndex - 1);
        io.emit('questionResult', []);
        setTimeout(() => {
            sendNewQuestion();
        }, GAME_CONFIG.PAUSE_BETWEEN_QUESTIONS * 1000);
        console.log('Voltou para pergunta anterior pelo admin');
    });

    socket.on('editQuestion', (data) => {
        const { index, question } = data;
        if (index < 0 || index >= gameState.questions.length) return;

        if (!question.text || !question.options || !['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
            socket.emit('editQuestionError', 'Pergunta inválida');
            return;
        }
        for (const opt of Object.values(question.options)) {
            if (!opt) {
                socket.emit('editQuestionError', 'Todas as opções devem ser preenchidas');
                return;
            }
        }

        gameState.questions[index] = {
            text: question.text,
            options: question.options,
            correctAnswer: question.correctAnswer,
            duration: GAME_CONFIG.QUESTION_DURATION
        };
        console.log(`Pergunta ${index} editada pelo admin`);
        socket.emit('editQuestionSuccess', index);
    });

    socket.on('disconnect', () => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            console.log(`Jogador ${player.name} desconectado`);
            players = players.filter(p => p.id !== socket.id);
            io.emit('updatePlayers', players);
        } else {
            console.log(`Admin desconectado: ${socket.id}`);
        }
    });
});

// Função para inicializar o jogo
function initializeGame() {
    console.log('Inicializando jogo com física aprimorada...');
    startPhysicsLoop();
    setTimeout(() => {
        console.log('Enviando primeira pergunta...');
        sendNewQuestion();
    }, GAME_CONFIG.INITIAL_DELAY * 1000);
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada não tratada:', reason);
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    initializeGame();
});