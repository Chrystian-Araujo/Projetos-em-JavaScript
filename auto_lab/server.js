const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurar pasta estática
app.use(express.static(path.join(__dirname, 'static')));
app.use('/output', express.static(path.join(__dirname, 'output')));

// Servir index.html na rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Rota para listar templates
app.get('/templates', async (req, res) => {
    try {
        const db = JSON.parse(await fs.readFile('automation_database.json', 'utf-8'));
        const templates = db.templates.map(t => t.nome);
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar templates' });
    }
});

// Rota para listar arquivos salvos
app.get('/saved-files', async (req, res) => {
    try {
        const outputDir = path.join(__dirname, 'output');
        await fs.mkdir(outputDir, { recursive: true });
        const files = await fs.readdir(outputDir);
        res.json(files.filter(f => f.endsWith('.html')));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar arquivos salvos' });
    }
});

// Função para extrair elementos do HTML
function extractElementFromTemplate(templateNome, cor, nomeCor) {
    const elements = {
        'botao': `<button style="background-color: ${cor}; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; margin: 10px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Botão ${nomeCor}</button>`,
        'caixa_texto': `<input type="text" placeholder="Caixa ${nomeCor}" style="border: 2px solid ${cor}; padding: 10px; width: 200px; font-size: 16px; border-radius: 5px; margin: 10px;">`,
        'tela_basica': '' // Tela básica modifica o fundo, não adiciona elemento
    };
    return elements[templateNome] || '';
}

// Função para aplicar tela básica ao HTML
function applyTelaBasica(htmlContent, cor, nomeCor) {
    // Modifica o background-color do body
    return htmlContent.replace(
        /<body[^>]*>/,
        `<body style="background-color: ${cor}; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; color: white; font-family: Arial, sans-serif; padding: 20px;">`
    );
}

