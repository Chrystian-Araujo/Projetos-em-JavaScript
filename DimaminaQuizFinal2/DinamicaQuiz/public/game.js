// Elementos DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const questionText = document.getElementById('questionText');
const timerElement = document.getElementById('timer');
const leaderboardList = document.getElementById('leaderboardList');
const livesContainer = document.getElementById('livesContainer');
const eliminationGif = document.getElementById('eliminationGif');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const eliminationSound = document.getElementById('eliminationSound');

// Configurações do jogo
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_RADIUS: 20,
    FLASH_DURATION: 1500,
    FLASH_INTERVAL: 200,
    INTERPOLATION_SPEED: 0.2,
    PREDICTION_FACTOR: 0.2,
    COLLISION_SHAKE_DURATION: 300,
    COLLISION_SHAKE_INTENSITY: 0,
    TRAIL_LENGTH: 15,
    TRAIL_FADE_SPEED: 0.08,
    ELIMINATION_GIF_DURATION: 3000
};

// Cores das áreas de resposta
const AREA_COLORS = {
    A: '#EE4B6A',
    B: '#7DC95E',
    C: '#50B2C0',
    D: '#FF9914'
};

// Áreas de resposta
const ANSWER_AREAS = {
    A: { x: 0, y: 0, width: 400, height: 300, label: 'A' },
    B: { x: 400, y: 0, width: 400, height: 300, label: 'B' },
    C: { x: 0, y: 300, width: 400, height: 300, label: 'C' },
    D: { x: 400, y: 300, width: 400, height: 300, label: 'D' }
};

// Estado do jogo
let gameState = {
    players: [],
    currentQuestion: null,
    keysPressed: {},
    animationId: null,
    lastServerUpdate: Date.now(),
    collisionEffects: [],
    isPaused: false,
    waitTimer: null
};

// Dados do jogador
const playerData = {
    name: sessionStorage.getItem('name'),
    color: sessionStorage.getItem('color'),
    userType: sessionStorage.getItem('userType')
};

const socket = io();

// Configurar canvas
canvas.width = GAME_CONFIG.CANVAS_WIDTH;
canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

// Classes para gerenciar efeitos visuais
class CollisionEffect {
    constructor(x, y, intensity = 1) {
        this.x = x;
        this.y = y;
        this.startTime = Date.now();
        this.duration = 400;
        this.intensity = intensity;
        this.maxRadius = 30 * intensity;
        this.particles = [];
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0
            });
        }
    }
    
    update(deltaTime) {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life = Math.max(0, 1 - progress);
            particle.vy += 0.1;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
        });
        
        return progress < 1;
    }
    
    render(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        const alpha = Math.max(0, 1 - progress);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxRadius * progress, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 100, ${alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 200, 100, ${particle.life})`;
                ctx.fill();
            }
        });
    }
}

class TrailEffect {
    constructor() {
        this.points = [];
        this.maxPoints = GAME_CONFIG.TRAIL_LENGTH;
    }
    
    addPoint(x, y, velocity) {
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (speed > 1) {
            this.points.push({
                x, y,
                alpha: 1.0,
                size: Math.min(speed * 0.5, 4)
            });
            
            if (this.points.length > this.maxPoints) {
                this.points.shift();
            }
        }
    }
    
    update() {
        this.points.forEach(point => {
            point.alpha -= GAME_CONFIG.TRAIL_FADE_SPEED;
        });
        
        this.points = this.points.filter(point => point.alpha > 0);
    }
    
    render(ctx, color) {
        if (this.points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            if (point.alpha > 0) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${point.alpha * 0.6})`;
                ctx.fill();
            }
        }
    }
}

// Funções de física do cliente
function calculateDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function predictPlayerMovement(player, deltaTime) {
    if (!player.velocityX && !player.velocityY) return;
    
    const prediction = GAME_CONFIG.PREDICTION_FACTOR * (deltaTime / 16.67);
    const vx = player.velocityX || 0;
    const vy = player.velocityY || 0;
    
    player.predictedX = player.x + vx * prediction;
    player.predictedY = player.y + vy * prediction;
    
    const radius = GAME_CONFIG.PLAYER_RADIUS;
    player.predictedX = Math.max(radius, Math.min(GAME_CONFIG.CANVAS_WIDTH - radius, player.predictedX));
    player.predictedY = Math.max(radius, Math.min(GAME_CONFIG.CANVAS_HEIGHT - radius, player.predictedY));
}

