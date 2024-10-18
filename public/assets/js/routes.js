const express = require('express');
const path = require('path');
const axios = require('axios');
const { isLoggedIn } = require('./auth');

const API_KEY = 'REMOVIDO';

// Criar um roteador
const router = express.Router();

// Rota para a página inicial
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.render('index', { isLoggedIn: isLoggedIn });
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

router.get('/favoritos', (req, res) => {
    if (req.session.isLoggedin) {
        res.sendFile(path.join(__dirname, 'public', 'favoritos.html'));
    } else {
        res.redirect('login.html');
    }
});

router.get('/perfil', (req, res) => {
    if(req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
    } else {
        res.redirect('login.html')
    }
    

});

router.get('/api/check-login', (req, res) => {
    if (req.session.isLoggedin) {
        res.json({ isLoggedin: true });
    } else {
        res.json({ isLoggedin: false });
    }
});

router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

router.get('/filmes-populares', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);

        res.json(response.data.results);
    } catch (error) {
        console.error('Erro ao buscar filmes populares: ', error.message);
        res.status(500).send('Erro ao buscar filmes populares');
    }
});

module.exports = router;