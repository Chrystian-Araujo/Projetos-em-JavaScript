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

let selectedRace = 'human';
let attributes = {
    strength: 5,
    agility: 5,
    vitality: 5
};
let pointsRemaining = 10;
let characterName = '';
let lastMessage = '';

const messageLog = document.getElementById('message-log');
const confirmBtn = document.getElementById('confirm-btn');
const charNameInput = document.getElementById('char-name');
const charRaceSelect = document.getElementById('char-race');
const randomizeBtn = document.getElementById('randomize-btn');

function initCreation() {
    updatePreview();
    updateSubclassInfo();
    addMessage("Crie seu personagem para a aventura!");
    
    charRaceSelect.addEventListener('change', (e) => {
        selectedRace = e.target.value;
        resetAttributes();
        updatePreview();
        updateSubclassInfo();
        addMessage(`Raça selecionada: ${selectedRace}`);
    });
    
    if (!charNameInput) {
        addMessage("Erro: Não foi possível encontrar o campo de nome.", "error");
        return;
    }
    charNameInput.addEventListener('input', (e) => {
        characterName = e.target.value.trim();
        validateForm();
    });

    if (!confirmBtn) {
        addMessage("Erro: Não foi possível encontrar o botão de confirmar.", "error");
        return;
    }
    confirmBtn.addEventListener('click', () => {
        saveCharacter();
    });

    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', randomizeCharacter);
    }

    document.querySelectorAll('.attr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const attr = e.target.dataset.attr;
            const action = e.target.dataset.action;
            modifyAttribute(attr, action);
        });
    });

    const returnBtn = document.getElementById('return-btn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = "../../home.html";
        });
    } else {
        addMessage("Erro: Não foi possível encontrar o botão de voltar.", "error");
    }
}

function modifyAttribute(attr, action) {
    if (action === 'increase' && pointsRemaining > 0) {
        if (attributes[attr] < 10) {
            attributes[attr]++;
            pointsRemaining--;
            addMessage(`+1 em ${attr}`);
        } else {
            addMessage("Atributo já está no máximo!", "warning");
        }
    } else if (action === 'decrease' && attributes[attr] > races[selectedRace].stats[attr]) {
        attributes[attr]--;
        pointsRemaining++;
        addMessage(`-1 em ${attr}`);
    } else if (action === 'increase' && pointsRemaining === 0) {
        addMessage("Sem pontos restantes!", "warning");
    }

    updateAttributeDisplay();
    updatePreview();
    validateForm();
}

function resetAttributes() {
    attributes = {
        strength: races[selectedRace].stats.strength,
        agility: races[selectedRace].stats.agility,
        vitality: races[selectedRace].stats.vitality
    };
    pointsRemaining = 10;
    updateAttributeDisplay();
}

function updateAttributeDisplay() {
    const strengthValue = document.getElementById('strength-value');
    const agilityValue = document.getElementById('agility-value');
    const vitalityValue = document.getElementById('vitality-value');
    const pointsRemainingDisplay = document.getElementById('points-remaining');

    if (strengthValue) strengthValue.textContent = attributes.strength;
    if (agilityValue) agilityValue.textContent = attributes.agility;
    if (vitalityValue) vitalityValue.textContent = attributes.vitality;
    if (pointsRemainingDisplay) pointsRemainingDisplay.textContent = pointsRemaining;
}

function updatePreview() {
    const characterArt = document.getElementById('character-art');
    const characterStats = document.getElementById('character-stats');
    
    if (characterArt && characterStats) {
        const raceData = races[selectedRace];
        characterArt.textContent = raceData.art.join('\n');
        characterStats.innerHTML = `
            Raça: ${selectedRace}<br>
            HP: ${raceData.stats.health + (attributes.vitality * 2)}<br>
            ATK: ${raceData.stats.attack + attributes.strength}<br>
            SPD: ${raceData.stats.speed + attributes.agility}<br>
            STM: ${raceData.stats.stamina}<br>
            Descrição: ${raceData.description}
        `;
    }
}

