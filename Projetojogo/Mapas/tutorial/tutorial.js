const races = {
    human: { 
        art: [" O ", "/|\\", "/ \\"], 
        stats: { 
            health: 100, 
            speed: 10, 
            attack: 5, 
            stamina: 100,
            strength: 5,
            agility: 5,
            vitality: 5
        }, 
        description: "Equilibrado em todos os aspectos. Bom para iniciantes.",
        subclasses: {
            monge: {
                name: "Monge",
                stats: { speed: 5, staminaRegen: 0.3, dashStaminaCost: -5 },
                skill: { name: "Meditação", effect: "Restaura 20 de Stamina", cooldown: 10000 }
            },
            lutador: {
                name: "Lutador",
                stats: { attack: 3, health: 20, attackStaminaCost: -2 },
                skill: { name: "Soco Poderoso", effect: "Causa 150% de dano", cooldown: 8000 }
            }
        }
    },
    elf: { 
        art: [" O ", "/|\\", "/ \\"], 
        stats: { 
            health: 80, 
            speed: 12, 
            attack: 4, 
            stamina: 90,
            strength: 3,
            agility: 7,
            vitality: 4
        }, 
        description: "Rápido e ágil, ideal para estratégias evasivas.",
        subclasses: {
            arqueiro: {
                name: "Arqueiro",
                stats: { speed: 3, attack: 2 },
                skill: { name: "Tiro Preciso", effect: "Causa 200% de dano à distância", cooldown: 12000 }
            },
            druida: {
                name: "Druida",
                stats: { staminaRegen: 0.4, health: 10 },
                skill: { name: "Cura Natural", effect: "Recupera 10 HP por 5s", cooldown: 15000 }
            }
        }
    },
    dwarf: { 
        art: [" O ", "/|\\", "/ \\"], 
        stats: { 
            health: 120, 
            speed: 8, 
            attack: 6, 
            stamina: 110,
            strength: 7,
            agility: 3,
            vitality: 6
        }, 
        description: "Forte e resistente, perfeito para combates diretos.",
        subclasses: {
            ferreiro: {
                name: "Ferreiro",
                stats: { defense: 3, attack: 1 },
                skill: { name: "Forja Rápida", effect: "Aumenta ATK em 5 por 10s", cooldown: 20000 }
            },
            berserker: {
                name: "Berserker",
                stats: { attack: 4, defense: -2 },
                skill: { name: "Fúria", effect: "Aumenta dano em 20% por 8s", cooldown: 18000 }
            }
        }
    },
    ogre: { 
        art: [" O ", "/|\\", "/ \\"], 
        stats: { 
            health: 150, 
            speed: 6, 
            attack: 8, 
            stamina: 120,
            strength: 8,
            agility: 2,
            vitality: 7
        }, 
        description: "Extremamente forte, mas lento. Ideal para causar dano massivo.",
        subclasses: {
            brutamontes: {
                name: "Brutamontes",
                stats: { strength: 3, attack: 3 },
                skill: { name: "Esmagar", effect: "Causa dano em área (10 de dano)", cooldown: 15000 }
            },
            xama: {
                name: "Xamã",
                stats: { vitality: 2, health: 20 },
                skill: { name: "Totem de Força", effect: "Aumenta atributos em 2 por 10s", cooldown: 20000 }
            }
        }
    }
};

// Variáveis globais
let selectedCharacter = null;
let npcChrystian = null;
let keysPressed = {};
let isMoving = false;
let lastMoveTime = 0;
let stamina = 100;
let dialogueIndex = 0;
let moveDirections = { up: false, down: false, left: false, right: false };
let isDashing = false;
let lastDashTime = 0;
let isInDialogue = false;
let currentMission = null;
let savedCharacter = null;
let chest = null;
let selectedChestItemIndex = null;
let chestItems = [];
let chestOpened = false;
let xp = 0;
let level = 1;
let points = 0;
let enemies = [];
let gameTime = 0;
let isGamePaused = false;
let hasNewMission = false;
let isMenuOpen = false;
let enemyAttackCooldown = 0;
let lastAttackTime = 0;
let cooldowns = {
    healthPotion: 0,
    staminaPotion: 0,
    skill: 0
};
let inventory = {
    items: [],
    maxSlots: 20
};
let selectedSubclass = null;
const ENEMY_ATTACK_INTERVAL = 2000;
const ENEMY_MOVE_SPEED = 1.5;
const ENEMY_DETECTION_RANGE = 150;
const INTERACTION_DISTANCE = 100; // Duplicado de 50 para 100
let currentDialogueText = "";
let typingIndex = 0;
let isTyping = false;

// Elementos do DOM
const messageLog = document.getElementById('message-log');
const practiceMap = document.getElementById('practice-map');
const startBtn = document.getElementById('start-btn');
const objectivesList = document.getElementById('objectives-list');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const dialogueOptions = document.getElementById('dialogue-options');

const dialogues = [
    [
        "Olá, me chamo Chrystian. Eu sou o criador deste mundo! Bem-vindo ao ASCII Adventure!",
        "Missão: Aproxime-se de mim e pressione H para conversar. Aceita?"
    ],
    [
        "Ótimo trabalho! Você aprendeu a interagir comigo.",
        "Agora, vamos aprender a usar o dash. Segure Shift enquanto se move para fazer um dash.",
        "Missão: Use Shift + W/A/S/D para executar um dash 2 vezes. Aceita?"
    ],
    [
        "Você está se saindo muito bem! Agora vamos para o combate.",
        "Missão: Derrote o Slime de treinamento. Aceita?"
    ],
    [
        "Você derrotou o Slime! Um baú de recompensas apareceu.",
        "Missão: Aproxime-se do baú e pressione H para abri-lo. Aceita?"
    ],
    [
        "Excelente! Você completou o tutorial básico!",
        "Está pronto para a verdadeira aventura?"
    ]
];

const items = {
    healthPotion: {
        name: "Poção de Vida",
        emoji: "❤️",
        effect: { health: 20 },
        description: "Restaura 20 HP"
    },
    staminaPotion: {
        name: "Poção de Energia",
        emoji: "⚡",
        effect: { stamina: 30 },
        description: "Restaura 30 de Stamina"
    },
    sword: {
        name: "Espada Simples",
        emoji: "⚔️",
        effect: { attack: 3 },
        description: "Aumenta ATK em 3",
        equipable: true
    },
    shield: {
        name: "Escudo de Madeira",
        emoji: "🛡️",
        effect: { defense: 2 },
        description: "Aumenta DEF em 2",
        equipable: true
    }
};

