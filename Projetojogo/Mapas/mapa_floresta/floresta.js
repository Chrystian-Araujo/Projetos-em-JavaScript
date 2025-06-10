// Definição de Classes e Variáveis Globais
const races = {
  human: {
    art: [" O ", "/|\\", "/ \\"],
    stats: {
      health: 100,
      speed: 10,
      attack: 5,
      stamina: 100,
      moveCooldown: 300,
      maxHealth: 100,
      maxStamina: 100,
      dashStaminaCost: 10,
      attackStaminaCost: 5,
      staminaRegen: 0.2,
      dashMultiplier: 2,
      strength: 5,
      agility: 5,
      vitality: 5,
    },
    description: "Equilibrado em todos os aspectos. Bom para iniciantes.",
    subclasses: {
      monge: {
        name: "Monge",
        stats: { speed: 5, staminaRegen: 0.3, dashStaminaCost: -5 },
        skill: {
          name: "Meditação",
          effect: "Restaura 20 de Stamina",
          cooldown: 10000,
        },
      },
      lutador: {
        name: "Lutador",
        stats: { attack: 3, health: 20, attackStaminaCost: -2 },
        skill: {
          name: "Soco Poderoso",
          effect: "Causa 150% de dano",
          cooldown: 8000,
        },
      },
    },
  },
  elf: {
    art: [" O ", "/|\\", "/ \\"],
    stats: {
      health: 80,
      speed: 12,
      attack: 4,
      stamina: 90,
      moveCooldown: 250,
      maxHealth: 80,
      maxStamina: 90,
      dashStaminaCost: 8,
      attackStaminaCost: 4,
      staminaRegen: 0.25,
      dashMultiplier: 2.2,
      strength: 3,
      agility: 7,
      vitality: 4,
    },
    description: "Rápido e ágil, ideal para estratégias evasivas.",
    subclasses: {
      arqueiro: {
        name: "Arqueiro",
        stats: { speed: 3, attack: 2 },
        skill: {
          name: "Tiro Preciso",
          effect: "Causa 200% de dano à distância",
          cooldown: 12000,
        },
      },
      druida: {
        name: "Druida",
        stats: { staminaRegen: 0.4, health: 10 },
        skill: {
          name: "Cura Natural",
          effect: "Recupera 10 HP por 5s",
          cooldown: 15000,
        },
      },
    },
  },
  dwarf: {
    art: [" O ", "/|\\", "/ \\"],
    stats: {
      health: 120,
      speed: 8,
      attack: 6,
      stamina: 110,
      moveCooldown: 350,
      maxHealth: 120,
      maxStamina: 110,
      dashStaminaCost: 12,
      attackStaminaCost: 6,
      staminaRegen: 0.15,
      dashMultiplier: 1.8,
      strength: 7,
      agility: 3,
      vitality: 6,
    },
    description: "Forte e resistente, perfeito para combates diretos.",
    subclasses: {
      ferreiro: {
        name: "Ferreiro",
        stats: { defense: 3, attack: 1 },
        skill: {
          name: "Forja Rápida",
          effect: "Aumenta ATK em 5 por 10s",
          cooldown: 20000,
        },
      },
      berserker: {
        name: "Berserker",
        stats: { attack: 4, defense: -2 },
        skill: {
          name: "Fúria",
          effect: "Aumenta dano em 20% por 8s",
          cooldown: 18000,
        },
      },
    },
  },
  ogre: {
    art: [" █ ", "█▒█", "║ ║"],
    stats: {
      health: 150,
      speed: 6,
      attack: 8,
      stamina: 120,
      moveCooldown: 400,
      maxHealth: 150,
      maxStamina: 120,
      dashStaminaCost: 15,
      attackStaminaCost: 8,
      staminaRegen: 0.1,
      dashMultiplier: 1.5,
      strength: 8,
      agility: 2,
      vitality: 7,
    },
    description:
      "Extremamente forte, mas lento. Ideal para causar dano massivo.",
    subclasses: {
      brutamontes: {
        name: "Brutamontes",
        stats: { strength: 3, attack: 3 },
        skill: {
          name: "Esmagar",
          effect: "Causa dano em área (10 de dano)",
          cooldown: 15000,
        },
      },
      xama: {
        name: "Xamã",
        stats: { vitality: 2, health: 20 },
        skill: {
          name: "Totem de Força",
          effect: "Aumenta atributos em 2 por 10s",
          cooldown: 20000,
        },
      },
    },
  },
};

// Configurações do Tileset e Mapa
const TILE_SIZE = 32;
const MAP_WIDTH = 30; // 30 tiles de largura (960px / 32)
const MAP_HEIGHT = 20; // 20 tiles de altura (640px / 32)
const TILES_PER_ROW = 7; // Tiles por linha no tileset (ajustado para 7)

