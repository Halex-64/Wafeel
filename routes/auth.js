const express = require('express');
const router = express.Router();

// Simulação de banco de dados (incluindo favoritos por usuário)
const users = [
    {
        email: 'nokotan@123',
        password: '12345678',
        favoritos: [] // Cada usuário tem sua lista de favoritos
    }
];

// Middleware para verificar se o usuário está logado
function verificarLogin(req, res, next) {
    if (req.session.isLoggedin) {
        next();
    } else {
        res.status(401).send('Você precisa estar logado para acessar esta funcionalidade.');
    }
}

// Rota de cadastro
// router.post('/cadastro', (req, res) => {
//     const { email, password, confirm_password } = req.body;

//     Validação e verificação de usuário já existente
//     const userExists = users.find(user => user.email === email);
//     if (userExists) {
//         return res.status(400).send('Usuário já cadastrado!');
//     }

//     Validação da senha
//     if (password.length < 8) {
//         return res.status(400).send('Senha muito curta');
//     }

//     if (password !== confirm_password) {
//         return res.status(400).send('Senhas diferentes!');
//     }

//     Cadastrar novo usuário
//     users.push({ email, password, favoritos: [] });
//     res.redirect('/login.html');
// });

router.post('/cadastro', async (req, res) => {
    const { email, senha, nome } = req.body;

    if (!email || !senha || !nome) {
        return res.status(400).json({
            success: false,
            message: 'Campos obrigatórios: email, senha e nome'
        });
    }

    let connection;
    try {
        // Cria a conexão assíncrona com o banco
        connection = await createConnection();

        // Verificar se o email já está cadastrado
        const [results] = await connection.execute('SELECT * FROM Usuario WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Inserir o novo usuário
        await connection.execute(
            'INSERT INTO Usuario (email, senha, nome, role, excluido) VALUES (?, ?, ?, 2, 0)',
            [email, senha, nome]
        );

        res.status(200).json({
            success: true,
            message: 'Usuário cadastrado com sucesso!'
        });
    } catch (err) {
        console.error('Erro ao processar a requisição:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar usuário'
        });
    } finally {
        if (connection) {
            await connection.end(); // Fecha a conexão com o banco de dados
        }
    }
});


// // Rota de login
// router.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     // Verificar se o usuário existe e a senha está correta
//     const user = users.find(user => user.email === email && user.password === password);
//     if (!user) {
//         return res.status(400).send('Email ou senha inválidos!');
//     }

//     req.session.isLoggedin = true;
//     req.session.user = user;

//     res.redirect('/index.html');
// });

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'Campos obrigatórios: email e senha'
        });
    }

    let connection;
    try {
        // Cria a conexão assíncrona com o banco
        connection = await createConnection();

        // Verificar se o usuário existe e se a senha está correta
        const [results] = await connection.execute('SELECT * FROM Usuario WHERE email = ?', [email]);

        if (results.length === 0 || results[0].senha !== senha) {
            return res.status(400).json({
                success: false,
                message: 'Email ou senha inválidos'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso!',
            user: results[0] // Retorna as informações do usuário (se necessário)
        });
        req.session.isLoggedin = true;
    } catch (err) {
        console.error('Erro ao processar a requisição:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao realizar login'
        });
    } finally {
        if (connection) {
            await connection.end(); // Fecha a conexão com o banco de dados
        }
    }
});

// Rota de logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
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

// Rota para adicionar/remover favoritos
router.post('/favoritos', verificarLogin, (req, res) => {
    const user = req.session.user;
    const { id, title, poster_path, media_type } = req.body;

    const favoritoExistente = user.favoritos.find(f => f.id === id);

    if (favoritoExistente) {
        // Remove dos favoritos
        user.favoritos = user.favoritos.filter(f => f.id !== id);
        res.json({ message: 'Removido dos favoritos.', favoritos: user.favoritos });
    } else {
        // Adiciona aos favoritos
        const novoFavorito = { id, title, poster_path, media_type };
        user.favoritos.push(novoFavorito);
        res.json({ message: 'Adicionado aos favoritos!', favoritos: user.favoritos });
    }
});