function validateForm() {
    const isValidName = /^[A-Za-zÀ-ÿ0-9]{3,15}$/.test(characterName);
    if (confirmBtn) {
        confirmBtn.disabled = !isValidName;
    }
    if (!isValidName && characterName.length > 0) {
        addMessage("O nome deve ter 3-15 caracteres, apenas letras (com ou sem acentos) e números.", "warning");
    }
}

function randomizeCharacter() {
    const raceKeys = Object.keys(races);
    selectedRace = raceKeys[Math.floor(Math.random() * raceKeys.length)];
    charRaceSelect.value = selectedRace;

    characterName = `Heroi${Math.floor(Math.random() * 1000)}`;
    charNameInput.value = characterName;

    resetAttributes();
    let pointsToDistribute = 10;
    const attrs = ['strength', 'agility', 'vitality'];

    while (pointsToDistribute > 0) {
        const attr = attrs[Math.floor(Math.random() * 3)];
        if (attributes[attr] < 10) {
            attributes[attr]++;
            pointsRemaining--;
            pointsToDistribute--;
        }
    }

    updateAttributeDisplay();
    updatePreview();
    updateSubclassInfo();
    validateForm();
    addMessage("Personagem randomizado!", "info");
}

function saveCharacter() {
    const selectedRaceData = races[selectedRace];
    const selectedSubclass = Object.keys(selectedRaceData.subclasses)[0];
    const character = {
        name: characterName,
        race: selectedRace,
        subclass: selectedSubclass,
        art: selectedRaceData.art,
        stats: {
            health: selectedRaceData.stats.health + (attributes.vitality * 2), // 2 HP por ponto de vitalidade
            maxHealth: selectedRaceData.stats.health + (attributes.vitality * 2), // 2 HP por ponto de vitalidade
            attack: selectedRaceData.stats.attack + attributes.strength, // Soma direta
            speed: selectedRaceData.stats.speed + attributes.agility, // Soma direta
            stamina: selectedRaceData.stats.stamina,
            maxStamina: selectedRaceData.stats.stamina,
            strength: attributes.strength,
            agility: attributes.agility,
            vitality: attributes.vitality,
            moveCooldown: 250,
            attackCooldown: 1000,
            attackStaminaCost: 5,
            staminaRegen: 0.5,
            dashStaminaCost: 20,
            dashMultiplier: 3
        },
        skill: selectedRaceData.subclasses[selectedSubclass].skill,
        inventory: [],
        level: 1,
        xp: 0
    };

    localStorage.setItem("currentCharacter", JSON.stringify(character));
    addMessage(`Personagem ${characterName} criado com sucesso!`, "victory");
    
    setTimeout(() => {
        window.location.href = "../Mapas/tutorial/tutorial.html";
    }, 1500);
}

function addMessage(text, type = "info") {
    if (!messageLog) return;
    if (text === lastMessage) return;
    lastMessage = text;

    const message = document.createElement("div");
    message.textContent = "> " + text;
    switch(type) {
        case "error": message.style.color = "#ff5555"; break;
        case "warning": message.style.color = "#ffaa00"; break;
        case "victory": message.style.color = "#55ff55"; break;
        default: message.style.color = "#e0e0e0";
    }
    messageLog.appendChild(message);
    messageLog.scrollTop = messageLog.scrollHeight;
}

function updateSubclassInfo() {
    const raceData = races[selectedRace];
    const subclassInfoContent = document.getElementById('subclass-info-content');
    
    if (subclassInfoContent) {
        subclassInfoContent.innerHTML = "";
        
        for (const [key, subclass] of Object.entries(raceData.subclasses)) {
            subclassInfoContent.innerHTML += `
                <div class="subclass-option">
                    <strong>${subclass.name.toUpperCase()}</strong><br>
                    ${subclass.skill.name}: ${subclass.skill.effect}<br>
                    Bônus: ${JSON.stringify(subclass.stats).replace(/[{}"]/g, '').replace(/:/g, ': ')}<br>
                </div>
            `;
        }
    }
}

window.onload = function() {
    try {
        initCreation();
    } catch (e) {
        console.error("Erro na inicialização:", e);
        addMessage("Erro ao carregar a tela de criação. Tente novamente.", "error");
    }
};