// Sistema de missões
const missions = [
    { 
        id: "talk", 
        text: "Fale com Chrystian", 
        completed: false, 
        active: true, 
        progress: 0, 
        maxProgress: 1, 
        check: function() { return this.progress >= this.maxProgress; }, 
        reward: { points: 10, xp: 20 }
    },
    { 
        id: "dash", 
        text: "Use o dash 2 vezes", 
        completed: false, 
        active: false, 
        progress: 0, 
        maxProgress: 2, 
        check: function() { return this.progress >= this.maxProgress; }, 
        reward: { points: 10, xp: 80 }
    },
    { 
        id: "kill", 
        text: "Derrote o Slime de treinamento", 
        completed: false, 
        active: false, 
        progress: 0, 
        maxProgress: 1, 
        check: function() { return this.progress >= this.maxProgress; }, 
        reward: { points: 15, xp: 30 }
    },
    { 
        id: "open_chest", 
        text: "Abra o baú de recompensas", 
        completed: false, 
        active: false, 
        progress: 0, 
        maxProgress: 1, 
        check: function() { return this.progress >= this.maxProgress; }, 
        reward: { points: 10, xp: 20 }
    }
];

// Adicionar evento ao botão "Partir para a Aventura"
document.getElementById('start-btn').addEventListener('click', () => {
    if (!startBtn.disabled) {
        window.location.href = '../mapa_floresta/floresta.html';
    }
});

// Objeto de status do jogo
const gameStats = {
    isRunning: false,
    points: 0,
    missionsCompleted: 0
};

// Função para completar missão
function completeMission(missionId) {
    const mission = missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
        mission.completed = true;
        mission.active = false;
        points += mission.reward.points;
        xp += mission.reward.xp;
        addMessage(`Missão completada: ${mission.text}! +${mission.reward.points} pontos, +${mission.reward.xp} XP`, "victory");

        const currentIndex = missions.findIndex(m => m.id === missionId);
        const nextMissionIndex = currentIndex + 1;
        if (nextMissionIndex < missions.length) {
            hasNewMission = true;
            addMessage(`Fale com Chrystian para receber uma nova missão!`, "info");
        }

        if (missionId === "dash") {
            addItemToInventory('staminaPotion', 2);
        } else if (missionId === "kill") {
            addItemToInventory('sword', 1);
        }

        showRewardPopup(mission.text, mission.reward.points);

        updateCharacterStats();
        updateNPCAppearance();
        updateMissionPanel();
        checkMissions();

        let missionIndex = missions.findIndex(m => !m.completed);
        if (missionIndex !== -1 && missions[missionIndex].id !== missionId) {
            hasNewMission = true;
            updateNPCAppearance();
        }
    }
}

function showRewardPopup(missionText, reward) {
    const popup = document.createElement('div');
    popup.className = 'reward-popup';
    popup.innerHTML = `
        <h3>Missão Completa!</h3>
        <p>${missionText}</p>
        <p>Recompensa: +${reward} pontos</p>
    `;
    document.body.appendChild(popup);
    
    // Adiciona a animação de fade-out e remove após 3 segundos
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.remove();
        }, 500); // Tempo da animação de fade-out
    }, 2500); // Popup visível por 2.5 segundos antes de começar o fade-out
}

function updateNPCAppearance() {
    if (!npcChrystian) return;
    
    const existingAlert = npcChrystian.querySelector('.mission-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    if (hasNewMission) {
        const alert = document.createElement('div');
        alert.className = 'mission-alert';
        alert.textContent = '!';
        npcChrystian.appendChild(alert);
    }
}

function showDialogue(missionIndex, lineIndex) {
    if (missionIndex >= dialogues.length || !dialogueBox || !dialogueText) return;

    isInDialogue = true;
    dialogueBox.style.display = "block";
    typeDialogue(dialogues[missionIndex][lineIndex]); // Usa a nova função com animação

    if (lineIndex === dialogues[missionIndex].length - 1 && missionIndex < missions.length) {
        dialogueOptions.style.display = "block";
    } else {
        dialogueOptions.style.display = "none";
    }
}

function typeDialogue(text) {
    if (isTyping) return;
    isTyping = true;
    currentDialogueText = text;
    typingIndex = 0;
    dialogueText.textContent = "";
    
    function type() {
        if (typingIndex < currentDialogueText.length) {
            dialogueText.textContent += currentDialogueText.charAt(typingIndex);
            typingIndex++;
            setTimeout(type, 50); // Velocidade de digitação (50ms por letra)
        } else {
            isTyping = false;
        }
    }
    type();
}

function initGame() {
    if (!practiceMap) {
        console.error("Elemento #practice-map não encontrado!");
        addMessage("Erro: Elemento do mapa de prática não encontrado.", "error");
        return;
    }

    savedCharacter = JSON.parse(localStorage.getItem("currentCharacter"));
    if (!savedCharacter) {
        console.error("Nenhum personagem encontrado no localStorage!");
        addMessage("Erro: Nenhum personagem encontrado. Volte à criação de personagem.", "error");
        window.location.href = "../char_create.html";
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.disabled = true;
        return;
    }

    // Inicializar lastUsed para todas as habilidades de subclasses
    Object.values(races).forEach(race => {
        Object.values(race.subclasses).forEach(subclass => {
            subclass.skill.lastUsed = 0;
        });
    });

    const characterRace = savedCharacter.race;

    missions.forEach(mission => {
        mission.active = mission.id === "talk";
    });

    displayCharacter();
    addMessage("Bem-vindo ao tutorial! Fale com Chrystian para começar.");
    addCharacterToPracticeMap();
    createMissionPanel();
    startGameTimer();
    updateNPCAppearance();

    setInterval(() => {
        if (!isGamePaused) {
            stamina = Math.min(stamina + savedCharacter.stats.staminaRegen, savedCharacter.stats.maxStamina);
            updateCharacterStats();
        }
    }, 1000);
}

function gainXP(amount) {
    xp += amount;
    addMessage(`+${amount} XP! (${xp}/${level * 100})`);
    if (xp >= level * 100) {
        levelUp();
    }
}

function levelUp() {
    level++;
    xp = 0;
    addMessage(`Level Up! Agora você é nível ${level}.`, "victory");
    
    // Aumenta o HP com base na vitalidade (2 HP por ponto de vitalidade)
    const vitalityIncrease = savedCharacter.stats.vitality * 2; // 2 HP por ponto de vitalidade
    savedCharacter.stats.health += vitalityIncrease;
    savedCharacter.stats.maxHealth += vitalityIncrease;
    savedCharacter.stats.attack += 1;
    savedCharacter.stats.stamina += 5;
    savedCharacter.stats.maxStamina += 5;
    
    // Verifica se atingiu o nível 2 e avisa sobre a escolha de subclasse
    if (level === 2 && !selectedSubclass) {
        addMessage("Você pode escolher uma subclasse! Abra o menu de Habilidades (M, depois H).", "victory");
        // Removido document.getElementById('subclass-selection').style.display = 'block';
        // O elemento subclass-selection não existe no tutorial.html
    }

    updateCharacterStats();
}
function handleDash() {
    if (isInDialogue || isGamePaused) return;
    const now = Date.now();
    if (keysPressed['shift'] && 
        !isDashing && 
        stamina >= savedCharacter.stats.dashStaminaCost && 
        now - lastDashTime >= 5000) {
        
        isDashing = true;
        lastDashTime = now;
        stamina -= savedCharacter.stats.dashStaminaCost;
        addMessage("Dash executado!", "info");
        
        const dashMission = missions.find(m => m.id === "dash" && m.active && !m.completed);
        if (dashMission) {
            dashMission.progress++;
            if (dashMission.check()) {
                completeMission("dash");
            }
            updateMissionPanel();
        }
        
        setTimeout(() => {
            isDashing = false;
        }, 300);
    }
}

