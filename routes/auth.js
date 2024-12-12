const express = require('express');
const router = express.Router();


// Middleware para verificar se o usuário está logado
function verificarLogin(req, res, next) {
    if (req.session.isLoggedin) {
        next();
    } else {
        res.status(401).send('Você precisa estar logado para acessar esta funcionalidade.');
    }
}




// Rota de logout
router.get('/logout', (req, res) => {
    if (req.session.isLoggedin) {
        req.session.destroy();
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    } else {
        res.redirect('/login.html');
    }
});

router.get('/check-session', (req, res) => {
    if (req.session.isLoggedin) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    return res.json({ loggedIn: false });
});

// Rota para obter os favoritos do usuário logado
router.get('/favoritos', verificarLogin, (req, res) => {
    const user = req.session.user;
    res.json(user.favoritos);
});

router.post('/favoritos', verificarLogin, (req, res) => {
    const user = req.session.user;
    const { id, title, poster_path, media_type } = req.body;

    const favoritoExistente = user.favoritos.find(f => f.id === id);

    if (favoritoExistente) {
        user.favoritos = user.favoritos.filter(f => f.id !== id);
        res.json({ message: 'Removido dos favoritos.', favoritos: user.favoritos });
    } else {
        const novoFavorito = { id, title, poster_path, media_type };
        user.favoritos.push(novoFavorito);
        res.json({ message: 'Adicionado aos favoritos!', favoritos: user.favoritos });
    }

    // Atualizar a lista de usuários (simulação de persistência)
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex].favoritos = user.favoritos;
    }
});

router.get('/status', (req, res) => {
    res.json({ isLoggedin: req.session.isLoggedin || false });
});

module.exports = router;
