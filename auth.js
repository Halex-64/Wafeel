const express = require('express');
const router = express.Router();

// Simulação de banco de dados (pode usar um DB real como MongoDB, MySQL, etc.)
const users = [];

let isLoggedin = false;

// Rota de cadastro
router.post('/cadastro', (req, res) => {
    const { email, password } = req.body;

    // Validação e verificação de usuário já existente
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).send('Usuário já cadastrado!');
    }

    // Cadastrar novo usuário
    users.push({ email, password });
    res.redirect('/index.html');
});

// Rota de login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if(isLoggedin){
        res.redirect('/perfil.html')
    }

    if (isLoggedin = false){
        res.redirect('/cadastro.html')
    }

    // Verificar se o usuário existe e a senha está correta
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(400).send('Email ou senha inválidos!');
    }
    
    isLoggedin = true;
    res.redirect('/index.html');
    res.send(console.log(users));
});

router.get('/logout', (req,res) =>{
    isLoggedin = false;
    res.redirect('/login.html')
});

router.get('/users', (req, res) =>[
    res.json(users)
]);

module.exports = router;