const forestMap = [
  [
    0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3,
    4, 5, 6, 0, 1,
  ],
  [
    7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13,
    7, 8, 9, 10, 11, 12, 13, 7, 8,
  ],
  [
    14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18,
    19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15,
  ],
  [
    21, 22, 23, 24, 25, 26, 27, 21, 22, 23, 24, 25, 26, 27, 21, 22, 23, 24, 25,
    26, 27, 21, 22, 23, 24, 25, 26, 27, 21, 22,
  ],
  [
    28, 29, 30, 31, 32, 33, 34, 28, 29, 30, 31, 32, 33, 34, 28, 29, 30, 31, 32,
    33, 34, 28, 29, 30, 31, 32, 33, 34, 28, 29,
  ],
  [
    35, 36, 37, 38, 39, 40, 41, 35, 36, 37, 38, 39, 40, 41, 35, 36, 37, 38, 39,
    40, 41, 35, 36, 37, 38, 39, 40, 41, 35, 36,
  ],
  [
    42, 43, 44, 45, 46, 47, 48, 42, 43, 44, 45, 46, 47, 48, 42, 43, 44, 45, 46,
    47, 48, 42, 43, 44, 45, 46, 47, 48, 42, 43,
  ],
  [
    14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18,
    19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15,
  ],
  [
    0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3,
    4, 5, 6, 0, 1,
  ],
  [
    7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13,
    7, 8, 9, 10, 11, 12, 13, 7, 8,
  ],
  [
    14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18,
    19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15,
  ],
  [
    21, 22, 23, 24, 25, 26, 27, 21, 22, 23, 24, 25, 26, 27, 21, 22, 23, 24, 25,
    26, 27, 21, 22, 23, 24, 25, 26, 27, 21, 22,
  ],
  [
    28, 29, 30, 31, 32, 33, 34, 28, 29, 30, 31, 32, 33, 34, 28, 29, 30, 31, 32,
    33, 34, 28, 29, 30, 31, 32, 33, 34, 28, 29,
  ],
  [
    35, 36, 37, 38, 39, 40, 41, 35, 36, 37, 38, 39, 40, 41, 35, 36, 37, 38, 39,
    40, 41, 35, 36, 37, 38, 39, 40, 41, 35, 36,
  ],
  [
    42, 43, 44, 45, 46, 47, 48, 42, 43, 44, 45, 46, 47, 48, 42, 43, 44, 45, 46,
    47, 48, 42, 43, 44, 45, 46, 47, 48, 42, 43,
  ],
  [
    14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18,
    19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15,
  ],
  [
    0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3,
    4, 5, 6, 0, 1,
  ],
  [
    7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13,
    7, 8, 9, 10, 11, 12, 13, 7, 8,
  ],
  [
    14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15, 16, 17, 18,
    19, 20, 14, 15, 16, 17, 18, 19, 20, 14, 15,
  ],
  [
    21, 22, 23, 24, 25, 26, 27, 21, 22, 23, 24, 25, 26, 27, 21, 22, 23, 24, 25,
    26, 27, 21, 22, 23, 24, 25, 26, 27, 21, 22,
  ],
];

// Variáveis globais
let savedCharacter = JSON.parse(localStorage.getItem("currentCharacter"));
let inventory = JSON.parse(localStorage.getItem("inventory")) || { items: [] };
let selectedCharacterElement = null;
let keysPressed = {};
let isMoving = false;
let lastMoveTime = 0;
let enemies = [];
let enemiesDefeated = 0;
let forestObjectives = {
  explore: false,
  defeatEnemy: false,
  findExit: false,
};
let stamina = 100;
let isNight = false;
let xp = 0;
let level = 1;
let points = 0;
let isDashing = false;
let lastDashTime = 0;
let lastAttackTime = 0;
let cooldowns = {
  healthPotion: 0,
  staminaPotion: 0,
  skill: 0,
};
let selectedSubclass = null;
let gameTime = 0;
let isGamePaused = false;
const MAX_ENEMIES = 5;

const messageLog = document.getElementById("message-log");
const forestMapDiv = document.getElementById("forest-map");
const canvas = document.getElementById("map-canvas");
const ctx = canvas.getContext("2d");

// Carregar o tileset
const tilesetImage = new Image();
tilesetImage.src = "./chao.png";

// Função para renderizar o mapa
function renderMap() {
  if (!ctx || !tilesetImage.complete) return;

  ctx.imageSmoothingEnabled = false; // Desativa suavização para manter o estilo pixelado
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas antes de redesenhar
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tileIndex = forestMap[y][x];
      const tileX = (tileIndex % TILES_PER_ROW) * TILE_SIZE; // Calcula a posição X no tileset
      const tileY = Math.floor(tileIndex / TILES_PER_ROW) * TILE_SIZE; // Calcula a posição Y no tileset

      // Desenha o tile sem gaps, ajustando para o tamanho exato
      ctx.drawImage(
        tilesetImage,
        tileX,
        tileY,
        TILE_SIZE,
        TILE_SIZE, // Fonte: região do tileset
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE // Destino: posição no canvas
      );
    }
  }
}

// Função para salvar o progresso do jogo
function saveGame() {
  if (!savedCharacter) return;

  const gameState = {
    character: savedCharacter,
    inventory: inventory,
    enemiesDefeated: enemiesDefeated,
    forestObjectives: forestObjectives,
    position: {
      x: selectedCharacterElement
        ? parseInt(selectedCharacterElement.style.left)
        : 480,
      y: selectedCharacterElement
        ? parseInt(selectedCharacterElement.style.top)
        : 320,
    },
    stamina: stamina,
    xp: xp,
    level: level,
    points: points,
    selectedSubclass: selectedSubclass,
    timestamp: Date.now(),
  };

  let savedGames = JSON.parse(localStorage.getItem("savedGames")) || {};
  savedGames[savedCharacter.name || "default"] = gameState;
  localStorage.setItem("savedGames", JSON.stringify(savedGames));
  addMessage("Jogo salvo automaticamente!", "victory");
}

function toggleDayNight() {
  isNight = !isNight;
  const canvas = document.getElementById("map-canvas");
  const overlay = document.querySelector(".map-overlay") || createNightOverlay();

  if (isNight) {
    canvas.style.filter = "brightness(0.6) hue-rotate(200deg)"; // Escurece e adiciona tom azulado
    overlay.style.display = "block"; // Mostra a sobreposição de noite
    addMessage("A noite caiu na floresta!", "info");
  } else {
    canvas.style.filter = "brightness(1)"; // Restaura o brilho padrão
    overlay.style.display = "none"; // Esconde a sobreposição
    addMessage("O dia amanheceu na floresta!", "info");
  }
}

function createNightOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "map-overlay";
  document.getElementById("forest-map").appendChild(overlay);
  return overlay;
}

// Iniciar o ciclo dia/noite
function startDayNightCycle() {
  setInterval(toggleDayNight, 300000); // Alterna a cada 5 minutos
}

// Funções Auxiliares
function addMessage(text, type = "info") {
  const message = document.createElement("div");
  message.textContent = "> " + text;
  switch (type) {
    case "error":
      message.style.color = "#ff5555";
      break;
    case "warning":
      message.style.color = "#ffaa00";
      break;
    case "victory":
      message.style.color = "#55ff55";
      break;
    default:
      message.style.color = "#e0e0e0";
  }
  messageLog.appendChild(message);
  messageLog.scrollTop = messageLog.scrollHeight;
}