function moveCharacter(dx, dy) {
    if (!selectedCharacter || isMoving || isInDialogue || isGamePaused) return;
    const now = Date.now();
    const moveCooldown = savedCharacter.stats.moveCooldown;
    if (now - lastMoveTime < moveCooldown) return;

    let moveDistance = 20;
    
    if (isDashing) {
        moveDistance *= savedCharacter.stats.dashMultiplier;
    }

    const currentTop = parseInt(selectedCharacter.style.top) || 0;
    const currentLeft = parseInt(selectedCharacter.style.left) || 0;
    const newTop = currentTop + (dy * moveDistance);
    const newLeft = currentLeft + (dx * moveDistance);

    const collision = checkCollision(selectedCharacter, newLeft, newTop);
    if (!collision) {
        isMoving = true;
        lastMoveTime = now;
        selectedCharacter.style.top = newTop + "px";
        selectedCharacter.style.left = newLeft + "px";
        trackMovement(dx, dy);
        updateCharacterStats();
        
        setTimeout(() => {
            isMoving = false;
        }, 300);
    } else {
        if (collision === 'border') {
            addMessage("Você atingiu o limite da área de treino!", "warning");
        } else if (collision === 'npc') {
            addMessage("Você não pode passar por cima do NPC!", "warning");
        } else if (collision === 'enemy') {
            fightEnemy();
        }
    }
}

function checkEnemyProximity() {
    const enemy = document.querySelector('.enemy');
    if (!enemy || !selectedCharacter) return false;
    
    const enemyX = parseInt(enemy.style.left) || 0;
    const enemyY = parseInt(enemy.style.top) || 0;
    const playerX = parseInt(selectedCharacter.style.left) || 0;
    const playerY = parseInt(selectedCharacter.style.top) || 0;
    
    const distance = Math.sqrt((playerX - enemyX) ** 2 + (playerY - enemyY) ** 2);
    const hitbox = enemy.querySelector('.enemy-hitbox');
    
    if (hitbox) {
        hitbox.style.display = distance <= INTERACTION_DISTANCE * 1.5 ? "block" : "none";
    }
    
    return distance <= INTERACTION_DISTANCE * 1.5;
}

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    const menu = document.getElementById('game-menu');
    if (menu) {
        menu.style.display = isMenuOpen ? 'block' : 'none';
        isGamePaused = isMenuOpen;
    }
}

function handleAttack() {
    if (!checkEnemyProximity() || isInDialogue || isGamePaused) return;
    
    const now = Date.now();
    if (now - lastAttackTime < savedCharacter.stats.attackCooldown) return;

    if (stamina < savedCharacter.stats.attackStaminaCost) {
        addMessage("Stamina insuficiente para atacar!", "warning");
        return;
    }

    lastAttackTime = now;
    fightEnemy();
}

function fightEnemy() {
    const enemy = document.querySelector('.enemy');
    if (!enemy) return;

    stamina -= savedCharacter.stats.attackStaminaCost;
    
    selectedCharacter.classList.add('attacking');
    let damage = Math.floor(Math.random() * savedCharacter.stats.attack) + 1;
    
    if (selectedSubclass === 'lutador' && keysPressed['q']) {
        const now = Date.now();
        const skill = races[savedCharacter.race].subclasses.lutador.skill;
        if (now - skill.lastUsed >= skill.cooldown) {
            damage = Math.floor(damage * 1.5);
            skill.lastUsed = now;
            addMessage(`Soco Poderoso usado! Dano: ${damage}`, "victory");
        } else {
            addMessage(`Soco Poderoso em cooldown! Aguarde ${((skill.cooldown - (now - skill.lastUsed))/1000).toFixed(1)}s`, "warning");
            return;
        }
    }
    
    setTimeout(() => {
        enemy.classList.add('took-damage');
        
        let enemyHP = parseInt(enemy.getAttribute('data-hp')) - damage;
        enemy.setAttribute('data-hp', enemyHP);
        
        addMessage(`Você atacou o Slime causando ${damage} de dano!`, "info");
        
        if (enemyHP <= 0) {
            enemy.remove();
            const mission = missions.find(m => m.id === "kill");
            if (mission) {
                mission.progress++;
                if (mission.check()) {
                    completeMission("kill");
                }
            }
            addMessage("Slime derrotado!", "victory");
        }
        
        setTimeout(() => {
            enemy.classList.remove('took-damage');
        }, 500);
        
        updateCharacterStats();
    }, 200);
    
    setTimeout(() => {
        selectedCharacter.classList.remove('attacking');
    }, 300);
}

function spawnChest() {
    chest = document.createElement("div");
    chest.className = "chest";
    chest.style.top = "100px";
    chest.style.left = "300px";
    chest.innerHTML = `
        <img src="../../imagens/bau.png" alt="Chest" class="chest-image">
        <div class="h-interaction">H</div>
    `;
    practiceMap.appendChild(chest);
    addMessage("Um baú de recompensas apareceu!", "victory");
}

function openChestMenu() {
    if (chestOpened) return;
    chestOpened = true;
    isGamePaused = true;
    document.getElementById('chest-menu').style.display = 'block';
    if (chestItems.length === 0) { // Inicializa apenas se o baú estiver vazio
        chestItems = [
            { type: 'healthPotion', quantity: 1 },
            { type: 'staminaPotion', quantity: 1 },
            { type: 'sword', quantity: 1 }
        ];
    }
    renderChestItems();
}

