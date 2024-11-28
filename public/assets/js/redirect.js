window.onload = async function () {
    // Seleciona os elementos dos links de usuário e favoritos
    const userLink = document.getElementById('userLink');
    const favLink = document.getElementById('favLink');

    try {
        // Faz a requisição para verificar o estado de login
        const response = await fetch('/api/check-login');
        const data = await response.json();

        // Se estiver logado, altera o link para perfil e favoritos
        if (data.isLoggedin !== true) {
            if (userLink) userLink.href = './login.html';
            if (favLink) favLink.href = './login.html';
        } else {
            // Caso contrário, direciona para login
            if (userLink) userLink.href = './perfil.html';
            if (favLink) favLink.href = './favoritos.html';
        }
    } catch (error) {
        console.error('Erro ao verificar login:', error);
    }
};

// Recarrega a página ao usar o botão "voltar" do navegador
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});