function displayCharacter() {
  if (!savedCharacter || !savedCharacter.art) {
    addMessage("Nenhum personagem selecionado! Retornando ao menu.", "error");
    setTimeout(() => (window.location.href = "../../home.html"), 2000);
    return;
  }

  const characterArt = document.getElementById("character-art");
  const characterStats = document.getElementById("character-stats");

  characterArt.textContent = savedCharacter.art.join("\n");
  updateCharacterStats();
  addMessage(`Bem-vindo à Floresta, ${savedCharacter.name}! Explore o mapa.`);
}

function addCharacterToMap() {
  selectedCharacterElement = document.createElement("div");
  selectedCharacterElement.className = "character";
  selectedCharacterElement.textContent = savedCharacter.art.join("\n");
  selectedCharacterElement.style.color = "#000000"; // Personagem preto
  selectedCharacterElement.setAttribute("data-width", 3);
  selectedCharacterElement.setAttribute("data-height", 3);

  let startX = 480;
  let startY = 320;
  const savedGames = JSON.parse(localStorage.getItem("savedGames")) || {};
  if (savedGames[savedCharacter.name || "default"]) {
    startX = savedGames[savedCharacter.name || "default"].position.x;
    startY = savedGames[savedCharacter.name || "default"].position.y;
    enemiesDefeated =
      savedGames[savedCharacter.name || "default"].enemiesDefeated;
    forestObjectives =
      savedGames[savedCharacter.name || "default"].forestObjectives;
    inventory = savedGames[savedCharacter.name || "default"].inventory;
    stamina = savedGames[savedCharacter.name || "default"].stamina;
    xp = savedGames[savedCharacter.name || "default"].xp;
    level = savedGames[savedCharacter.name || "default"].level;
    points = savedGames[savedCharacter.name || "default"].points || 0;
    selectedSubclass =
      savedGames[savedCharacter.name || "default"].selectedSubclass;
  }

  selectedCharacterElement.style.top = startY + "px";
  selectedCharacterElement.style.left = startX + "px";
  forestMapDiv.appendChild(selectedCharacterElement);

  // Adicionar poção
  const potion = document.createElement("div");
  potion.className = "character potion";
  potion.textContent = "[+]";
  potion.style.top = "300px";
  potion.style.left = "500px";
  forestMapDiv.appendChild(potion);

  // Iniciar spawn de inimigos e boss
  spawnEnemy();
  startBossSpawn();
  startEnemyMovement();
}

function moveCharacter(dx, dy) {
  if (!selectedCharacterElement || isMoving || isGamePaused) return;
  const now = Date.now();
  const moveCooldown = savedCharacter.stats.moveCooldown || 300;
  if (now - lastMoveTime < moveCooldown) return;

  let moveDistance = 32; // Movimentar exatamente 1 tile por vez
  if (isDashing) {
    moveDistance *= savedCharacter.stats.dashMultiplier || 2;
  }

  const currentTop = parseInt(selectedCharacterElement.style.top) || 0;
  const currentLeft = parseInt(selectedCharacterElement.style.left) || 0;
  const newTop = currentTop + dy * moveDistance;
  const newLeft = currentLeft + dx * moveDistance;

  const collision = checkCollision(selectedCharacterElement, newLeft, newTop);
  if (!collision) {
    isMoving = true;
    lastMoveTime = now;
    selectedCharacterElement.style.top = newTop + "px";
    selectedCharacterElement.style.left = newLeft + "px";
    updateCharacterStats();
    checkObjectives();
    checkMapBoundaries(newLeft, newTop);

    setTimeout(() => {
      isMoving = false;
    }, 300);
  } else {
    handleCollision(collision);
  }
}

function checkCollision(character, newX, newY) {
  const charWidth = parseInt(character.getAttribute("data-width")) || 3;
  const charHeight = parseInt(character.getAttribute("data-height")) || 3;
  const charRight = newX + charWidth * 10;
  const charBottom = newY + charHeight * 10;

  if (
    newX < 0 ||
    newY < 0 ||
    charRight > forestMapDiv.clientWidth ||
    charBottom > forestMapDiv.clientHeight
  ) {
    return "border";
  }

  const enemies = document.querySelectorAll(".enemy");
  for (const enemy of enemies) {
    const enemyX = parseInt(enemy.style.left);
    const enemyY = parseInt(enemy.style.top);
    const enemyWidth = parseInt(enemy.getAttribute("data-width")) || 3;
    const enemyHeight = parseInt(enemy.getAttribute("data-height")) || 3;
    const enemyRight = enemyX + enemyWidth * 10;
    const enemyBottom = enemyY + enemyHeight * 10;

    if (
      newX < enemyRight &&
      charRight > enemyX &&
      newY < enemyBottom &&
      charBottom > enemyY
    ) {
      return "enemy";
    }
  }

  const potion = document.querySelector(".potion");
  if (potion) {
    const potionX = parseInt(potion.style.left);
    const potionY = parseInt(potion.style.top);
    const potionWidth = 30;
    const potionHeight = 30;
    const potionRight = potionX + potionWidth;
    const potionBottom = potionY + potionHeight;

    if (
      newX < potionRight &&
      charRight > potionX &&
      newY < potionBottom &&
      charBottom > potionY
    ) {
      return "potion";
    }
  }

  return false;
}

function handleCollision(type) {
  switch (type) {
    case "border":
      addMessage("Você atingiu o limite da floresta!", "warning");
      break;
    case "enemy":
      addMessage("Você colidiu com um inimigo!", "warning");
      fightEnemy();
      break;
    case "potion":
      collectPotion();
      break;
  }
}