function renderChestItems() {
    const slots = document.getElementById('chest-slots');
    slots.innerHTML = '';
    
    chestItems.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            ${items[item.type].emoji}
            ${item.quantity > 1 ? `<span class="item-count">${item.quantity}</span>` : ''}
        `;
        slot.title = `${items[item.type].name}\n${items[item.type].description}`;
        slot.onclick = () => selectChestItem(index);
        if (selectedChestItemIndex === index) {
            slot.classList.add('selected');
        }
        slots.appendChild(slot);
    });
    
    for (let i = chestItems.length; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.textContent = '+';
        slot.title = 'Slot vazio';
        slots.appendChild(slot);
    }

    if (chestItems.length === 0) {
        closeChestMenu();
        addMessage("Baú vazio! Tela fechada.", "info");
    }
}

function selectChestItem(index) {
    selectedChestItemIndex = index;
    const item = chestItems[index];
    if (item) {
        showItemInfo(item);
    } else {
        document.getElementById('chest-item-info').textContent = '';
    }
    renderChestItems();
}

function showItemInfo(item) {
    const infoDiv = document.getElementById('chest-item-info');
    if (item) {
        const itemData = items[item.type];
        infoDiv.textContent = `${itemData.name}: ${itemData.description}`;
    } else {
        infoDiv.textContent = '';
    }
}

function transferItemToInventory(index) {
    const item = chestItems[index];
    if (!item) return;
    
    const success = addItemToInventory(item.type, item.quantity);
    if (success) {
        addMessage(`${items[item.type].name} adicionada ao inventário!`, "victory");
        chestItems.splice(index, 1);
        selectedChestItemIndex = null;
        renderChestItems();
        showItemInfo(null);
    }
}

function closeChestMenu() {
    isGamePaused = false;
    document.getElementById('chest-menu').style.display = 'none';
    selectedChestItemIndex = null;
    document.getElementById('chest-item-info').textContent = '';
    chestOpened = false; // Resetando a variável para permitir reabrir o baú

    // Verifica se o baú está vazio
    if (chestItems.length === 0) {
        addMessage("Baú vazio! Ele desaparecerá em 5 segundos.", "info");
        setTimeout(() => {
            if (chest && chest.parentNode) {
                chest.remove();
                chest = null;
                addMessage("Baú desapareceu!", "info");
            }
        }, 5000); // 5 segundos
    } else {
        addMessage(`Baú ainda contém ${chestItems.length} item(s). Ele permanecerá no mapa.`, "info");
    }
}

function openSkillsMenu() {
    isGamePaused = true;
    document.getElementById('skills-menu').style.display = 'block';
    renderSkills();
}

function closeSkillsMenu() {
    isGamePaused = false;
    document.getElementById('skills-menu').style.display = 'none';
}

function renderSkills() {
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';

    // Não exibimos uma "base skill" porque ela não existe no jogo atualmente
    // Vamos direto para a lógica de subclasse

    if (level < 2) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = 'Alcance o nível 2 para escolher uma subclasse!';
        skillsList.appendChild(messageDiv);
    } else if (!selectedSubclass) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = 'Escolha uma subclasse para desbloquear sua habilidade!';
        skillsList.appendChild(messageDiv);

        // Exibir opções de subclasse disponíveis para a raça do personagem
        const subclassOptions = document.createElement('div');
        subclassOptions.className = 'subclass-options';
        const raceSubclasses = races[savedCharacter.race].subclasses;
        
        Object.keys(raceSubclasses).forEach(subclassKey => {
            const button = document.createElement('button');
            button.textContent = raceSubclasses[subclassKey].name;
            button.onclick = () => selectSubclass(subclassKey);
            subclassOptions.appendChild(button);
        });
        
        skillsList.appendChild(subclassOptions);
    } else {
        // Exibir a habilidade da subclasse escolhida
        const subclassSkill = races[savedCharacter.race].subclasses[selectedSubclass].skill;
        const subclassSkillDiv = document.createElement('div');
        subclassSkillDiv.textContent = `${subclassSkill.name}: ${subclassSkill.effect} (Cooldown: ${subclassSkill.cooldown/1000}s)`;
        skillsList.appendChild(subclassSkillDiv);
    }
}

function selectSubclass(subclass) {
    if (selectedSubclass) return;
    selectedSubclass = subclass;
    const subclassData = races[savedCharacter.race].subclasses[subclass];

    // Aplicar os status da subclasse
    for (let stat in subclassData.stats) {
        if (stat === 'health') {
            savedCharacter.stats.health += subclassData.stats.health;
            savedCharacter.stats.maxHealth += subclassData.stats.health;
        } else if (stat === 'dashStaminaCost' || stat === 'attackStaminaCost') {
            savedCharacter.stats[stat] = Math.max(1, savedCharacter.stats[stat] + subclassData.stats[stat]);
        } else if (stat === 'staminaRegen') {
            savedCharacter.stats[stat] = (savedCharacter.stats[stat] || 0) + subclassData.stats[stat];
        } else {
            savedCharacter.stats[stat] = (savedCharacter.stats[stat] || 0) + subclassData.stats[stat];
        }
    }

    addMessage(`Subclasse ${subclassData.name} selecionada!`, "victory");
    updateCharacterStats();
    renderSkills();
}

function useSkill() {
    if (!selectedSubclass) {
        addMessage("Você precisa escolher uma subclasse primeiro! (Nível 2)", "warning");
        return;
    }
    if (isInDialogue || isGamePaused) return;

    const now = Date.now();
    const subclass = races[savedCharacter.race].subclasses[selectedSubclass];
    const skill = subclass.skill;

    if (now - skill.lastUsed < skill.cooldown) {
        addMessage(`${skill.name} em cooldown! Aguarde ${((skill.cooldown - (now - skill.lastUsed))/1000).toFixed(1)}s`, "warning");
        return;
    }

    // Aplicar o efeito da habilidade com base na subclasse
    if (selectedSubclass === 'monge') {
        stamina = Math.min(stamina + 20, savedCharacter.stats.maxStamina);
        addMessage(`${skill.name} usada! +20 Stamina`, "victory");
    } else if (selectedSubclass === 'lutador') {
        // O efeito do "Soco Poderoso" já está implementado no handleAttack(), então aqui apenas marcamos o cooldown
        addMessage(`${skill.name} pronta para uso! Use com [ENTER]`, "victory");
    } else if (selectedSubclass === 'arqueiro') {
        // Tiro Preciso: Aplica dano à distância (iremos simular o efeito para o tutorial)
        const enemy = document.querySelector('.enemy');
        if (enemy) {
            const damage = Math.floor(savedCharacter.stats.attack * 2);
            let enemyHP = parseInt(enemy.getAttribute('data-hp')) - damage;
            enemy.setAttribute('data-hp', enemyHP);
            addMessage(`Tiro Preciso usado! Causou ${damage} de dano ao Slime`, "victory");
            if (enemyHP <= 0) {
                enemy.remove();
                const mission = missions.find(m => m.id === "kill");
                if (mission) {
                    mission.progress++;
                    if (mission.check()) {
                        completeMission("kill");
                    }
                }
                addMessage("Slime derrotado!", "victory");
            }
        } else {
            addMessage("Nenhum inimigo ao alcance para Tiro Preciso!", "warning");
        }
    } else if (selectedSubclass === 'druida') {
        // Cura Natural: Recupera 10 HP por 5s
        let ticks = 5;
        const interval = setInterval(() => {
            if (ticks <= 0 || savedCharacter.stats.health <= 0) {
                clearInterval(interval);
                return;
            }
            savedCharacter.stats.health = Math.min(
                savedCharacter.stats.health + 10,
                savedCharacter.stats.maxHealth
            );
            addMessage("Cura Natural: +10 HP", "victory");
            updateCharacterStats();
            ticks--;
        }, 1000);
    } else if (selectedSubclass === 'ferreiro') {
        // Forja Rápida: Aumenta ATK em 5 por 10s
        savedCharacter.stats.attack += 5;
        addMessage("Forja Rápida usada! ATK +5 por 10s", "victory");
        updateCharacterStats();
        setTimeout(() => {
            savedCharacter.stats.attack -= 5;
            addMessage("Efeito de Forja Rápida acabou.", "info");
            updateCharacterStats();
        }, 10000);
    } else if (selectedSubclass === 'berserker') {
        // Fúria: Aumenta dano em 20% por 8s
        const originalAttack = savedCharacter.stats.attack;
        savedCharacter.stats.attack = Math.floor(savedCharacter.stats.attack * 1.2);
        addMessage("Fúria usada! Dano aumentado em 20% por 8s", "victory");
        updateCharacterStats();
        setTimeout(() => {
            savedCharacter.stats.attack = originalAttack;
            addMessage("Efeito de Fúria acabou.", "info");
            updateCharacterStats();
        }, 8000);
    } else if (selectedSubclass === 'brutamontes') {
        // Esmagar: Causa dano em área
        const enemy = document.querySelector('.enemy');
        if (enemy) {
            const damage = 10;
            let enemyHP = parseInt(enemy.getAttribute('data-hp')) - damage;
            enemy.setAttribute('data-hp', enemyHP);
            addMessage(`Esmagar usado! Causou ${damage} de dano ao Slime`, "victory");
            if (enemyHP <= 0) {
                enemy.remove();
                const mission = missions.find(m => m.id === "kill");
                if (mission) {
                    mission.progress++;
                    if (mission.check()) {
                        completeMission("kill");
                    }
                }
                addMessage("Slime derrotado!", "victory");
            }
        } else {
            addMessage("Nenhum inimigo ao alcance para Esmagar!", "warning");
        }
    } else if (selectedSubclass === 'xama') {
        // Totem de Força: Aumenta atributos em 2 por 10s
        savedCharacter.stats.strength += 2;
        savedCharacter.stats.agility += 2;
        savedCharacter.stats.vitality += 2;
        savedCharacter.stats.attack += 2;
        savedCharacter.stats.speed += 2;
        addMessage("Totem de Força usado! Atributos +2 por 10s", "victory");
        updateCharacterStats();
        setTimeout(() => {
            savedCharacter.stats.strength -= 2;
            savedCharacter.stats.agility -= 2;
            savedCharacter.stats.vitality -= 2;
            savedCharacter.stats.attack -= 2;
            savedCharacter.stats.speed -= 2;
            addMessage("Efeito de Totem de Força acabou.", "info");
            updateCharacterStats();
        }, 10000);
    }

    skill.lastUsed = now;
    updateCharacterStats();
}

function checkNPCInteraction() {
    if (!npcChrystian || !selectedCharacter) return;
    
    const charTop = parseInt(selectedCharacter.style.top);
    const charLeft = parseInt(selectedCharacter.style.left);
    const npcTop = parseInt(npcChrystian.style.top);
    const npcLeft = parseInt(npcChrystian.style.left);
    const distanceToNPC = Math.sqrt((charTop - npcTop) ** 2 + (charLeft - npcLeft) ** 2);
    
    const hIndicator = npcChrystian.querySelector('.h-interaction');
    if (hIndicator) {
        if (distanceToNPC <= INTERACTION_DISTANCE) {
            hIndicator.style.display = "flex";
            const missionAlert = npcChrystian.querySelector('.mission-alert');
            if (missionAlert) {
                missionAlert.style.left = '30%';
                hIndicator.style.left = '70%';
            } else {
                hIndicator.style.left = '50%';
            }
            
            if (isInDialogue) {
                hIndicator.textContent = "S/N";
                hIndicator.classList.add('dialogue');
                hIndicator.style.backgroundColor = 'rgba(85, 255, 85, 0.3)';
            } else {
                hIndicator.textContent = "H";
                hIndicator.classList.remove('dialogue');
                hIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            }
        } else {
            hIndicator.style.display = "none";
            const missionAlert = npcChrystian.querySelector('.mission-alert');
            if (missionAlert) {
                missionAlert.style.left = '50%';
            }
        }
    }

    // Ajuste na lógica de proximidade do baú
    if (chest) {
        const chestTop = parseInt(chest.style.top) || 0;
        const chestLeft = parseInt(chest.style.left) || 0;
        const charTop = parseInt(selectedCharacter.style.top) || 0;
        const charLeft = parseInt(selectedCharacter.style.left) || 0;
        const distanceToChest = Math.sqrt((charTop - chestTop) ** 2 + (charLeft - chestLeft) ** 2);
        const chestHIndicator = chest.querySelector('.h-interaction');
        if (chestHIndicator) {
            // Exibe o ícone de interação se estiver dentro do raio, independentemente da direção
            chestHIndicator.style.display = distanceToChest <= INTERACTION_DISTANCE ? "flex" : "none";
            chestHIndicator.style.left = '50%'; // Centraliza o ícone
        }
    }
}

function spawnTrainingEnemy() {
    const enemyDiv = document.createElement("div");
    enemyDiv.className = "character enemy";
    enemyDiv.textContent = " S \n/|\\\n/ \\";
    enemyDiv.style.top = "200px";
    enemyDiv.style.left = "400px";
    enemyDiv.setAttribute('data-hp', 30);
    enemyDiv.setAttribute('data-name', 'Slime');
    enemyDiv.setAttribute('data-attack', '3');
    
    const hitbox = document.createElement("div");
    hitbox.className = "enemy-hitbox";
    enemyDiv.appendChild(hitbox);
    
    practiceMap.appendChild(enemyDiv);
    addMessage("Um Slime de treinamento apareceu!", "warning");
    
    startEnemyBehavior(enemyDiv);
}

function startEnemyBehavior(enemy) {
    const enemyInterval = setInterval(() => {
        if (!enemy.isConnected || isGamePaused) return;
        
        const currentHP = parseInt(enemy.getAttribute('data-hp'));
        if (currentHP <= 0) {
            clearInterval(enemyInterval);
            return;
        }
        
        moveEnemyTowardsPlayer(enemy);
        tryEnemyAttack(enemy);
    }, 100);
}

function moveEnemyTowardsPlayer(enemy) {
    if (!selectedCharacter || isGamePaused) return;
    
    const enemyX = parseInt(enemy.style.left) || 0;
    const enemyY = parseInt(enemy.style.top) || 0;
    const playerX = parseInt(selectedCharacter.style.left) || 0;
    const playerY = parseInt(selectedCharacter.style.top) || 0;
    
    const distance = Math.sqrt((playerX - enemyX) ** 2 + (playerY - enemyY) ** 2);
    
    if (distance > ENEMY_DETECTION_RANGE) return;
    
    const angle = Math.atan2(playerY - enemyY, playerX - enemyX);
    const moveX = Math.cos(angle) * ENEMY_MOVE_SPEED;
    const moveY = Math.sin(angle) * ENEMY_MOVE_SPEED;
    
    const newX = enemyX + moveX;
    const newY = enemyY + moveY;
    
    if (newX >= 0 && newX <= practiceMap.clientWidth - 30) {
        enemy.style.left = newX + "px";
    }
    if (newY >= 0 && newY <= practiceMap.clientHeight - 30) {
        enemy.style.top = newY + "px";
    }
}

function tryEnemyAttack(enemy) {
    const now = Date.now();
    if (now - enemyAttackCooldown < ENEMY_ATTACK_INTERVAL) return;
    
    if (!selectedCharacter) return;
    
    const enemyX = parseInt(enemy.style.left) || 0;
    const enemyY = parseInt(enemy.style.top) || 0;
    const playerX = parseInt(selectedCharacter.style.left) || 0;
    const playerY = parseInt(selectedCharacter.style.top) || 0;
    
    const distance = Math.sqrt((playerX - enemyX) ** 2 + (playerY - enemyY) ** 2);
    const attackRange = 40;
    
    if (distance <= attackRange) {
        enemyAttackCooldown = now;
        performEnemyAttack(enemy);
    }
}

function performEnemyAttack(enemy) {
    const attackDamage = parseInt(enemy.getAttribute('data-attack')) || 3;
    
    savedCharacter.stats.health -= attackDamage;
    addMessage(`Slime te atacou causando ${attackDamage} de dano!`, "error");
    selectedCharacter.classList.add('took-damage');
    setTimeout(() => {
        selectedCharacter.classList.remove('took-damage');
    }, 500);
    
    updateCharacterStats();
    
    if (savedCharacter.stats.health <= 0) {
        savedCharacter.stats.health = 0;
        addMessage("Você foi derrotado!", "error");
        updateCharacterStats();
    }
    
    enemy.classList.add('enemy-attacking');
    setTimeout(() => {
        enemy.classList.remove('enemy-attacking');
    }, 300);
}

function createMissionPanel() {
    const missionPanel = document.createElement("div");
    missionPanel.id = "mission-panel";
    missionPanel.style.position = "absolute";
    missionPanel.style.top = "10px";
    missionPanel.style.right = "10px";
    missionPanel.style.background = "rgba(0, 0, 0, 0.7)";
    missionPanel.style.border = "2px solid #ff9a00";
    missionPanel.style.padding = "10px";
    missionPanel.style.fontFamily = "'Press Start 2P', cursive";
    missionPanel.style.fontSize = "10px";
    missionPanel.style.color = "#e0e0e0";
    
    const title = document.createElement("h3");
    title.textContent = "MISSÕES ATIVAS";
    title.style.margin = "0 0 5px 0";
    title.style.color = "#ff9a00";
    
    missionPanel.appendChild(title);
    practiceMap.appendChild(missionPanel);
    updateMissionPanel();
}

function updateMissionPanel() {
    const missionPanel = document.getElementById("mission-panel");
    if (!missionPanel) return;
    
    while (missionPanel.childNodes.length > 1) {
        missionPanel.removeChild(missionPanel.lastChild);
    }
    
    missions.filter(m => m.active && !m.completed).forEach(mission => {
        const missionDiv = document.createElement("div");
        missionDiv.style.marginBottom = "5px";
        
        const missionText = document.createElement("div");
        missionText.textContent = mission.text;
        
        const progressBar = document.createElement("div");
        progressBar.style.height = "5px";
        progressBar.style.background = "#333";
        progressBar.style.marginTop = "3px";
        
        const progress = document.createElement("div");
        progress.style.height = "100%";
        progress.style.background = "#ff9a00";
        progress.style.width = `${(mission.progress / mission.maxProgress) * 100}%`;
        
        progressBar.appendChild(progress);
        missionDiv.appendChild(missionText);
        missionDiv.appendChild(progressBar);
        missionPanel.appendChild(missionDiv);
    });
    
    const pointsDiv = document.createElement("div");
    pointsDiv.style.marginTop = "10px";
    pointsDiv.textContent = `Pontos: ${points}`;
    missionPanel.appendChild(pointsDiv);
}

function startGameTimer() {
    setInterval(() => {
        if (!isGamePaused) {
            gameTime++;
            const minutes = Math.floor(gameTime / 60).toString().padStart(2, "0");
            const seconds = (gameTime % 60).toString().padStart(2, "0");
            
            const timeDisplay = document.getElementById("time-display");
            if (!timeDisplay) {
                const newTimeDisplay = document.createElement("div");
                newTimeDisplay.id = "time-display";
                newTimeDisplay.style.position = "absolute";
                newTimeDisplay.style.top = "10px";
                newTimeDisplay.style.left = "10px";
                newTimeDisplay.style.color = "#ff9a00";
                newTimeDisplay.style.fontFamily = "'Press Start 2P', cursive";
                newTimeDisplay.style.fontSize = "12px";
                practiceMap.appendChild(newTimeDisplay);
            } else {
                timeDisplay.textContent = `Tempo: ${minutes}:${seconds}`;
            }
        }
    }, 1000);
}

function addCharacterToPracticeMap() {
    console.log("Adicionando personagem ao mapa..."); // Log para depuração
    selectedCharacter = document.createElement("div");
    selectedCharacter.className = "character";
    if (!savedCharacter.art) {
        console.error("Erro: savedCharacter.art não está definido!");
        addMessage("Erro: Não foi possível renderizar o personagem no mapa.", "error");
        return;
    }
    selectedCharacter.textContent = savedCharacter.art.join("\n");
    const centerX = (practiceMap.clientWidth / 2) - 15;
    const centerY = (practiceMap.clientHeight / 2) - 15;
    selectedCharacter.style.top = centerY + "px";
    selectedCharacter.style.left = centerX + "px";
    practiceMap.appendChild(selectedCharacter);
    console.log("Personagem adicionado ao mapa:", selectedCharacter); // Log para depuração

    npcChrystian = document.createElement("div");
    npcChrystian.className = "npc";
    npcChrystian.style.top = "300px";
    npcChrystian.style.left = "600px";
    npcChrystian.innerHTML = `
        <img src="../../imagens/NpcTutorial.png" alt="Chrystian" class="npc-image">
        <div class="h-interaction">H</div>
    `;
    if (hasNewMission) {
        const alert = document.createElement('div');
        alert.className = 'mission-alert';
        alert.textContent = '!';
        npcChrystian.appendChild(alert);
    }
    practiceMap.appendChild(npcChrystian);
    console.log("NPC Chrystian adicionado ao mapa:", npcChrystian); // Log para depuração

    updateObjectives();
}

function closeDialogue() {
    isInDialogue = false;
    if (dialogueBox) dialogueBox.style.display = "none";
    if (dialogueOptions) dialogueOptions.style.display = "none";
    dialogueIndex = 0;
}

function displayCharacter() {
    const characterArt = document.getElementById('character-art');
    const characterStats = document.getElementById('character-stats');
    
    if (characterArt && characterStats) {
        if (!savedCharacter || !savedCharacter.art) {
            console.error("Erro: savedCharacter ou savedCharacter.art não está definido!");
            addMessage("Erro: Dados do personagem inválidos. Volte à criação de personagem.", "error");
            window.location.href = "../char_create.html";
            return;
        }
        characterArt.textContent = savedCharacter.art.join('\n');
        updateCharacterStats();
    } else {
        console.error("Erro: Elementos character-art ou character-stats não encontrados!");
        addMessage("Erro: Não foi possível exibir o personagem. Verifique o DOM.", "error");
    }
}

function openInventory() {
    isGamePaused = true;
    document.getElementById('inventory-menu').style.display = 'block';
    renderInventory();
}

function closeInventory() {
    isGamePaused = false;
    document.getElementById('inventory-menu').style.display = 'none';
}

function renderInventory() {
    const slots = document.getElementById('inventory-slots');
    slots.innerHTML = '';
    
    inventory.items.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            ${item.emoji}
            ${item.quantity > 1 ? `<span class="item-count">${item.quantity}</span>` : ''}
        `;
        
        slot.title = `${item.name}\n${item.description}`;
        slot.onclick = () => useItem(index);
        slots.appendChild(slot);
    });
    
    for (let i = inventory.items.length; i < inventory.maxSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.textContent = '+';
        slot.title = 'Slot vazio';
        slots.appendChild(slot);
    }
}

