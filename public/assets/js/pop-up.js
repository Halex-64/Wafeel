// Seleciona os elementos necessários
const profileIcon = document.getElementById('userLink');
const popup = document.querySelector('.pop-up_login_cadastro');
const closeButtons = document.querySelectorAll('.close, .close_responsivo');

// Função para mostrar o popup
function showPopup() {
    popup.classList.remove('hidden');
    document.body.classList.add('overlay-active'); // Impede o scroll
}

// Função para esconder o popup
function hidePopup() {
    popup.classList.add('hidden');
    document.body.classList.remove('overlay-active'); // Permite o scroll novamente
}

// Evento de clique no ícone do perfil
profileIcon.addEventListener('click', showPopup);

// Eventos de clique nos botões de fechar
closeButtons.forEach(button => {
    button.addEventListener('click', hidePopup);
});

// Fecha o popup ao clicar fora dele (opcional)
window.addEventListener('click', (event) => {
    if (event.target === popup) {
        hidePopup();
    }
});