function spawnEnemy() {
  const currentEnemies = document.querySelectorAll(".enemy").length;
  if (currentEnemies >= MAX_ENEMIES) return;

  const enemiesList = [
    { name: "Slime", art: [" ~~ ", "(  )", "~~~~"], width: 4, height: 3, hp: 10, points: 1 },
    { name: "Goblin", art: [" O ", "/|\\", "/ \\"], width: 3, height: 3, hp: 15, points: 2 },
    { name: "Esqueleto", art: [" O ", "-|-", "/ \\"], width: 3, height: 3, hp: 20, points: 3 },
    { name: "Lobo", art: [" W ", "/ \\", "~~"], width: 3, height: 3, hp: 25, points: 4 },
  ];

  const enemy = enemiesList[Math.floor(Math.random() * enemiesList.length)];
  const enemyDiv = document.createElement("div");
  enemyDiv.className = "character enemy";
  enemyDiv.textContent = enemy.art.join("\n");
  enemyDiv.setAttribute("data-name", enemy.name);
  enemyDiv.setAttribute("data-width", enemy.width);
  enemyDiv.setAttribute("data-height", enemy.height);
  enemyDiv.setAttribute("data-hp", enemy.hp);
  enemyDiv.setAttribute("data-points", enemy.points);

  enemyDiv.addEventListener("click", () => {
    fightEnemy(enemy.name, enemyDiv);
  });

  let x, y;
  do {
    x = Math.floor(Math.random() * (forestMapDiv.clientWidth - 50));
    y = Math.floor(Math.random() * (forestMapDiv.clientHeight - 50));
  } while (isInSafeZone(x, y));

  enemyDiv.style.top = y + "px";
  enemyDiv.style.left = x + "px";
  forestMapDiv.appendChild(enemyDiv);
  enemies.push(enemyDiv);
  addMessage(`Um ${enemy.name} apareceu!`);
}

function spawnBoss() {
  const bossDiv = document.createElement("div");
  bossDiv.className = "character enemy boss";
  bossDiv.textContent = " M \n/|\\\n/ \\";
  bossDiv.setAttribute("data-name", "Mago Negro");
  bossDiv.setAttribute("data-width", 3);
  bossDiv.setAttribute("data-height", 3);
  bossDiv.setAttribute("data-hp", 50);
  bossDiv.setAttribute("data-points", 10);

  bossDiv.addEventListener("click", () => {
    fightEnemy("Mago Negro", bossDiv);
  });

  let x, y;
  do {
    x = Math.floor(Math.random() * (forestMapDiv.clientWidth - 30));
    y = Math.floor(Math.random() * (forestMapDiv.clientHeight - 30));
  } while (isInSafeZone(x, y));

  bossDiv.style.top = y + "px";
  bossDiv.style.left = x + "px";
  forestMapDiv.appendChild(bossDiv);
  enemies.push(bossDiv);

  // Spawn de lacaios
  for (let i = 0; i < 2; i++) {
    const goblin = { name: "Goblin", art: [" O ", "/|\\", "/ \\"], width: 3, height: 3, hp: 15, points: 2 };
    const goblinDiv = document.createElement("div");
    goblinDiv.className = "character enemy";
    goblinDiv.textContent = goblin.art.join("\n");
    goblinDiv.style.top = (parseInt(bossDiv.style.top) + (i * 20 - 10)) + "px";
    goblinDiv.style.left = (parseInt(bossDiv.style.left) + 30) + "px";
    goblinDiv.setAttribute("data-name", goblin.name);
    goblinDiv.setAttribute("data-width", goblin.width);
    goblinDiv.setAttribute("data-height", goblin.height);
    goblinDiv.setAttribute("data-hp", goblin.hp);
    goblinDiv.setAttribute("data-points", goblin.points);

    goblinDiv.addEventListener("click", () => {
      fightEnemy(goblin.name, goblinDiv);
    });

    enemies.push(goblinDiv);
    forestMapDiv.appendChild(goblinDiv);
  }

  addMessage("O Mago Negro apareceu com seus lacaios!", "warning");
}

function startBossSpawn() {
  setInterval(() => {
    if (!isGamePaused) {
      spawnBoss();
    }
  }, 300000); // 5 minutos
}

function startEnemyMovement() {
  setInterval(() => {
    if (!selectedCharacterElement || isGamePaused) return;

    const playerX = parseInt(selectedCharacterElement.style.left) || 0;
    const playerY = parseInt(selectedCharacterElement.style.top) || 0;

    enemies.forEach((enemy) => {
      const enemyX = parseInt(enemy.style.left) || 0;
      const enemyY = parseInt(enemy.style.top) || 0;
      const dx = playerX - enemyX;
      const dy = playerY - enemyY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isBoss = enemy.className.includes("boss");

      // Ajuste da distância de perseguição (50 para inimigos comuns, 150 para boss)
      if (distance > (isBoss ? 150 : 50)) {
        const step = isBoss ? 8 : 12; // Velocidade de movimento
        const moveX = dx > 0 ? step : -step;
        const moveY = dy > 0 ? step : -step;
        let newX = enemyX + (Math.abs(dx) > step ? moveX : 0);
        let newY = enemyY + (Math.abs(dy) > step ? moveY : 0);

        if (!checkCollision(enemy, newX, newY)) {
          enemy.style.left = newX + "px";
          enemy.style.top = newY + "px";
        }
      }

      // Ataque quando estiver dentro da distância de ataque
      if (distance <= (isBoss ? 150 : 50) && Math.random() < 0.7) { // Aumentei a chance de ataque para 70%
        const enemyDamage = isBoss ? Math.floor(Math.random() * 8) + 6 : Math.floor(Math.random() * 5) + 4;
        savedCharacter.stats.health -= enemyDamage;
        enemy.classList.add("enemy-attacking");
        addMessage(`${enemy.getAttribute("data-name")} atacou você causando ${enemyDamage} de dano!`, "warning");
        updateCharacterStats();

        // Remove a classe de ataque após a animação
        setTimeout(() => {
          enemy.classList.remove("enemy-attacking");
        }, 300);
      }
    });
  }, 500); // Intervalo de 500ms para movimento
}

