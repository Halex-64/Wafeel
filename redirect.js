import {isLoggedIn} from './auth.js';

window.onload = function() {
    const loginLink = document.getElementById('loginLink')
}

if(isLoggedIn()){
    loginLink.href = './perfil.html';
} else {
    loginLink.href = './login.html';
}