window.onload = async function() {
    const userLink = document.getElementById('userLink');

    // Fazer uma requisição ao servidor para verificar o estado da sessão
    const response = await fetch('/api/check-login');
    const data = await response.json();

    if (data.isLoggedin) {
        userLink.href = './perfil.html';
    } else {
        userLink.href = './login.html';
    }
};

window.onload = async function() {
    const userLink = document.getElementById('favLink');

    // Fazer uma requisição ao servidor para verificar o estado da sessão
    const response = await fetch('/api/check-login');
    const data = await response.json();

    if (data.isLoggedin) {
        userLink.href = './fav.html';
    } else {
        userLink.href = './login.html';
    }
};