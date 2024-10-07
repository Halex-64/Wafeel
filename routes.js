const express = require('express');
const path = require('path');

// Criar um roteador
const router = express.Router();

// Rota para a página inicial
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para a página de filmes
router.get('/filmes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'filmes.html'));
});

// Rota para a página de quiz
router.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

router.get('/series', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'series.html'));
});

router.get('/listas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'listas.html'));
});

router.get('/assistir_mais_tarde', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'assistir_mais_tarde.html'));
});

router.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});

router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


module.exports = router;