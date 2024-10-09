import {isLoggedIn} from './auth.js';

window.onload = function() {
    const userLink = document.getElementById('userLink')
}

if(isLoggedIn === true){
    userLink.href = './perfil.html';
} else {
    userLink.href = './login.html';
}