function fightEnemy(enemyName = null, enemyElement = null) {
  const enemy = enemyElement || document.querySelector(".enemy");
  if (!enemy) return;

  const now = Date.now();
  if (now - lastAttackTime < 1000) return;

  if (stamina < savedCharacter.stats.attackStaminaCost) {
    addMessage("Stamina insuficiente para atacar!", "warning");
    return;
  }

  lastAttackTime = now;
  stamina -= savedCharacter.stats.attackStaminaCost;

  selectedCharacterElement.classList.add("attacking");
  let damage = Math.floor(Math.random() * savedCharacter.stats.attack) + 1;

  if (selectedSubclass === "lutador" && keysPressed["q"]) {
    const skill = races[savedCharacter.race].subclasses.lutador.skill;
    if (now - skill.lastUsed >= skill.cooldown) {
      damage = Math.floor(damage * 1.5);
      skill.lastUsed = now;
      addMessage(`Soco Poderoso usado! Dano: ${damage}`, "victory");
    } else {
      addMessage(
        `Soco Poderoso em cooldown! Aguarde ${(
          (skill.cooldown - (now - skill.lastUsed)) /
          1000
        ).toFixed(1)}s`,
        "warning"
      );
      return;
    }
  }

  setTimeout(() => {
    enemy.classList.add("took-damage");
    let enemyHP = parseInt(enemy.getAttribute("data-hp")) - damage;
    enemy.setAttribute("data-hp", enemyHP);

    addMessage(`Você atacou ${enemy.getAttribute("data-name")} causando ${damage} de dano! (HP restante: ${enemyHP})`);

    if (enemyHP <= 0) {
      const enemyPoints = parseInt(enemy.getAttribute("data-points") || 0);
      enemy.remove();
      enemies = enemies.filter((e) => e !== enemy);
      enemiesDefeated++;
      forestObjectives.defeatEnemy = true;
      addMessage(`Você derrotou ${enemy.getAttribute("data-name")}! (+${enemyPoints} pontos)`, "victory");
      points += enemyPoints;
      xp += 50; // Ganha 50 XP por kill
      checkObjectives();
      if (enemy.getAttribute("data-name") === "Mago Negro") {
        addMessage("Você derrotou o Mago Negro! Parabéns, você venceu o jogo!", "victory");
        setTimeout(() => (window.location.href = "../../home.html"), 5000);
      }
      if (enemiesDefeated % 3 === 0) {
        setTimeout(spawnEnemy, 1000);
        addMessage("Um novo inimigo surgiu!", "warning");
      }
    }

    setTimeout(() => {
      enemy.classList.remove("took-damage");
    }, 500);

    updateCharacterStats();
  }, 200);

  setTimeout(() => {
    selectedCharacterElement.classList.remove("attacking");
  }, 300);
}

function collectPotion() {
  const potion = document.querySelector(".pion");
  if (!potion) return;

  potion.remove();
  addMessage("Você coletou uma Poção de Vida!", "victory");
  addItemToInventory("healthPotion", 1);
}

function handleDash() {
  if (isGamePaused) return;
  const now = Date.now();
  if (
    keysPressed["shift"] &&
    !isDashing &&
    stamina >= savedCharacter.stats.dashStaminaCost &&
    now - lastDashTime >= 5000
  ) {
    isDashing = true;
    lastDashTime = now;
    stamina -= savedCharacter.stats.dashStaminaCost;
    addMessage("Dash executado!", "info");

    setTimeout(() => {
      isDashing = false;
    }, 300);
  }
}

function checkObjectives() {
  const charTop = parseInt(selectedCharacterElement.style.top);
  const charLeft = parseInt(selectedCharacterElement.style.left);

  if (!forestObjectives.explore && charLeft > 700) {
    forestObjectives.explore = true;
    addMessage(
      "Objetivo: Explorar a floresta - Concluído! +10 pontos",
      "victory"
    );
    points += 10;
  }

  if (!forestObjectives.defeatEnemy && enemiesDefeated > 0) {
    forestObjectives.defeatEnemy = true;
    addMessage(
      "Objetivo: Derrotar um inimigo - Concluído! +15 pontos",
      "victory"
    );
    points += 15;
  }

  if (!forestObjectives.findExit && charLeft > 900 && charTop < 100) {
    forestObjectives.findExit = true;
    addMessage(
      "Objetivo: Encontrar a saída - Concluído! +20 pontos",
      "victory"
    );
    points += 20;
    setTimeout(() => (window.location.href = "caverna.html"), 2000);
  }
}

function checkMapBoundaries(x, y) {
  const charWidth = parseInt(selectedCharacterElement.getAttribute("data-width")) * 10;
  const charHeight = parseInt(selectedCharacterElement.getAttribute("data-height")) * 10;
  const threshold = 50;

  if (
    x < threshold ||
    y < threshold ||
    x + charWidth > forestMapDiv.clientWidth - threshold ||
    y + charHeight > forestMapDiv.clientHeight - threshold
  ) {
    refreshMap();
  }
}

function refreshMap() {
  forestMapDiv.style.opacity = "0.3";
  forestMapDiv.style.transition = "opacity 0.3s ease";

  setTimeout(() => {
    enemies.forEach((enemy) => enemy.remove());
    enemies = [];
    const centerX = (forestMapDiv.clientWidth / 2) - 15;
    const centerY = (forestMapDiv.clientHeight / 2) - 15;
    selectedCharacterElement.style.top = centerY + "px";
    selectedCharacterElement.style.left = centerX + "px";

    const enemyCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(spawnEnemy, i * 500);
    }
    addMessage("Você entrou em uma nova área da floresta!", "info");
    forestMapDiv.style.opacity = "1";
    setTimeout(() => {
      forestMapDiv.style.transition = "";
    }, 300);
  }, 300);
}

function isInSafeZone(x, y) {
  const safeZoneSize = 100;
  const centerX = forestMapDiv.clientWidth / 2;
  const centerY = forestMapDiv.clientHeight / 2;
  return (
    x >= centerX - safeZoneSize &&
    x <= centerX + safeZoneSize &&
    y >= centerY - safeZoneSize &&
    y <= centerY + safeZoneSize
  );
}

