let currentScreen = 'selection';
let ctx, canvas, socket;
let pos = { x: 400, y: 300 }; // Posição inicial central
let angle = 0;
let carImage = new Image();
carImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiByeD0iNSIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNSAxMCBBNS41IDUuNSAwIDAgMSA1IDE1IEw1IDIwIiBmaWxsPSIjMDAwIi8+CjxwYXRoIGQ9Ik0zNSAxMCBBNS41IDUuNSAwIDAgMSAzNSAxNSBMIDM1IDIwIiBmaWxsPSIjMDAwIi8+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMjUiIHI9IjUiIGZpbGw9IiMwMDAiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIyNSIgcj0iNSIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4=';

// Variáveis do jogo
let gameRunning = false;
let lives = 3;
let obstacles = [];
let lastObstacleTime = 0;
const obstacleFrequency = 2000; // Frequência de spawn de obstáculos (ms)
const carSpeed = 3; // Velocidade do carro
const obstacleSpeed = 2; // Velocidade dos obstáculos

// Aguarda o carregamento do DOM antes de inicializar o socket
document.addEventListener('DOMContentLoaded', () => {
    if (typeof io === 'undefined') {
        console.error('Socket.IO não está carregado. Verifique a inclusão da biblioteca.');
        return;
    }
    socket = io();
    socket.on('connect', () => console.log('Conectado ao servidor:', socket.id));
    socket.on('connect_error', (err) => console.error('Erro de conexão com o servidor:', err.message));
});

function selectDevice(device) {
    const selectionScreen = document.getElementById('selection-screen');
    const mobileScreen = document.getElementById('mobile-screen');
    const pcScreen = document.getElementById('pc-screen');

    if (!selectionScreen || !mobileScreen || !pcScreen) {
        console.error('Uma ou mais seções não encontradas no DOM');
        return;
    }

    selectionScreen.classList.add('hidden');
    mobileScreen.classList.add('hidden');
    pcScreen.classList.add('hidden');

    if (device === 'mobile') {
        mobileScreen.classList.remove('hidden');
        currentScreen = 'mobile';
        initializeCanvas();
        startGeolocation();
        startGame();
    } else if (device === 'pc') {
        pcScreen.classList.remove('hidden');
        currentScreen = 'pc';
        initializeCanvas();
        listenForDeviceUpdates();
    }

    if (socket && socket.connected) {
        socket.emit('device-type', device);
    } else {
        console.error('Socket não está conectado. Não foi possível enviar o tipo de dispositivo.');
    }
}

function showSelectionScreen() {
    const mobileScreen = document.getElementById('mobile-screen');
    const pcScreen = document.getElementById('pc-screen');
    const selectionScreen = document.getElementById('selection-screen');

    if (!selectionScreen || !mobileScreen || !pcScreen) {
        console.error('Uma ou mais seções não encontradas no DOM');
        return;
    }

    mobileScreen.classList.add('hidden');
    pcScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    currentScreen = 'selection';

    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameRunning = false; // Parar o jogo ao voltar
}

function initializeCanvas() {
    canvas = document.getElementById('myCanvas');
    if (!canvas) {
        console.error('Canvas não encontrado');
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Erro ao obter contexto do canvas');
        return;
    }

    resizeCanvas();
    drawRacetrack();
    console.log('Canvas inicializado');
}

function resizeCanvas() {
    canvas.width = Math.min(800, window.innerWidth - 40);
    canvas.height = canvas.width * (600 / 800);
}

function drawRacetrack() {
    if (!ctx) return;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    for (let y = 50; y <= canvas.height - 50; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, canvas.height);
    ctx.moveTo(canvas.width - 50, 0);
    ctx.lineTo(canvas.width - 50, canvas.height);
    ctx.stroke();
}

function drawCar(x, y, angle, color = 'white') {
    if (!ctx || !carImage.complete) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(carImage, -20, -15, 40, 30);
    ctx.restore();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(obstacle.x, obstacle.y, 20, 20);
    });
}

function mapGeoToCanvas(lat, lon, canvasWidth, canvasHeight) {
    const minLat = -4.0, maxLat = -3.7;
    const minLon = -38.6, maxLon = -38.4;
    const x = ((lon - minLon) / (maxLon - minLon)) * canvasWidth;
    const y = ((lat - minLat) / (maxLat - minLat)) * canvasHeight;
    return {
        x: Math.max(0, Math.min(canvasWidth, x)),
        y: Math.max(0, Math.min(canvasHeight, y))
    };
}

