// Login de jogador normal
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const color = document.querySelector('input[name="color"]:checked').value;
    sessionStorage.setItem('name', name);
    sessionStorage.setItem('color', color);
    sessionStorage.setItem('userType', 'player');
    window.location.href = 'game.html';
});

// Funcionalidade do login de admin
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const closeAdmin = document.getElementById('closeAdmin');
const adminLoginForm = document.getElementById('adminLoginForm');

// Mostrar/esconder painel de admin
adminToggle.addEventListener('click', function() {
    adminPanel.classList.toggle('hidden');
});

// Fechar painel de admin
closeAdmin.addEventListener('click', function() {
    adminPanel.classList.add('hidden');
    document.getElementById('adminPassword').value = '';
});

// Login de admin
adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === 'admin0911') {
        sessionStorage.setItem('userType', 'admin');
        sessionStorage.setItem('name', 'Administrador');
        sessionStorage.setItem('color', '#FF0000'); // Cor vermelha para admin
        window.location.href = 'game.html';
    } else {
        alert('Senha incorreta!');
        document.getElementById('adminPassword').value = '';
    }
});

// Fechar painel ao clicar fora dele
document.addEventListener('click', function(e) {
    if (!adminPanel.contains(e.target) && !adminToggle.contains(e.target)) {
        adminPanel.classList.add('hidden');
        document.getElementById('adminPassword').value = '';
    }
});

// Permitir Enter para submeter o formulário de admin
document.getElementById('adminPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        adminLoginForm.dispatchEvent(new Event('submit'));
    }
});