const socket = io();

// Estado atual do arquivo carregado
let currentLoadedFile = null;
let availableColors = ['azul', 'vermelho', 'verde', 'amarelo'];

// Carregar templates ativos
function loadTemplates() {
    const templateSelect = document.getElementById('template-select');
    const mergeTemplateSelect = document.getElementById('merge-template-select');
    
    if (!templateSelect || !mergeTemplateSelect) {
        console.error('Elementos de template não encontrados');
        return;
    }
    
    fetch('/templates')
        .then(response => response.json())
        .then(templates => {
            // Carregar template principal
            templateSelect.innerHTML = '';
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template;
                option.textContent = template.replace('_', ' ').toUpperCase();
                templateSelect.appendChild(option);
            });
            
            // Carregar templates para mesclagem
            mergeTemplateSelect.innerHTML = '<option value="">Selecione...</option>';
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template;
                option.textContent = template.replace('_', ' ').toUpperCase();
                mergeTemplateSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar templates:', error);
            templateSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            mergeTemplateSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        });
}

// Carregar cores disponíveis no select de mesclagem
function loadMergeColors() {
    const mergeColorSelect = document.getElementById('merge-color-select');
    if (!mergeColorSelect) return;
    
    mergeColorSelect.innerHTML = '<option value="">Selecione...</option>';
    availableColors.forEach(cor => {
        const option = document.createElement('option');
        option.value = cor;
        option.textContent = cor.charAt(0).toUpperCase() + cor.slice(1);
        mergeColorSelect.appendChild(option);
    });
}

// Carregar arquivos salvos
function loadSavedFiles() {
    const select = document.getElementById('saved-files-select');
    if (!select) {
        console.error('Elemento saved-files-select não encontrado');
        return;
    }
    
    fetch('/saved-files')
        .then(response => response.json())
        .then(files => {
            select.innerHTML = '<option value="">Selecione um arquivo...</option>';
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                select.appendChild(option);
            });
            
            // Atualizar lista de comandos salvos também
            updateSavedCommandsList(files);
        })
        .catch(error => {
            console.error('Erro ao carregar arquivos salvos:', error);
            select.innerHTML = '<option value="">Erro ao carregar</option>';
        });
}

// Atualizar lista visual de comandos salvos
function updateSavedCommandsList(files) {
    const savedCommands = document.getElementById('saved-commands');
    if (!savedCommands) return;
    
    if (files.length === 0) {
        savedCommands.innerHTML = '<p>Nenhum arquivo salvo ainda.</p>';
        return;
    }
    
    savedCommands.innerHTML = '';
    files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'saved-file-item';
        fileElement.innerHTML = `
            <a href="#" class="saved-command-btn" onclick="loadHtml('${file}')" title="Carregar ${file}">
                📄 ${file}
            </a>
        `;
        savedCommands.appendChild(fileElement);
    });
}

// Atualizar indicador de arquivo atual
function updateCurrentFileInfo(fileName = null) {
    const currentFileInfo = document.getElementById('current-file-info');
    if (!currentFileInfo) return;
    
    if (fileName) {
        currentFileInfo.innerHTML = `<span>📂 Arquivo carregado: <strong>${fileName}</strong></span>`;
        currentFileInfo.className = 'current-file-info loaded';
        currentLoadedFile = fileName;
    } else {
        currentFileInfo.innerHTML = '<span>Nenhum arquivo carregado</span>';
        currentFileInfo.className = 'current-file-info';
        currentLoadedFile = null;
    }
}

// Carregar templates e arquivos salvos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    loadTemplates();
    loadSavedFiles();
    loadMergeColors();
});

function sendCommand() {
    const input = document.getElementById('command-input');
    if (!input) return;
    const command = input.value.trim();
    if (!command) return;

    // Exibir comando no chat
    const chatDisplay = document.getElementById('chat-display');
    chatDisplay.innerHTML += `<p><strong>🧑‍💻 Você:</strong> ${command}</p>`;
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    // Enviar comando via Socket.IO
    socket.emit('command', command);

    input.value = '';
}

function runAutoLab() {
    const chatDisplay = document.getElementById('chat-display');
    const templateSelect = document.getElementById('template-select');
    
    if (!templateSelect) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ❌ Erro: Dropdown de templates não encontrado.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }
    
    const template = templateSelect.value;

    if (!template) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ⚠️ Selecione um template primeiro.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    chatDisplay.innerHTML += `<p><strong>🧑‍💻 Você:</strong> 🚀 Executando Auto Lab com template "${template.replace('_', ' ')}"...</p>`;
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    // Enviar evento auto-lab com template
    socket.emit('auto-lab', template);
}

function mergeTemplate() {
    const chatDisplay = document.getElementById('chat-display');
    const mergeTemplateSelect = document.getElementById('merge-template-select');
    const mergeColorSelect = document.getElementById('merge-color-select');
    
    if (!mergeTemplateSelect || !mergeColorSelect) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ❌ Erro: Controles de mesclagem não encontrados.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    const templateNome = mergeTemplateSelect.value;
    const corNome = mergeColorSelect.value;

    if (!templateNome) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ⚠️ Selecione um template para adicionar.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    if (!corNome) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ⚠️ Selecione uma cor para o elemento.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    if (!currentLoadedFile) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ⚠️ Carregue um arquivo base primeiro usando o botão "📂 Carregar".</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    chatDisplay.innerHTML += `<p><strong>🧑‍💻 Você:</strong> 🔀 Adicionando ${templateNome.replace('_', ' ')} ${corNome} ao arquivo ${currentLoadedFile}...</p>`;
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    // Enviar evento merge-template
    socket.emit('merge-template', { 
        baseFile: currentLoadedFile, 
        templateNome, 
        corNome 
    });
}