function updateCharacterStats() {
  const characterStats = document.getElementById("character-stats");
  if (characterStats) {
    characterStats.innerHTML = `
            Nome: ${savedCharacter.name}<br>
            Raça: ${savedCharacter.race}<br>
            HP: ${savedCharacter.stats.health}/${
      savedCharacter.stats.maxHealth
    }<br>
            ATK: ${savedCharacter.stats.attack}<br>
            SPD: ${savedCharacter.stats.speed}<br>
            STM: ${stamina.toFixed(1)}/${savedCharacter.stats.maxStamina}<br>
            XP: ${xp}/${level * 100}<br>
            Pontos: ${points}<br>
            ${
              selectedSubclass
                ? `Subclasse: ${
                    races[savedCharacter.race].subclasses[selectedSubclass].name
                  }`
                : ""
            }
        `;
  }

  const xpRequired = level * 100;
  while (xp >= xpRequired) {
    xp -= xpRequired;
    levelUp();
  }

  const hpBar = document.getElementById("hp-bar");
  const staminaBar = document.getElementById("stamina-bar");
  const xpBar = document.getElementById("xp-bar");

  if (hpBar) {
    hpBar.style.width = `${
      (savedCharacter.stats.health / savedCharacter.stats.maxHealth) * 100
    }%`;
  }
  if (staminaBar) {
    staminaBar.style.width = `${
      (stamina / savedCharacter.stats.maxStamina) * 100
    }%`;
  }
  if (xpBar) {
    xpBar.style.width = `${(xp / (level * 100)) * 100}%`;
  }

  if (savedCharacter.stats.health <= 0) {
    addMessage("Você foi derrotado! Game Over.", "error");
    setTimeout(() => (window.location.href = "../../home.html"), 5000);
  }
}

function levelUp() {
  level++;
  xp = 0;
  const vitalityIncrease = savedCharacter.stats.vitality * 2;
  savedCharacter.stats.health += vitalityIncrease;
  savedCharacter.stats.maxHealth += vitalityIncrease;
  savedCharacter.stats.attack += 1;
  savedCharacter.stats.stamina += 5;
  savedCharacter.stats.maxStamina += 5;
  addMessage(`Level Up! Agora você é nível ${level}.`, "victory");

  if (level === 2 && !selectedSubclass) {
    addMessage(
      "Você pode escolher uma subclasse! Abra o menu de Habilidades (M, depois H).",
      "victory"
    );
  }

  updateCharacterStats();
}

function updateCooldownsDisplay() {
  const now = Date.now();
  const cooldownDisplay = document.getElementById("cooldown-display");
  let cooldownText = "";

  for (const [item, endTime] of Object.entries(cooldowns)) {
    if (endTime > now) {
      const remaining = Math.ceil((endTime - now) / 1000);
      cooldownText += `${item}: ${remaining}s\n`;
    }
  }

  const dashCooldown = 5000;
  const dashEndTime = lastDashTime + dashCooldown;
  if (dashEndTime > now) {
    const remaining = Math.ceil((dashEndTime - now) / 1000);
    cooldownText += `Dash: ${remaining}s\n`;
  }

  if (selectedSubclass) {
    const skill = races[savedCharacter.race].subclasses[selectedSubclass].skill;
    const skillEndTime = skill.lastUsed + skill.cooldown;
    if (skillEndTime > now) {
      const remaining = Math.ceil((skillEndTime - now) / 1000);
      cooldownText += `${skill.name}: ${remaining}s\n`;
    }
  }

  cooldownDisplay.textContent = cooldownText || "Nenhum cooldown ativo";
}

function addItemToInventory(itemType, quantity = 1) {
  const item = items[itemType];
  if (!item) return false;

  const existingItem = inventory.items.find((i) => i.type === itemType);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    if (inventory.items.length >= 20) {
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
      equipable: item.equipable || false,
    });
  }

  addMessage(`Você adquiriu ${quantity}x ${item.name}`, "victory");
  localStorage.setItem("inventory", JSON.stringify(inventory));
  return true;
}

const items = {
  healthPotion: {
    name: "Poção de Vida",
    emoji: "❤️",
    effect: { health: 20 },
    description: "Restaura 20 HP",
  },
  staminaPotion: {
    name: "Poção de Energia",
    emoji: "⚡",
    effect: { stamina: 30 },
    description: "Restaura 30 de Stamina",
  },
};

function useItem(index) {
  if (index >= inventory.items.length) return;

  const now = Date.now();
  const item = inventory.items[index];
  const itemData = items[item.type];

  if (cooldowns[item.type] > now) {
    const remaining = Math.ceil((cooldowns[item.type] - now) / 1000);
    addMessage(`${item.name} em cooldown! Aguarde ${remaining}s`, "warning");
    return;
  }

  if (itemData.effect.health) {
    savedCharacter.stats.health = Math.min(
      savedCharacter.stats.health + itemData.effect.health,
      savedCharacter.stats.maxHealth
    );
    addMessage(`Usou ${item.name}: +${itemData.effect.health} HP`, "victory");
    cooldowns[item.type] = now + 10000;
  }

  if (itemData.effect.stamina) {
    stamina = Math.min(
      stamina + itemData.effect.stamina,
      savedCharacter.stats.maxStamina
    );
    addMessage(
      `Usou ${item.name}: +${itemData.effect.stamina} Stamina`,
      "victory"
    );
    cooldowns[item.type] = now + 8000;
  }

  item.quantity--;
  if (item.quantity <= 0) {
    inventory.items.splice(index, 1);
  }

  localStorage.setItem("inventory", JSON.stringify(inventory));
  updateCharacterStats();
  updateCooldownsDisplay();
}