function addItemToInventory(itemType, quantity = 1) {
    const item = items[itemType];
    if (!item) return false;
    
    const existingItem = inventory.items.find(i => i.type === itemType);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        if (inventory.items.length >= inventory.maxSlots) {
            addMessage("Inventário cheio!", "warning");
            return false;
        }
        inventory.items.push({
            type: itemType,
            name: item.name,
            emoji: item.emoji,
            description: item.description,
            effect: item.effect,
            quantity: quantity,
            equipable: item.equipable || false
        });
    }
    
    addMessage(`Você adquiriu ${quantity}x ${item.name}`, "victory");
    return true;
}

function useItem(index) {
    if (index >= inventory.items.length) return;
    
    const now = Date.now();
    const item = inventory.items[index];
    const itemData = items[item.type];
    
    // Verifica cooldown
    if (cooldowns[item.type] > now) {
        const remaining = Math.ceil((cooldowns[item.type] - now) / 1000);
        addMessage(`${item.name} em cooldown! Aguarde ${remaining}s`, "warning");
        return;
    }

    // Aplica efeitos dependendo do tipo de item
    if (itemData.effect.health) {
        savedCharacter.stats.health = Math.min(
            savedCharacter.stats.health + itemData.effect.health,
            savedCharacter.stats.maxHealth
        );
        addMessage(`Usou ${item.name}: +${itemData.effect.health} HP`, "victory");
        cooldowns[item.type] = now + 10000; // 10 segundos de cooldown
    }
    
    if (itemData.effect.stamina) {
        stamina = Math.min(stamina + itemData.effect.stamina, savedCharacter.stats.maxStamina);
        addMessage(`Usou ${item.name}: +${itemData.effect.stamina} Stamina`, "victory");
        cooldowns[item.type] = now + 8000; // 8 segundos de cooldown
    }

    // Lógica para itens equipáveis como a espada
    if (itemData.equipable && itemData.effect.attack) {
        savedCharacter.stats.attack = (savedCharacter.stats.attack || 0) + itemData.effect.attack;
        addMessage(`Equipou ${item.name}: +${itemData.effect.attack} ATK`, "victory");
    }

    item.quantity--;
    if (item.quantity <= 0) {
        inventory.items.splice(index, 1);
    }
    
    updateCharacterStats();
    renderInventory();
    updateCooldownsDisplay();
}