function interpolatePlayer(player, deltaTime) {
    if (player.targetX !== undefined && player.targetY !== undefined) {
        const factor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16.67));
        
        player.displayX = player.displayX || player.x;
        player.displayY = player.displayY || player.y;
        
        const dx = player.targetX - player.displayX;
        const dy = player.targetY - player.displayY;
        
        player.displayX += dx * factor;
        player.displayY += dy * factor;
        
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            player.displayX = player.targetX;
            player.displayY = player.targetY;
            player.targetX = undefined;
            player.targetY = undefined;
        }
    } else {
        player.displayX = player.x;
        player.displayY = player.y;
    }
}

// Gerenciamento de vidas
const LIVES_MANAGER = {
    updateLivesDisplay() {
        const player = gameState.players.find(p => p.id === socket.id);
        if (!player) return;

        livesContainer.innerHTML = '';
        const lives = player.lives || 0;
        const heartSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.innerHTML = heartSvg;
            heart.style.color = i < lives ? this.getHeartColor(lives) : '#555';
            if (i < lives) {
                heart.classList.add('heart-active');
            }
            livesContainer.appendChild(heart);
        }
    },

    getHeartColor(lives) {
        if (lives === 3) return '#00FF00'; // Verde
        if (lives === 2) return '#FFA500'; // Laranja
        return '#FF0000'; // Vermelho
    },

    showEliminationEffect(playerId, playerName) {
        if (playerId === socket.id) {
            eliminationSound.currentTime = 0;
            eliminationSound.play().catch(e => console.log('Erro ao reproduzir som de eliminação:', e));
            
            eliminationGif.style.display = 'block';
            setTimeout(() => {
                eliminationGif.style.display = 'none';
                alert(`Você foi eliminado, ${playerName}!`);
                window.location.href = 'index.html';
            }, GAME_CONFIG.ELIMINATION_GIF_DURATION);
        }
    }
};

