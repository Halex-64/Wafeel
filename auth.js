const express = require('express');
const router = express.Router();

// Simulação de banco de dados (pode usar um DB real como MongoDB, MySQL, etc.)
const users = [];

// Rota de cadastro
router.post('/cadastro', (req, res) => {
    const { email, password } = req.body;

    // Simples validação e verificação de usuário já existente
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).send('Usuário já cadastrado!');
    }

    // Cadastrar novo usuário
    users.push({ email, password });
    res.send('Cadastro realizado com sucesso!');
});

// Rota de login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar se o usuário existe e a senha está correta
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(400).send('Email ou senha inválidos!');
    }

    res.send('Login realizado com sucesso!');
    res.send(console.log(users))
});

router.get('/users', (req, res) =>[
    res.json(users)
])

module.exports = router;