function updateCooldownsDisplay() {
    const now = Date.now();
    const cooldownDisplay = document.getElementById('cooldown-display');
    
    if (!cooldownDisplay) return;
    
    let cooldownText = '';
    
    // Cooldowns de itens do inventário (poções, etc.)
    for (const [item, endTime] of Object.entries(cooldowns)) {
        if (endTime > now) {
            const remaining = Math.ceil((endTime - now) / 1000);
            cooldownText += `${item}: ${remaining}s\n`;
        }
    }
    
    // Cooldown da habilidade de subclasse
    if (selectedSubclass) {
        const skill = races[savedCharacter.race].subclasses[selectedSubclass].skill;
        const skillEndTime = skill.lastUsed + skill.cooldown;
        if (skillEndTime > now) {
            const remaining = Math.ceil((skillEndTime - now) / 1000);
            cooldownText += `${skill.name}: ${remaining}s\n`;
        }
    }
    
    // Cooldown do dash
    const dashCooldown = 5000; // Cooldown fixo do dash definido em handleDash()
    const dashEndTime = lastDashTime + dashCooldown;
    if (dashEndTime > now) {
        const remaining = Math.ceil((dashEndTime - now) / 1000);
        cooldownText += `Dash: ${remaining}s\n`;
    }
    
    cooldownDisplay.textContent = cooldownText || 'Nenhum cooldown ativo';
}

