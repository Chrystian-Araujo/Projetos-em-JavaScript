const express = require('express');
const https = require('https');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
const server = https.createServer(options, app);
const io = socketIo(server);

const devices = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log(`Novo dispositivo conectado: ${socket.id}`);

    socket.on('device-type', (type) => {
        console.log(`Dispositivo ${socket.id} selecionou tipo: ${type}`);
        devices[socket.id] = { type, position: { x: 400, y: 300 }, angle: 0 };
        io.emit('update-devices', devices);
        console.log('Enviando dispositivos atualizados:', JSON.stringify(devices, null, 2));
    });

    socket.on('update-position', (data) => {
        if (devices[socket.id]) {
            devices[socket.id].position = data.position;
            devices[socket.id].angle = data.angle;
            io.emit('update-devices', devices);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Dispositivo desconectado: ${socket.id}`);
        delete devices[socket.id];
        io.emit('update-devices', devices);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});