router.get('/status', (req, res) => {
    res.json({ isLoggedin: req.session.isLoggedin || false });
});

router.post("/gerar-recomendacao", async (req, res) => {
    let connection;
    try {
        connection = await createConnection();

        const { emocao } = req.body;

        // Mapeamento de emoções para seus IDs no banco
        const mapeamentoEmocoes = {
            "felicidade": 1,
            "tristeza": 2,
            "tédio": 3,
            "estresse": 4,
            "ansiedade": 5,            
            "solidão": 6
        };

        // Buscar um conteúdo aleatório da emoção correspondente
        const [conteudos] = await connection.execute(
            `SELECT c.titulo, c.tipo, c.id_API
            FROM Conteudo c
            JOIN Tag_Emocao te ON c.id_API = te.id_Conteudo
            WHERE te.id_Emocao = ?
            ORDER BY RAND()
            LIMIT 1`,
            [mapeamentoEmocoes[emocao]]
        );

        if (conteudos.length > 0) {
            const conteudo = conteudos[0];
            try {
                // Consultar detalhes do conteúdo na API TMDb
                const response = await axios.get(`https://api.themoviedb.org/3/movie/${conteudo.id_API}?api_key=${TMDB_API_KEY}`);
                const data = response.data;

                res.json({
                    sucesso: true,
                    conteudo: {
                        titulo: conteudo.titulo,
                        tipo: conteudo.tipo,
                        imagem: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'imagem_default.jpg',
                        descricao: data.overview || 'Descrição não disponível'
                    }
                });
            } catch (error) {
                console.error(`Erro ao buscar detalhes do filme: ${error}`);
                res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar detalhes do filme." });
            }
        } else {
            res.json({
                sucesso: false,
                mensagem: "Nenhum conteúdo encontrado para a emoção selecionada."
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: "Erro ao gerar recomendação." });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});


router.post("/gerar-lista", async (req, res) => {
    let connection;
    try {
        connection = await createConnection();

        const { emocao } = req.body;

        // Mapeamento de emoções para seus IDs no banco
        const mapeamentoEmocoes = {
            "felicidade": 1,
            "tristeza": 2,
            "tédio": 3,
            "estresse": 4,
            "ansiedade": 5,            
            "solidão": 6
        };

        // Buscar 10 conteúdos aleatórios da emoção correspondente
        const [conteudos] = await connection.execute(
            `SELECT c.titulo, c.tipo, c.id_API
            FROM Conteudo c
            JOIN Tag_Emocao te ON c.id_API = te.id_Conteudo
            WHERE te.id_Emocao = ?
            ORDER BY RAND()
            LIMIT 10`,
            [mapeamentoEmocoes[emocao]]
        );

        if (conteudos.length > 0) {
            const apiResults = await Promise.all(
                conteudos.map(async (conteudo) => {
                    try {
                        const response = await axios.get(`https://api.themoviedb.org/3/movie/${conteudo.id_API}`, {
                            params: {
                                api_key: TMDB_API_KEY,
                                language: 'pt-BR' // Define o idioma como português
                            }
                        });
                        const data = response.data;

                        return {
                            titulo: conteudo.titulo,
                            tipo: conteudo.tipo,
                            imagem: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'imagem_default.jpg',
                            descricao: data.overview || 'Descrição não disponível'
                        };
                    } catch (error) {
                        console.error(`Erro ao buscar detalhes do filme: ${error}`);
                        return {
                            titulo: conteudo.titulo,
                            tipo: conteudo.tipo,
                            imagem: 'imagem_default.jpg',
                            descricao: 'Descrição não disponível'
                        };
                    }
                })
            );

            res.json({
                sucesso: true,
                conteudos: apiResults
            });
        } else {
            res.json({
                sucesso: false,
                mensagem: "Nenhum conteúdo encontrado para a emoção selecionada."
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: "Erro ao gerar lista de conteúdo." });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;