function updateCharacterStats() {
    const characterStats = document.getElementById('character-stats');
    if (characterStats) {
        characterStats.innerHTML = `
            HP: ${savedCharacter.stats.health}/${savedCharacter.stats.maxHealth}<br>
            ATK: ${savedCharacter.stats.attack}<br>
            SPD: ${savedCharacter.stats.speed}<br>
            STM: ${stamina.toFixed(1)}/${savedCharacter.stats.maxStamina}<br>
            ${selectedSubclass ? `Subclasse: ${races[savedCharacter.race].subclasses[selectedSubclass].name}` : ''}
        `;
    }

    const xpRequired = level * 100;
    while (xp >= xpRequired) {
        xp -= xpRequired;
        levelUp();
    }

    const hpBar = document.getElementById('hp-bar');
    const staminaBar = document.getElementById('stamina-bar');
    const xpBar = document.getElementById('xp-bar');

    if (hpBar) {
        hpBar.style.width = `${(savedCharacter.stats.health / savedCharacter.stats.maxHealth) * 100}%`;
    }
    if (staminaBar) {
        staminaBar.style.width = `${(stamina / savedCharacter.stats.maxStamina) * 100}%`;
    }
    if (xpBar) {
        xpBar.style.width = `${(xp / (level * 100)) * 100}%`;
    }
}

function trackMovement(dx, dy) {
    if (dy === -1) moveDirections.up = true;
    if (dy === 1) moveDirections.down = true;
    if (dx === -1) moveDirections.left = true;
    if (dx === 1) moveDirections.right = true;
    
    checkMissions();
}

function checkCollision(character, newX, newY) {
    if (!character) return true;
    const charWidth = 30;
    const charHeight = 30;
    const charRight = newX + charWidth;
    const charBottom = newY + charHeight;

    if (newX < 0 || newY < 0 || charRight > practiceMap.clientWidth || charBottom > practiceMap.clientHeight) {
        return 'border';
    }

    if (npcChrystian) {
        const npcX = parseInt(npcChrystian.style.left);
        const npcY = parseInt(npcChrystian.style.top);
        const npcWidth = 30;
        const npcHeight = 30;
        const npcRight = npcX + npcWidth;
        const npcBottom = npcY + npcHeight;

        if (newX < npcRight && charRight > npcX && newY < npcBottom && charBottom > npcY) {
            return 'npc';
        }
    }

    const enemy = document.querySelector('.enemy');
    if (enemy) {
        const enemyX = parseInt(enemy.style.left);
        const enemyY = parseInt(enemy.style.top);
        const enemyWidth = 30;
        const enemyHeight = 30;
        const enemyRight = enemyX + enemyWidth;
        const enemyBottom = enemyY + enemyHeight;

        if (newX < enemyRight && charRight > enemyX && newY < enemyBottom && charBottom > enemyY) {
            return 'enemy';
        }
    }

    if (chest) {
        const chestX = parseInt(chest.style.left);
        const chestY = parseInt(chest.style.top);
        const chestWidth = 64;
        const chestHeight = 64;
        const chestRight = chestX + chestWidth;
        const chestBottom = chestY + chestHeight;

        if (newX < chestRight && charRight > chestX && newY < chestBottom && charBottom > chestY) {
            return 'chest';
        }
    }

    return false;
}

