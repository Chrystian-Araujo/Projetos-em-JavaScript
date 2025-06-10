function startGame() {
    // Redireciona para a criação de personagem
    window.location.href = "criacao_personagem/char_create.html";
}

function openControls() {
    document.getElementById("controls-panel").style.display = "block";
}

function closeControls() {
    document.getElementById("controls-panel").style.display = "none";
}

function openCredits() {
    document.getElementById("credits-panel").style.display = "block";
}

function closeCredits() {
    document.getElementById("credits-panel").style.display = "none";
}

function openSavedGames() {
    const savedGamesPanel = document.getElementById("saved-games-panel");
    const savedGamesList = document.getElementById("saved-games-list");
    savedGamesList.innerHTML = '';

    const savedGames = JSON.parse(localStorage.getItem("savedGames")) || {};
    
    if (Object.keys(savedGames).length === 0) {
        savedGamesList.innerHTML = '<p>Nenhum jogo salvo encontrado.</p>';
    } else {
        for (const [name, data] of Object.entries(savedGames)) {
            const gameEntry = document.createElement("div");
            gameEntry.className = "saved-game";
            gameEntry.textContent = `Personagem: ${name} | Classe: ${data.class} | Data: ${new Date(data.timestamp).toLocaleString()}`;
            gameEntry.onclick = () => loadGame(name);
            savedGamesList.appendChild(gameEntry);
        }
    }

    savedGamesPanel.style.display = "block";
}

function closeSavedGames() {
    document.getElementById("saved-games-panel").style.display = "none";
}

function loadGame(characterName) {
    localStorage.setItem("currentCharacter", characterName);
    window.location.href = "Mapas/floresta/floresta.html";
}

window.onload = function() {
    console.log("Bem-vindo ao ASCII Adventure!");
};