function useSkill() {
  if (!selectedSubclass || isGamePaused) return;

  const now = Date.now();
  const subclass = races[savedCharacter.race].subclasses[selectedSubclass];
  const skill = subclass.skill;

  if (now - skill.lastUsed < skill.cooldown) {
    addMessage(
      `${skill.name} em cooldown! Aguarde ${(
        (skill.cooldown - (now - skill.lastUsed)) /
        1000
      ).toFixed(1)}s`,
      "warning"
    );
    return;
  }

  if (selectedSubclass === "monge") {
    stamina = Math.min(stamina + 20, savedCharacter.stats.maxStamina);
    addMessage(`${skill.name} usada! +20 Stamina`, "victory");
  } else if (selectedSubclass === "lutador") {
    addMessage(`${skill.name} pronta para uso! Use com [Q]`, "victory");
  } else if (selectedSubclass === "arqueiro") {
    const enemy = document.querySelector(".enemy");
    if (enemy) {
      const damage = Math.floor(savedCharacter.stats.attack * 2);
      let enemyHP = parseInt(enemy.getAttribute("data-hp")) - damage;
      enemy.setAttribute("data-hp", enemyHP);
      addMessage(
        `Tiro Preciso usado! Causou ${damage} de dano ao ${enemy.getAttribute("data-name")}`,
        "victory"
      );
      if (enemyHP <= 0) {
        const enemyPoints = parseInt(enemy.getAttribute("data-points") || 0);
        enemy.remove();
        enemies = enemies.filter((e) => e !== enemy);
        enemiesDefeated++;
        forestObjectives.defeatEnemy = true;
        addMessage(`Você derrotou ${enemy.getAttribute("data-name")}! (+${enemyPoints} pontos)`, "victory");
        points += enemyPoints;
        xp += 50;
        checkObjectives();
      }
    } else {
      addMessage("Nenhum inimigo ao alcance para Tiro Preciso!", "warning");
    }
  } else if (selectedSubclass === "druida") {
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
  } else if (selectedSubclass === "ferreiro") {
    savedCharacter.stats.attack += 5;
    addMessage("Forja Rápida usada! ATK +5 por 10s", "victory");
    updateCharacterStats();
    setTimeout(() => {
      savedCharacter.stats.attack -= 5;
      addMessage("Efeito de Forja Rápida acabou.", "info");
      updateCharacterStats();
    }, 10000);
  } else if (selectedSubclass === "berserker") {
    const originalAttack = savedCharacter.stats.attack;
    savedCharacter.stats.attack = Math.floor(savedCharacter.stats.attack * 1.2);
    addMessage("Fúria usada! Dano aumentado em 20% por 8s", "victory");
    updateCharacterStats();
    setTimeout(() => {
      savedCharacter.stats.attack = originalAttack;
      addMessage("Efeito de Fúria acabou.", "info");
      updateCharacterStats();
    }, 8000);
  } else if (selectedSubclass === "brutamontes") {
    const enemy = document.querySelector(".enemy");
    if (enemy) {
      const damage = 10;
      let enemyHP = parseInt(enemy.getAttribute("data-hp")) - damage;
      enemy.setAttribute("data-hp", enemyHP);
      addMessage(`Esmagar usado! Causou ${damage} de dano ao ${enemy.getAttribute("data-name")}`, "victory");
      if (enemyHP <= 0) {
        const enemyPoints = parseInt(enemy.getAttribute("data-points") || 0);
        enemy.remove();
        enemies = enemies.filter((e) => e !== enemy);
        enemiesDefeated++;
        forestObjectives.defeatEnemy = true;
        addMessage(`Você derrotou ${enemy.getAttribute("data-name")}! (+${enemyPoints} pontos)`, "victory");
        points += enemyPoints;
        xp += 50;
        checkObjectives();
      }
    } else {
      addMessage("Nenhum inimigo ao alcance para Esmagar!", "warning");
    }
  } else if (selectedSubclass === "xama") {
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

// Eventos
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keysPressed[key] = true;

  if (key === "i" && inventory.items.length > 0) {
    openInventory();
    return;
  }

  if (key === "h" && !isGamePaused) {
    openSkillsMenu();
    return;
  }

  if (key === "m" && !isGamePaused) {
    toggleMenu();
    return;
  }

  if (key === "q") {
    useSkill();
  }

  if (key === "enter") {
    e.preventDefault();
    fightEnemy();
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

function handleMovement() {
  if (isGamePaused) return;
  if (keysPressed["w"] || keysPressed["arrowup"]) moveCharacter(0, -1);
  if (keysPressed["s"] || keysPressed["arrowdown"]) moveCharacter(0, 1);
  if (keysPressed["a"] || keysPressed["arrowleft"]) moveCharacter(-1, 0);
  if (keysPressed["d"] || keysPressed["arrowright"]) moveCharacter(1, 0);

  if (keysPressed["shift"]) {
    handleDash();
  }
}

// Menu Functions
function toggleMenu() {
  isGamePaused = !isGamePaused;
  const menu = document.getElementById("game-menu");
  if (menu) {
    menu.style.display = isGamePaused ? "block" : "none";
  }
}

function openInventory() {
  isGamePaused = true;
  document.getElementById("inventory-menu").style.display = "block";
  renderInventory();
}

function closeInventory() {
  isGamePaused = false;
  document.getElementById("inventory-menu").style.display = "none";
}

function renderInventory() {
  const slots = document.getElementById("inventory-slots");
  slots.innerHTML = "";

  inventory.items.forEach((item, index) => {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";
    slot.innerHTML = `
            ${item.emoji}
            ${
              item.quantity > 1
                ? `<span class="item-count">${item.quantity}</span>`
                : ""
            }
        `;
    slot.title = `${item.name}\n${item.description}`;
    slot.onclick = () => useItem(index);
    slots.appendChild(slot);
  });

  for (let i = inventory.items.length; i < 20; i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";
    slot.textContent = "+";
    slot.title = "Slot vazio";
    slots.appendChild(slot);
  }
}

function openSkillsMenu() {
  isGamePaused = true;
  document.getElementById("skills-menu").style.display = "block";
  renderSkills();
}

function closeSkillsMenu() {
  isGamePaused = false;
  document.getElementById("skills-menu").style.display = "none";
}

function renderSkills() {
  const skillsList = document.getElementById("skills-list");
  skillsList.innerHTML = "";

  if (level < 2) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = "Alcance o nível 2 para escolher uma subclasse!";
    skillsList.appendChild(messageDiv);
  } else if (!selectedSubclass) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent =
      "Escolha uma subclasse para desbloquear sua habilidade!";
    skillsList.appendChild(messageDiv);

    const subclassOptions = document.createElement("div");
    subclassOptions.className = "subclass-options";
    const raceSubclasses = races[savedCharacter.race].subclasses;

    Object.keys(raceSubclasses).forEach((subclassKey) => {
      const button = document.createElement("button");
      button.textContent = raceSubclasses[subclassKey].name;
      button.onclick = () => selectSubclass(subclassKey);
      subclassOptions.appendChild(button);
    });

    skillsList.appendChild(subclassOptions);
  } else {
    const subclassSkill =
      races[savedCharacter.race].subclasses[selectedSubclass].skill;
    const subclassSkillDiv = document.createElement("div");
    subclassSkillDiv.textContent = `${subclassSkill.name}: ${
      subclassSkill.effect
    } (Cooldown: ${subclassSkill.cooldown / 1000}s)`;
    skillsList.appendChild(subclassSkillDiv);
  }
}

function selectSubclass(subclass) {
  if (selectedSubclass) return;
  selectedSubclass = subclass;
  const subclassData = races[savedCharacter.race].subclasses[subclass];

  for (let stat in subclassData.stats) {
    if (stat === "health") {
      savedCharacter.stats.health += subclassData.stats.health;
      savedCharacter.stats.maxHealth += subclassData.stats.health;
    } else if (stat === "dashStaminaCost" || stat === "attackStaminaCost") {
      savedCharacter.stats[stat] = Math.max(
        1,
        savedCharacter.stats[stat] + subclassData.stats[stat]
      );
    } else if (stat === "staminaRegen") {
      savedCharacter.stats[stat] =
        (savedCharacter.stats[stat] || 0) + subclassData.stats[stat];
    } else {
      savedCharacter.stats[stat] =
        (savedCharacter.stats[stat] || 0) + subclassData.stats[stat];
    }
  }

  addMessage(`Subclasse ${subclassData.name} selecionada!`, "victory");
  updateCharacterStats();
  renderSkills();
}

// Inicialização
function initGame() {
  if (!forestMapDiv) {
    addMessage("Erro: Elemento do mapa da floresta não encontrado.", "error");
    return;
  }

  displayCharacter();
  addCharacterToMap();
  tilesetImage.onload = renderMap;

  setInterval(() => {
    if (!isGamePaused) {
      stamina = Math.min(
        stamina + (savedCharacter.stats.staminaRegen || 0.2),
        savedCharacter.stats.maxStamina
      );
      updateCharacterStats();
    }
  }, 1000);

  setInterval(saveGame, 30000);
startGameTimer();
  startDayNightCycle(); // Adiciona o ciclo dia/noite
}

function startGameTimer() {
  setInterval(() => {
    if (!isGamePaused) {
      gameTime++;
      const minutes = Math.floor(gameTime / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (gameTime % 60).toString().padStart(2, "0");
      const timeDisplay =
        document.getElementById("time-display") || createTimeDisplay();
      timeDisplay.textContent = `Tempo: ${minutes}:${seconds}`;
    }
  }, 1000);
}

function createTimeDisplay() {
  const timeDisplay = document.createElement("div");
  timeDisplay.id = "time-display";
  timeDisplay.style.position = "absolute";
  timeDisplay.style.top = "10px";
  timeDisplay.style.left = "10px";
  timeDisplay.style.color = "#ff9a00";
  timeDisplay.style.fontFamily = "'Press Start 2P', cursive";
  timeDisplay.style.fontSize = "12px";
  forestMapDiv.appendChild(timeDisplay);
  return timeDisplay;
}

function gameLoop() {
  if (!isGamePaused) {
    handleMovement();
    updateCooldownsDisplay();
  }
  requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();

// Adicionar menus ao HTML dinamicamente
const gameMenu = document.createElement("div");
gameMenu.id = "game-menu";
gameMenu.style.display = "none";
gameMenu.style.position = "fixed";
gameMenu.style.top = "50%";
gameMenu.style.left = "50%";
gameMenu.style.transform = "translate(-50%, -50%)";
gameMenu.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
gameMenu.style.border = "4px solid #ff9a00";
gameMenu.style.padding = "20px";
gameMenu.style.zIndex = "2000";
gameMenu.style.width = "300px";
gameMenu.style.textAlign = "center";
gameMenu.innerHTML = `
    <div class="menu-content">
        <h2>MENU</h2>
        <button id="menu-inventory">Inventário (I)</button>
        <div id="inventory-menu" style="display: none;">
            <h2>INVENTÁRIO</h2>
            <div id="inventory-slots" class="inventory-grid"></div>
            <button id="close-inventory">Fechar (I)</button>
        </div>
        <button id="menu-skills">Habilidades (H)</button>
        <div id="skills-menu" style="display: none;">
            <h2>HABILIDADES</h2>
            <div id="skills-list"></div>
            <button id="close-skills">Fechar (H)</button>
        </div>
        <button id="menu-close">Fechar (M)</button>
    </div>
`;
forestMapDiv.appendChild(gameMenu);
document
  .getElementById("menu-inventory")
  .addEventListener("click", openInventory);
document
  .getElementById("close-inventory")
  .addEventListener("click", closeInventory);
document
  .getElementById("menu-skills")
  .addEventListener("click", openSkillsMenu);
document
  .getElementById("close-skills")
  .addEventListener("click", closeSkillsMenu);
document.getElementById("menu-close").addEventListener("click", toggleMenu);

// Adicionar evento para salvar o jogo manualmente
const saveButton = document.createElement("button");
saveButton.id = "menu-save";
saveButton.textContent = "Salvar (S)";
saveButton.style.marginTop = "10px";
document.querySelector("#game-menu .menu-content").appendChild(saveButton);
saveButton.addEventListener("click", saveGame);

// Adicionar evento para sair do jogo
const exitButton = document.createElement("button");
exitButton.id = "menu-exit";
exitButton.textContent = "Sair (Esc)";
exitButton.style.marginTop = "10px";
document.querySelector("#game-menu .menu-content").appendChild(exitButton);
exitButton.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja sair?")) {
    window.location.href = "../../home.html";
  }
});

// Adicionar atalho de teclado para salvar e sair
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "s" && isGamePaused) {
    saveGame();
  }
  if (e.key === "Escape" && isGamePaused) {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "../../home.html";
    }
  }
});