// Gerenciamento de input otimizado
const INPUT_MANAGER = {
    inputBuffer: [],
    lastInputTime: 0,
    
    init() {
        if (playerData.userType !== 'admin') {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            document.addEventListener('keyup', this.handleKeyUp.bind(this));
            
            document.addEventListener('keydown', (e) => {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        }
    },
    
    handleKeyDown(e) {
        const key = e.key;
        if (!gameState.keysPressed[key]) {
            gameState.keysPressed[key] = true;
            this.processMovement();
        }
    },
    
    handleKeyUp(e) {
        const key = e.key;
        gameState.keysPressed[key] = false;
    },
    
    processMovement() {
        if (gameState.isPaused) return;
        const keys = gameState.keysPressed;
        let direction = null;
        
        if (keys['ArrowUp'] && keys['ArrowLeft']) {
            direction = 'up-left';
        } else if (keys['ArrowUp'] && keys['ArrowRight']) {
            direction = 'up-right';
        } else if (keys['ArrowDown'] && keys['ArrowLeft']) {
            direction = 'down-left';
        } else if (keys['ArrowDown'] && keys['ArrowRight']) {
            direction = 'down-right';
        } else if (keys['ArrowUp']) {
            direction = 'up';
        } else if (keys['ArrowDown']) {
            direction = 'down';
        } else if (keys['ArrowLeft']) {
            direction = 'left';
        } else if (keys['ArrowRight']) {
            direction = 'right';
        }
        
        if (direction) {
            const now = Date.now();
            if (now - this.lastInputTime > 16) {
                socket.emit('move', { direction });
                this.lastInputTime = now;
            }
        }
    }
};

// Gerenciamento do painel de admin
const ADMIN_MANAGER = {
    init() {
        if (playerData.userType !== 'admin') return;

        const adminPanel = document.getElementById('adminControls');
        adminPanel.style.display = 'block';

        document.getElementById('pauseResumeBtn').addEventListener('click', () => {
            if (gameState.isPaused) {
                socket.emit('resumeGame');
            } else {
                socket.emit('pauseGame');
            }
        });

        document.getElementById('skipQuestionBtn').addEventListener('click', () => {
            socket.emit('skipQuestion');
        });

        document.getElementById('previousQuestionBtn').addEventListener('click', () => {
            socket.emit('previousQuestion');
        });

        document.getElementById('editQuestionBtn').addEventListener('click', () => {
            const index = parseInt(document.getElementById('editQuestionIndex').value);
            const text = document.getElementById('editQuestionText').value;
            const optionA = document.getElementById('editOptionA').value;
            const optionB = document.getElementById('editOptionB').value;
            const optionC = document.getElementById('editOptionC').value;
            const optionD = document.getElementById('editOptionD').value;
            const correctAnswer = document.getElementById('editCorrectAnswer').value;

            socket.emit('editQuestion', {
                index,
                question: {
                    text,
                    options: { A: optionA, B: optionB, C: optionC, D: optionD },
                    correctAnswer
                }
            });
        });

        socket.on('editQuestionError', (message) => {
            alert(`Erro ao editar pergunta: ${message}`);
        });

        socket.on('editQuestionSuccess', (index) => {
            alert(`Pergunta ${index + 1} editada com sucesso!`);
        });
    }
};

// Renderização melhorada
const RENDERER = {
    lastFrameTime: 0,
    
    init() {
        this.startGameLoop();
        if (playerData.userType === 'admin') {
            ADMIN_MANAGER.init();
        } else {
            LIVES_MANAGER.updateLivesDisplay();
        }
    },
    
    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            this.processInput();
            this.updateEffects(deltaTime);
            this.updatePredictions(deltaTime);
            this.render();
            gameState.animationId = requestAnimationFrame(gameLoop);
        };
        gameLoop(performance.now());
    },
    
    processInput() {
        const keys = gameState.keysPressed;
        if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
            INPUT_MANAGER.processMovement();
        }
    },
    
    updateEffects(deltaTime) {
        gameState.collisionEffects = gameState.collisionEffects.filter(effect => {
            return effect.update(deltaTime);
        });
        
        gameState.players.forEach(player => {
            if (!player.trail) {
                player.trail = new TrailEffect();
            }
            
            const vx = player.velocityX || 0;
            const vy = player.velocityY || 0;
            
            if (player.displayX !== undefined && player.displayY !== undefined) {
                player.trail.addPoint(player.displayX, player.displayY, { x: vx, y: vy });
            }
            
            player.trail.update();
        });
    },
    
    updatePredictions(deltaTime) {
        const currentTime = Date.now();
        const timeSinceUpdate = currentTime - gameState.lastServerUpdate;
        
        gameState.players.forEach(player => {
            interpolatePlayer(player, deltaTime);
            if (player.id === socket.id && timeSinceUpdate < 100) {
                predictPlayerMovement(player, deltaTime);
            }
        });
    },
    
    render() {
        ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        
        this.drawAnswerAreas();
        this.drawTrails();
        this.drawPlayers();
        this.drawCollisionEffects();
        
        if (gameState.currentQuestion) {
            this.drawAreaLabels();
        }

        if (gameState.isPaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('JOGO PAUSADO', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
        }
    },
    
    drawAnswerAreas() {
        Object.entries(ANSWER_AREAS).forEach(([key, area]) => {
            ctx.fillStyle = AREA_COLORS[key];
            ctx.fillRect(area.x, area.y, area.width, area.height);
            ctx.strokeStyle = '#2c2c2c';
            ctx.lineWidth = 3;
            ctx.strokeRect(area.x, area.y, area.width, area.height);
        });
    },
    
    drawTrails() {
        gameState.players.forEach(player => {
            if (player.trail) {
                player.trail.render(ctx, player.color);
            }
        });
    },
    
    drawPlayers() {
        gameState.players.forEach(player => {
            const currentTime = Date.now();
            let fillColor = player.color;
            
            let renderX, renderY;
            if (player.id === socket.id && player.predictedX !== undefined) {
                renderX = player.predictedX;
                renderY = player.predictedY;
            } else {
                renderX = player.displayX !== undefined ? player.displayX : player.x;
                renderY = player.displayY !== undefined ? player.displayY : player.y;
            }
            
            if (player.flashUntil && currentTime < player.flashUntil) {
                const flashPhase = Math.floor((currentTime - player.flashStart) / GAME_CONFIG.FLASH_INTERVAL) % 2;
                fillColor = flashPhase === 0 ? player.flashColor : player.color;
            }
            
            if (player.lastCollisionTime && currentTime - player.lastCollisionTime < GAME_CONFIG.COLLISION_SHAKE_DURATION) {
                const elapsed = currentTime - player.lastCollisionTime;
                const intensity = Math.max(0, 1 - elapsed / GAME_CONFIG.COLLISION_SHAKE_DURATION);
                const shakeAmount = intensity * GAME_CONFIG.COLLISION_SHAKE_INTENSITY;
                
                renderX += (Math.random() - 0.5) * shakeAmount;
                renderY += (Math.random() - 0.5) * shakeAmount;
            }
            
            ctx.beginPath();
            ctx.arc(renderX + 2, renderY + 2, GAME_CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(renderX, renderY, GAME_CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = fillColor;
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const speed = Math.sqrt((player.velocityX || 0) ** 2 + (player.velocityY || 0) ** 2);
            if (speed > 1) {
                const speedRadius = Math.min(speed * 2, GAME_CONFIG.PLAYER_RADIUS - 4);
                ctx.beginPath();
                ctx.arc(renderX, renderY, speedRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fill();
            }
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.strokeText(player.name, renderX, renderY - GAME_CONFIG.PLAYER_RADIUS - 8);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(player.name, renderX, renderY - GAME_CONFIG.PLAYER_RADIUS - 8);
        });
    },
    
    drawCollisionEffects() {
        gameState.collisionEffects.forEach(effect => {
            effect.render(ctx);
        });
    },
    
    drawAreaLabels() {
        Object.entries(ANSWER_AREAS).forEach(([key, area]) => {
            const centerX = area.x + area.width / 2;
            const centerY = area.y + area.height / 2;
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(centerX - 80, centerY - 40, 160, 80);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(centerX - 80, centerY - 40, 160, 80);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${key}:`, centerX, centerY - 10);
            
            const optionText = gameState.currentQuestion.options[key];
            ctx.font = '12px Arial';
            this.wrapText(optionText, centerX, centerY + 10, 150, 14);
        });
    },
    
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
};

// Gerenciamento de leaderboard
const LEADERBOARD = {
    update() {
        leaderboardList.innerHTML = '';
        const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
        
        sortedPlayers.forEach((player, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${player.name}: ${player.score} pts`;
            
            const hue = Math.max(0, 120 - (index * 30));
            li.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
            li.style.color = '#ffffff';
            li.style.padding = '8px';
            li.style.margin = '2px 0';
            li.style.borderRadius = '4px';
            li.style.transition = 'all 0.3s ease';
            
            if (player.id === socket.id) {
                li.style.border = '2px solid #FFD700';
                li.style.fontWeight = 'bold';
                li.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            }
            
            leaderboardList.appendChild(li);
        });
    }
};

// Gerenciamento de som
const SOUND_MANAGER = {
    playSound(sound) {
        try {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Não foi possível reproduzir o som:', e));
        } catch (e) {
            console.log('Erro ao reproduzir som:', e);
        }
    }
};

// Event listeners do Socket.IO
socket.on('connect', () => {
    console.log('Conectado ao servidor');
    socket.emit('join', { name: playerData.name, color: playerData.color, userType: playerData.userType });
});

socket.on('updatePlayers', (playerList) => {
    const previousPlayers = new Map(gameState.players.map(p => [p.id, p]));
    
    gameState.players = playerList.map(p => {
        const previous = previousPlayers.get(p.id);
        const player = {
            ...p,
            flashStart: p.flashStart || 0,
            flashUntil: p.flashUntil || 0,
            flashColor: p.flashColor || p.color,
            displayX: previous?.displayX,
            displayY: previous?.displayY,
            predictedX: previous?.predictedX,
            predictedY: previous?.predictedY,
            trail: previous?.trail || new TrailEffect(),
            lives: p.lives !== undefined ? p.lives : 3
        };
        
        if (previous && (previous.x !== p.x || previous.y !== p.y)) {
            player.targetX = p.x;
            player.targetY = p.y;
            
            const distance = Math.sqrt((p.x - previous.x) ** 2 + (p.y - previous.y) ** 2);
            const velocityChange = Math.sqrt(
                ((p.velocityX || 0) - (previous.velocityX || 0)) ** 2 + 
                ((p.velocityY || 0) - (previous.velocityY || 0)) ** 2
            );
            
            if (distance > 8 || velocityChange > 3) {
                const effectX = previous.displayX || previous.x;
                const effectY = previous.displayY || previous.y;
                gameState.collisionEffects.push(new CollisionEffect(effectX, effectY, velocityChange / 5));
                
                player.lastCollisionTime = Date.now();
            }
        }
        
        return player;
    });
    
    gameState.lastServerUpdate = Date.now();
    LEADERBOARD.update();
    if (playerData.userType !== 'admin') {
        LIVES_MANAGER.updateLivesDisplay();
    }
});

socket.on('newQuestion', (question) => {
    gameState.currentQuestion = question;
    questionText.innerHTML = `<strong>${question.text}</strong>`;
    timerElement.textContent = `Tempo restante: ${question.duration}s`;
});

socket.on('updateTimer', (timeLeft) => {
    timerElement.textContent = `Tempo restante: ${timeLeft}s`;
    
    if (timeLeft <= 5) {
        timerElement.style.color = '#FF0000';
        timerElement.style.animation = 'pulse 0.5s infinite';
    } else {
        timerElement.style.color = '#ffffff';
        timerElement.style.animation = 'none';
    }
});

socket.on('questionResult', (results) => {
    const playerResult = results.find(r => r.id === socket.id);
    
    gameState.players.forEach(player => {
        const result = results.find(r => r.id === player.id);
        if (result) {
            player.flashStart = Date.now();
            player.flashUntil = player.flashStart + GAME_CONFIG.FLASH_DURATION;
            player.flashColor = result.isCorrect ? '#00FF00' : '#FF0000';
            player.lives = result.lives;
        }
    });
    
    if (playerResult) {
        if (playerResult.isCorrect) {
            SOUND_MANAGER.playSound(correctSound);
        } else if (playerResult.playerAnswer !== null) {
            SOUND_MANAGER.playSound(wrongSound);
            livesContainer.classList.add('heart-lost');
            setTimeout(() => livesContainer.classList.remove('heart-lost'), 500);
        }
    }
    
    LIVES_MANAGER.updateLivesDisplay();
    
    questionText.textContent = 'Aguardando próxima pergunta...';
    gameState.currentQuestion = null;
    
    if (gameState.waitTimer) {
        clearInterval(gameState.waitTimer);
        gameState.waitTimer = null;
    }
    
    let waitTime = 10;
    timerElement.textContent = `Próxima pergunta em: ${waitTime}s`;
    timerElement.style.color = '#FFFF00';
    
    gameState.waitTimer = setInterval(() => {
        waitTime--;
        timerElement.textContent = `Próxima pergunta em: ${waitTime}s`;
        if (waitTime <= 0) {
            clearInterval(gameState.waitTimer);
            gameState.waitTimer = null;
            timerElement.style.color = '#ffffff';
        }
    }, 1000);
});

socket.on('playerEliminated', ({ id, name }) => {
    LIVES_MANAGER.showEliminationEffect(id, name);
});

socket.on('gameState', (state) => {
    gameState.isPaused = state.isPaused;
    if (playerData.userType === 'admin') {
        const pauseBtn = document.getElementById('pauseResumeBtn');
        pauseBtn.textContent = state.isPaused ? 'Retomar' : 'Pausar';
    }
});

socket.on('disconnect', () => {
    console.log('Desconectado do servidor');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (!playerData.name || !playerData.color || !playerData.userType) {
        alert('Dados do jogador não encontrados. Redirecionando para a página de login.');
        window.location.href = 'index.html';
        return;
    }
    
    INPUT_MANAGER.init();
    RENDERER.init();
    console.log('Jogo inicializado com física de colisão melhorada');
});

// Adiciona CSS para animação do timer
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    #leaderboardList li {
        transition: all 0.3s ease;
    }
    
    #leaderboardList li:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(style);