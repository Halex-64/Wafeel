const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./public/assets/js/routes');
const session = require('express-session');
const authRoutes = require('./public/assets/js/auth');
const axios = require('axios');

const app = express();

const PORT = 3000;

const API_KEY = process.env.API_KEY;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(session({
    secret: 'chave-secreta', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: 'strict' } 
}));

app.use((req, res, next) => {
    res.locals.isLoggedin = req.session.isLoggedin || false;
    next();
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get('/api/providers', async (req, res) => {
    const response = await fetch(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}&watch_region=BR`);
    const data = await response.json();
    res.json(data.results);
});


app.get('/api/movies', (req, res) => {
    const providerId = req.query.provider;

    if (!providerId) {
        return res.status(400).json({ error: 'Provider ID é obrigatório' });
    }

    fetchMoviesByProvider(providerId) // Função que busca filmes pelo provedor
        .then(movies => res.json(movies))
        .catch(error => {
            console.error('Erro ao buscar filmes pelo provedor:', error);
            res.status(500).json({ error: 'Erro ao buscar filmes pelo provedor' });
        });
});

async function fetchPopularMovies() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;

    try {
        const response = await axios.get(url);
        console.log("Resposta da API TMDb:", response.data);
        return response.data.results; // Retorna diretamente o array de filmes
    } catch (error) {
        console.error('Erro ao buscar filmes populares:', error.response ? error.response.data : error.message);
        throw new Error('Erro ao buscar filmes populares')
    }
}

app.get('/filmes-populares', async (req, res) => {
    try {
        const filmes = await fetchPopularMovies();
        res.json(filmes);
    } catch (error) {
        console.error("Erro ao enviar filmes populares para o frontend:", error.message);
        res.status(500).json({ error: 'Erro ao buscar filmes populares' });
    }
});

// Função de exemplo para recomendação
function getRecommendation(category) {
    const recommendations = {
        'Ação': { title: 'Mad Max: Estrada da Fúria', id: 1, description: 'Um filme cheio de ação e aventura' },
        'Comédia': { title: 'A Vida é Bela', id: 2, description: 'Uma comédia com um toque emocional' },
        'Drama': { title: 'O Poderoso Chefão', id: 3, description: 'Um clássico drama familiar' },
        'Terror': { title: 'O Exorcista', id: 4, description: 'Um dos maiores filmes de terror da história' }
        // Adicione outras categorias conforme necessário
    };
    return recommendations[category] || null; // Retorna `null` se a categoria não for encontrada
}


app.get('/api/recommendation', (req, res) => {
    const category = req.query.category;
    console.log('Categoria recebida:', category);

    try {
        const recommendation = getRecommendation(category);
        if (recommendation) {
            res.json(recommendation);
        } else {
            res.status(404).json({ error: 'Recomendação não encontrada para a categoria fornecida' });
        }
    } catch (error) {
        console.error('Erro ao obter recomendação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);

app.use('/', routes);