function loadSelectedFile() {
    const chatDisplay = document.getElementById('chat-display');
    const savedFilesSelect = document.getElementById('saved-files-select');
    
    if (!savedFilesSelect) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ❌ Erro: Dropdown de arquivos não encontrado.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    const fileName = savedFilesSelect.value;

    if (!fileName) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ⚠️ Selecione um arquivo primeiro.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return;
    }

    chatDisplay.innerHTML += `<p><strong>🧑‍💻 Você:</strong> 📂 Carregando arquivo ${fileName}...</p>`;
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    // Enviar evento load-file
    socket.emit('load-file', fileName);
}

function loadHtml(fileName) {
    const chatDisplay = document.getElementById('chat-display');
    
    fetch(`/output/${fileName}`)
        .then(response => {
            if (!response.ok) throw new Error('Arquivo não encontrado');
            return response.text();
        })
        .then(html => {
            const room = document.getElementById('iframe');
            room.srcdoc = html;
            
            // Atualizar estado e interface
            updateCurrentFileInfo(fileName);
            
            // Sincronizar dropdown
            const savedFilesSelect = document.getElementById('saved-files-select');
            if (savedFilesSelect) {
                savedFilesSelect.value = fileName;
            }
            
            chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ✅ ${fileName} carregado como arquivo base.</p>`;
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        })
        .catch(error => {
            chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ❌ Erro ao carregar ${fileName}: ${error.message}</p>`;
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        });
}

function clearSavedCommands() {
    const savedCommands = document.getElementById('saved-commands');
    const chatDisplay = document.getElementById('chat-display');
    
    if (confirm('⚠️ Tem certeza que deseja limpar a lista de comandos salvos? (Isso não excluirá os arquivos do servidor)')) {
        savedCommands.innerHTML = '<p>Lista limpa. Clique em "🔄 Atualizar" para recarregar.</p>';
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> 🧹 Lista de comandos limpa.</p>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
}

// Receber resposta do servidor
socket.on('response', (data) => {
    const chatDisplay = document.getElementById('chat-display');

    if (data.error) {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ❌ <span class="status-error">${data.error}</span></p>`;
    } else if (data.files) {
        // Auto Lab concluído
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> 🎉 <span class="status-success">Auto Lab concluído!</span> Arquivos gerados: <strong>${data.files.length}</strong></p>`;
        
        // Mostrar lista de arquivos gerados
        chatDisplay.innerHTML += `<p><strong>📁 Arquivos criados:</strong></p>`;
        data.files.forEach(file => {
            chatDisplay.innerHTML += `<p>• ${file}</p>`;
        });
        
        // Carregar o primeiro arquivo automaticamente
        if (data.files.length > 0) {
            loadHtml(data.files[0]);
            chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> 📂 Carregando automaticamente: <strong>${data.files[0]}</strong></p>`;
        }
        
        // Atualizar lista de arquivos salvos
        loadSavedFiles();
        
    } else if (data.action === 'merge') {
        // Mesclagem de template
        const room = document.getElementById('iframe');
        room.srcdoc = data.html;
        updateCurrentFileInfo(data.fileName);
        
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ✅ <span class="status-success">${data.message}</span></p>`;
        chatDisplay.innerHTML += `<p><strong>💾 Novo arquivo salvo:</strong> ${data.fileName}</p>`;
        
        // Atualizar lista de arquivos salvos
        loadSavedFiles();
        
    } else if (data.action === 'load') {
        // Carregamento de arquivo
        const room = document.getElementById('iframe');
        room.srcdoc = data.html;
        updateCurrentFileInfo(data.fileName);
        
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ✅ <span class="status-success">${data.message}</span></p>`;
        
    } else if (data.html && data.nomeCor) {
        // Comando único (tela cor)
        const room = document.getElementById('iframe');
        room.srcdoc = data.html;
        const fileName = `tela_${data.nomeCor}.html`;
        updateCurrentFileInfo(fileName);
        
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ✅ <span class="status-success">Tela gerada com sucesso!</span></p>`;
        chatDisplay.innerHTML += `<p><strong>💾 Arquivo salvo:</strong> ${fileName}</p>`;
        
        // Atualizar lista de arquivos salvos
        loadSavedFiles();
        
    } else if (data.html && data.fileName) {
        // Adição de elemento
        const room = document.getElementById('iframe');
        room.srcdoc = data.html;
        updateCurrentFileInfo(data.fileName);
        
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ✅ <span class="status-success">Elemento adicionado com sucesso!</span></p>`;
        chatDisplay.innerHTML += `<p><strong>💾 Arquivo salvo:</strong> ${data.fileName}</p>`;
        
        // Atualizar lista de arquivos salvos
        loadSavedFiles();
        
    } else {
        chatDisplay.innerHTML += `<p><strong>🤖 Bot:</strong> ⚠️ <span class="status-warning">Resposta inesperada do servidor.</span></p>`;
    }
    
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

// Enviar comando ao pressionar Enter
document.getElementById('command-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendCommand();
});

// Função de utilidade para mostrar status de loading
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        setTimeout(() => {
            element.classList.remove('loading');
        }, 1000);
    }
}

// Adicionar feedback visual aos botões
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar efeitos de loading aos botões principais
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            showLoading(button);
        });
    });
});