// Manipular conexões Socket.IO
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    socket.on('command', async (command) => {
        try {
            // Normalizar comando
            command = command.trim().toLowerCase();
            console.log('Comando recebido:', command);

            // Extrair cor do comando
            if (!command.startsWith('tela ')) {
                socket.emit('response', { error: "Comando inválido. Use 'tela <cor>'." });
                return;
            }
            const nomeCor = command.replace('tela ', '').trim();
            console.log('Cor extraída:', nomeCor);
            if (!nomeCor) {
                socket.emit('response', { error: "Nenhuma cor especificada." });
                return;
            }

            // Carregar banco JSON
            const db = JSON.parse(await fs.readFile('automation_database.json', 'utf-8'));

            // Buscar cor
            const corEncontrada = db.cores.find(cor => cor.nome === nomeCor);
            if (!corEncontrada) {
                socket.emit('response', { error: `Cor '${nomeCor}' não encontrada no banco.` });
                return;
            }

            // Buscar template
            const template = db.templates.find(t => t.nome === 'tela_basica');
            if (!template) {
                socket.emit('response', { error: "Template 'tela_basica' não encontrado." });
                return;
            }

            // Substituir placeholders
            const htmlContent = template.conteudo.replace('{cor}', corEncontrada.valor)
                                               .replace('{nome_cor}', nomeCor);

            // Criar pasta output
            await fs.mkdir('output', { recursive: true });

            // Salvar HTML
            const outputFile = path.join('output', `tela_${nomeCor}.html`);
            await fs.writeFile(outputFile, htmlContent);

            // Enviar resposta
            socket.emit('response', { html: htmlContent, nomeCor: nomeCor });
        } catch (error) {
            console.error('Erro no comando:', error);
            socket.emit('response', { error: 'Erro no servidor: ' + error.message });
        }
    });

    socket.on('auto-lab', async (templateNome) => {
        try {
            console.log('Auto Lab iniciado com template:', templateNome);

            // Carregar banco JSON
            const db = JSON.parse(await fs.readFile('automation_database.json', 'utf-8'));

            // Buscar template
            const template = db.templates.find(t => t.nome === templateNome);
            if (!template) {
                socket.emit('response', { error: `Template '${templateNome}' não encontrado.` });
                return;
            }

            // Criar pasta output
            await fs.mkdir('output', { recursive: true });

            // Gerar HTML para cada cor
            const files = [];
            for (const cor of db.cores) {
                const htmlContent = template.conteudo.replace('{cor}', cor.valor)
                                                   .replace('{nome_cor}', cor.nome);
                
                // Nome do arquivo baseado no template
                const fileName = `${templateNome}_${cor.nome}.html`;
                const outputFile = path.join('output', fileName);
                await fs.writeFile(outputFile, htmlContent);
                files.push(fileName);
            }

            // Enviar lista de arquivos gerados
            socket.emit('response', { files: files, template: templateNome });
        } catch (error) {
            console.error('Erro no Auto Lab:', error);
            socket.emit('response', { error: 'Erro no Auto Lab: ' + error.message });
        }
    });

    socket.on('merge-template', async ({ baseFile, templateNome, corNome }) => {
        try {
            console.log('Mesclando template:', { baseFile, templateNome, corNome });

            // Carregar banco JSON
            const db = JSON.parse(await fs.readFile('automation_database.json', 'utf-8'));

            // Buscar template
            const template = db.templates.find(t => t.nome === templateNome);
            if (!template) {
                socket.emit('response', { error: `Template '${templateNome}' não encontrado.` });
                return;
            }

            // Buscar cor
            const corEncontrada = db.cores.find(cor => cor.nome === corNome);
            if (!corEncontrada) {
                socket.emit('response', { error: `Cor '${corNome}' não encontrada.` });
                return;
            }

            // Ler arquivo base
            const baseFilePath = path.join('output', baseFile);
            let baseContent;
            try {
                baseContent = await fs.readFile(baseFilePath, 'utf-8');
            } catch (error) {
                socket.emit('response', { error: `Arquivo base '${baseFile}' não encontrado.` });
                return;
            }

            let combinedContent = baseContent;

            // Aplicar template baseado no tipo
            if (templateNome === 'tela_basica') {
                // Modifica o fundo da tela
                combinedContent = applyTelaBasica(combinedContent, corEncontrada.valor, corNome);
            } else {
                // Adiciona elemento ao HTML
                const elementHtml = extractElementFromTemplate(templateNome, corEncontrada.valor, corNome);
                if (elementHtml) {
                    // Inserir o elemento antes do </body>
                    combinedContent = combinedContent.replace('</body>', `    ${elementHtml}\n</body>`);
                }
            }

            // Gerar nome único para o arquivo mesclado
            const timestamp = Date.now();
            const newFileName = `mesclado_${timestamp}.html`;
            
            // Criar pasta output
            await fs.mkdir('output', { recursive: true });

            // Salvar novo arquivo
            const outputFile = path.join('output', newFileName);
            await fs.writeFile(outputFile, combinedContent);

            // Enviar resposta
            socket.emit('response', { 
                html: combinedContent, 
                fileName: newFileName,
                action: 'merge',
                message: `${templateNome} ${corNome} adicionado com sucesso!`
            });
        } catch (error) {
            console.error('Erro ao mesclar template:', error);
            socket.emit('response', { error: 'Erro ao mesclar template: ' + error.message });
        }
    });

    socket.on('load-file', async (fileName) => {
        try {
            const filePath = path.join('output', fileName);
            const content = await fs.readFile(filePath, 'utf-8');
            socket.emit('response', { 
                html: content, 
                action: 'load',
                fileName: fileName,
                message: `Arquivo ${fileName} carregado.`
            });
        } catch (error) {
            socket.emit('response', { error: `Erro ao carregar arquivo: ${error.message}` });
        }
    });

    socket.on('add-element', async ({ baseFile, templateNome, corNome, newFileName }) => {
        try {
            console.log('Adicionando elemento:', { baseFile, templateNome, corNome, newFileName });

            // Carregar banco JSON
            const db = JSON.parse(await fs.readFile('automation_database.json', 'utf-8'));

            // Buscar template
            const template = db.templates.find(t => t.nome === templateNome);
            if (!template) {
                socket.emit('response', { error: `Template '${templateNome}' não encontrado.` });
                return;
            }

            // Buscar cor
            const corEncontrada = db.cores.find(cor => cor.nome === corNome);
            if (!corEncontrada) {
                socket.emit('response', { error: `Cor '${corNome}' não encontrada.` });
                return;
            }

            // Ler arquivo base
            const baseFilePath = path.join('output', baseFile);
            let baseContent;
            try {
                baseContent = await fs.readFile(baseFilePath, 'utf-8');
            } catch (error) {
                socket.emit('response', { error: `Arquivo base '${baseFile}' não encontrado.` });
                return;
            }

            let combinedContent = baseContent;

            // Aplicar template baseado no tipo
            if (templateNome === 'tela_basica') {
                combinedContent = applyTelaBasica(combinedContent, corEncontrada.valor, corNome);
            } else {
                const elementHtml = extractElementFromTemplate(templateNome, corEncontrada.valor, corNome);
                if (elementHtml) {
                    combinedContent = combinedContent.replace('</body>', `    ${elementHtml}\n</body>`);
                }
            }

            // Criar pasta output
            await fs.mkdir('output', { recursive: true });

            // Salvar novo arquivo
            const outputFile = path.join('output', `${newFileName}.html`);
            await fs.writeFile(outputFile, combinedContent);

            // Enviar resposta
            socket.emit('response', { html: combinedContent, fileName: `${newFileName}.html` });
        } catch (error) {
            console.error('Erro ao adicionar elemento:', error);
            socket.emit('response', { error: 'Erro ao adicionar elemento: ' + error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando em http://127.0.0.1:3000');
});