function startGeolocation() {
    const status = document.getElementById('status');
    if (!status) {
        console.error('Elemento status não encontrado');
        return;
    }

    if (!ctx) return;

    let lastGeoPos = null;
    let accelPos = null;
    let lastUpdateTime = 0;
    const updateInterval = 100;
    const accelThreshold = 1;
    const geoWeight = 0.01;
    const accelWeight = 0.7;

    function render() {
        if (!pos) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRacetrack();
        drawCar(pos.x, pos.y, angle);
        drawObstacles();
    }

    if (navigator.geolocation) {
        status.textContent = 'Obtendo geolocalização...';
        status.classList.add('success');
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const geoPos = mapGeoToCanvas(lat, lon, canvas.width, canvas.height);

                if (!pos) {
                    pos = geoPos;
                    accelPos = geoPos;
                }

                if (lastGeoPos) {
                    pos.x = pos.x * (1 - geoWeight) + geoPos.x * geoWeight;
                    pos.y = pos.y * (1 - geoWeight) + geoPos.y * geoWeight;
                } else {
                    pos = geoPos;
                }
                lastGeoPos = geoPos;

                if (socket && socket.connected) {
                    socket.emit('update-position', { position: pos, angle });
                } else {
                    console.warn('Socket não está conectado. Posição não enviada.');
                }
                render();
                status.textContent = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
                status.classList.remove('error');
                status.classList.add('success');
            },
            (err) => {
                status.textContent = 'Erro ao obter localização: ' + err.message;
                status.classList.add('error');
            },
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
    } else {
        status.textContent = 'Geolocalização não suportada';
        status.classList.add('error');
    }

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            if (typeof event.alpha === 'number') {
                angle = event.alpha * Math.PI / 180;
                if (pos && socket && socket.connected) {
                    socket.emit('update-position', { position: pos, angle });
                    render();
                }
            }
        });
    }

    if (window.DeviceMotionEvent) {
        let lastMove = Date.now();
        window.addEventListener('devicemotion', (event) => {
            const accel = event.accelerationIncludingGravity;
            if (!accel || !pos) return;

            const now = Date.now();
            if (now - lastUpdateTime < updateInterval) return;
            lastUpdateTime = now;

            const dt = (now - lastMove) / 1000;
            lastMove = now;

            const accelMagnitude = Math.sqrt((accel.x || 0) ** 2 + (accel.y || 0) ** 2);
            if (accelMagnitude < accelThreshold) return;

            const sensitivity = 15;
            accelPos = accelPos || pos;
            accelPos.x += (accel.x || 0) * dt * sensitivity;
            accelPos.y += (accel.y || 0) * dt * sensitivity;

            accelPos.x = Math.max(0, Math.min(canvas.width, accelPos.x));
            accelPos.y = Math.max(0, Math.min(canvas.height, accelPos.y));

            pos = lastGeoPos ? {
                x: accelPos.x * accelWeight + lastGeoPos.x * geoWeight,
                y: accelPos.y * accelWeight + lastGeoPos.y * geoWeight
            } : accelPos;

            if (socket && socket.connected) {
                socket.emit('update-position', { position: pos, angle });
            } else {
                console.warn('Socket não está conectado. Posição não enviada.');
            }
            render();
        });
    } else {
        console.warn('DeviceMotionEvent não suportado.');
    }
}

function startGame() {
    lives = 3;
    obstacles = [];
    lastObstacleTime = 0;
    gameRunning = true;
    const livesDisplay = document.getElementById('lives');
    if (livesDisplay) livesDisplay.textContent = `Vidas: ${lives}`;
    gameLoop();
}

function spawnObstacle() {
    const x = Math.random() * (canvas.width - 100) + 50; // Dentro das bordas
    obstacles.push({ x: x, y: 0, width: 20, height: 20 });
}

function checkCollision() {
    const carWidth = 40;
    const carHeight = 30;
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (
            pos.x < obs.x + obs.width &&
            pos.x + carWidth > obs.x &&
            pos.y < obs.y + obs.height &&
            pos.y + carHeight > obs.y
        ) {
            lives--;
            obstacles.splice(i, 1); // Remove o obstáculo após colisão
            const livesDisplay = document.getElementById('lives');
            if (livesDisplay) livesDisplay.textContent = `Vidas: ${lives}`;
            if (lives <= 0) {
                gameRunning = false;
                ctx.fillStyle = '#fff';
                ctx.font = '30px Arial';
                ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2);
                ctx.fillText('Pressione Voltar para reiniciar', canvas.width / 2 - 150, canvas.height / 2 + 40);
            }
            break;
        }
    }
}

function gameLoop() {
    if (!gameRunning) return;

    // Mover o carro para frente
    let dx = carSpeed * Math.sin(angle);
    let dy = -carSpeed * Math.cos(angle);
    pos.x += dx;
    pos.y += dy;

    // Manter dentro dos limites
    pos.x = Math.max(0, Math.min(canvas.width, pos.x));
    pos.y = Math.max(0, Math.min(canvas.height, pos.y));

    // Gerar obstáculos
    const now = Date.now();
    if (now - lastObstacleTime > obstacleFrequency) {
        spawnObstacle();
        lastObstacleTime = now;
    }

    // Mover obstáculos para baixo
    obstacles.forEach(obstacle => {
        obstacle.y += obstacleSpeed;
    });

    // Remover obstáculos fora da tela
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

    // Verificar colisões
    checkCollision();

    // Renderizar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRacetrack();
    drawCar(pos.x, pos.y, angle);
    drawObstacles();

    if (socket && socket.connected) {
        socket.emit('update-position', { position: pos, angle });
    }

    if (gameRunning) requestAnimationFrame(gameLoop);
}

function listenForDeviceUpdates() {
    if (!socket) {
        console.error('Socket não inicializado.');
        return;
    }
    socket.on('update-devices', (devices) => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRacetrack();

        const mobileDevices = Object.values(devices).filter(d => d.type === 'mobile');
        const deviceCount = document.getElementById('device-count');
        if (deviceCount) {
            deviceCount.textContent = `Dispositivos conectados: ${mobileDevices.length}`;
        }

        let statusText = 'Dispositivos conectados:\n';
        const colors = ['blue', 'red', 'green', 'purple', 'orange'];

        mobileDevices.forEach((device, index) => {
            drawCar(device.position.x, device.position.y, device.angle, colors[index % colors.length]);
            statusText += `Dispositivo ${index + 1}: x=${device.position.x.toFixed(2)}, y=${device.position.y.toFixed(2)}, angle=${device.angle.toFixed(2)}\n`;
        });

        const status = document.getElementById('status');
        if (status) {
            status.textContent = statusText;
        }
    });
}

window.addEventListener('resize', () => {
    resizeCanvas();
    if (currentScreen === 'mobile' && pos) {
        pos.x = Math.min(pos.x, canvas.width);
        pos.y = Math.min(pos.y, canvas.height);
        drawRacetrack();
        drawCar(pos.x, pos.y, angle);
        drawObstacles();
    }
});