function checkMissions() {
    let allCompleted = true;
    
    missions.forEach(mission => {
        if (mission.active && !mission.completed && mission.check()) {
            completeMission(mission.id);
        }
        
        if (!mission.completed) {
            allCompleted = false;
        }
    });
    
    if (allCompleted) {
        startBtn.disabled = false;
        addMessage("Tutorial completo! Fale com Chrystian para continuar!", "victory");
    }
    
    updateMissionPanel();
    updateObjectives();
}

function updateObjectives() {
    if (!objectivesList) return;
    objectivesList.innerHTML = "";
    missions.forEach(mission => {
        const li = document.createElement("li");
        li.id = `mission-${mission.id}`;
        li.textContent = mission.text;
        if (mission.completed) li.classList.add("completed");
        objectivesList.appendChild(li);
    });
}

function addMessage(text, type = "info") {
    if (!messageLog) return;
    const message = document.createElement("div");
    message.textContent = "> " + text;
    switch(type) {
        case "error": message.style.color = "#ff5555"; break;
        case "warning": message.style.color = "#ffaa00"; break;
        case "victory": message.style.color = "#55ff55"; break;
        case "npc": message.style.color = "#ff9a00"; break;
        default: message.style.color = "#e0e0e0";
    }
    messageLog.appendChild(message);
    messageLog.scrollTop = messageLog.scrollHeight;
}

function handleMovement() {
    if (isInDialogue || isGamePaused) return;
    checkNPCInteraction();
    checkEnemyProximity();
    
    if (keysPressed['arrowup'] || keysPressed['w']) moveCharacter(0, -1);
    if (keysPressed['DIMENSÃO'] || keysPressed['s']) moveCharacter(0, 1);
    if (keysPressed['arrowleft'] || keysPressed['a']) moveCharacter(-1, 0);
    if (keysPressed['arrowright'] || keysPressed['d']) moveCharacter(1, 0);
    
    if (keysPressed['shift']) {
        handleDash();
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keysPressed[key] = true;

    if (key === 'i' && !isInDialogue) {
        e.preventDefault();
        if (document.getElementById('inventory-menu').style.display === 'block') {
            closeInventory();
        } else if (isMenuOpen) {
            openInventory();
        }
        return;
    }

    if (key === 'h' && !isInDialogue && isMenuOpen) {
        e.preventDefault();
        if (document.getElementById('skills-menu').style.display === 'block') {
            closeSkillsMenu();
        } else {
            openSkillsMenu();
        }
        return;
    }

    if (key === 'h' && !isInDialogue && !isMenuOpen) {
        e.preventDefault();
        const charTop = parseInt(selectedCharacter.style.top);
        const charLeft = parseInt(selectedCharacter.style.left);

        // Interação com NPC
        if (npcChrystian) {
            const npcTop = parseInt(npcChrystian.style.top);
            const npcLeft = parseInt(npcChrystian.style.left);
            const distanceToNPC = Math.sqrt((charTop - npcTop) ** 2 + (charLeft - npcLeft) ** 2);
            
            if (distanceToNPC <= INTERACTION_DISTANCE) {
                let missionIndex = missions.findIndex(m => !m.completed);
                if (missionIndex === -1) missionIndex = missions.length - 1;
                
                if (missionIndex < dialogues.length) {
                    showDialogue(missionIndex, dialogueIndex);
                    const mission = missions[missionIndex];
                    if (mission && mission.id === "talk") {
                        mission.progress++;
                        if (mission.check()) {
                            completeMission("talk");
                        }
                    }
                }
                return;
            }
        }

        // Interação com baú
        if (chest) {
            const chestTop = parseInt(chest.style.top);
            const chestLeft = parseInt(chest.style.left);
            const distanceToChest = Math.sqrt((charTop - chestTop) ** 2 + (charLeft - chestLeft) ** 2);
            
            if (distanceToChest <= INTERACTION_DISTANCE) {
                openChestMenu();
                const mission = missions.find(m => m.id === "open_chest");
                if (mission) {
                    mission.progress++;
                    if (mission.check()) {
                        completeMission("open_chest");
                    }
                }
                return;
            }
        }
    }

    if (key === 'q') {
        useSkill();
    }

    if (key === 'e' && document.getElementById('chest-menu').style.display === 'block') {
        e.preventDefault();
        if (selectedChestItemIndex !== null) {
            transferItemToInventory(selectedChestItemIndex);
        } else {
            closeChestMenu();
        }
        return;
    }

    if (key === 'enter') {
        e.preventDefault();
        handleAttack();
    }

    if (key === 'm' && !isInDialogue) {
        e.preventDefault();
        toggleMenu();
        return;
    }

    if (isInDialogue) {
        if (key === ' ') {
            e.preventDefault();
            if (isTyping) {
                // Se ainda estiver digitando, completa o texto imediatamente
                dialogueText.textContent = currentDialogueText;
                typingIndex = currentDialogueText.length;
                isTyping = false;
            } else {
                let missionIndex = missions.findIndex(m => !m.completed);
                if (missionIndex === -1) missionIndex = missions.length - 1;

                if (missionIndex < dialogues.length) {
                    if (dialogueIndex < dialogues[missionIndex].length - 1) {
                        dialogueIndex++;
                        showDialogue(missionIndex, dialogueIndex);
                    } else if (missionIndex >= missions.length) {
                        closeDialogue();
                    }
                }
            }
        }

        if (key === 's' && dialogueOptions.style.display === "block") {
            e.preventDefault();
            let missionIndex = missions.findIndex(m => !m.completed);
            if (missionIndex !== -1) {
                currentMission = missions[missionIndex];
                currentMission.active = true;
                addMessage(`Missão aceita: ${currentMission.text}`, "victory");
                hasNewMission = false;
                updateNPCAppearance();
                closeDialogue();
                if (currentMission.id === "kill") {
                    spawnTrainingEnemy();
                } else if (currentMission.id === "open_chest") {
                    spawnChest();
                }
            }
        }

        if (key === 'n' && dialogueOptions.style.display === "block") {
            e.preventDefault();
            closeDialogue();
            addMessage("Missão recusada.", "warning");
        }
    }
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});

// Event listeners para botões do menu
document.getElementById('menu-inventory').addEventListener('click', openInventory);
document.getElementById('close-inventory').addEventListener('click', closeInventory);
document.getElementById('menu-skills').addEventListener('click', openSkillsMenu);
document.getElementById('close-skills').addEventListener('click', closeSkillsMenu);
document.getElementById('menu-close').addEventListener('click', toggleMenu);
document.getElementById('close-chest').addEventListener('click', closeChestMenu);

// Event listener para o botão de retorno
document.getElementById('return-btn').addEventListener('click', () => {
    window.location.href = '../../index.html';
});

// Inicialização do jogo
initGame();

// Loop principal do jogo
function gameLoop() {
    if (!isGamePaused) {
        handleMovement();
        updateCooldownsDisplay();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
