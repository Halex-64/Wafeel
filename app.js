const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./public/assets/js/routes');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const axios = require('axios');
const connection = require('./db');

const app = express();

const PORT = 3000;

const API_KEY = process.env.API_KEY;

app.use(session({
    secret: 'chave-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: 'strict' }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.isLoggedin = req.session.isLoggedin || false;
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));


app.use('/auth', require('./routes/auth'));

app.use('/', routes);


app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/api/providers', async (req, res) => {
    const response = await fetch(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}&watch_region=BR`);
    const data = await response.json();
    res.json(data.results);
});

app.get('/test-db', (req, res) => {
    const query = 'SELECT 1 + 1 AS resultado'; // Consulta simples para teste
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error.message);
            res.status(500).send('Erro ao conectar ao banco de dados.');
        } else {
            console.log('Consulta realizada com sucesso:', results);
            res.json({ resultado: results[0].resultado }); // Retorna o resultado
        }
    });
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

async function getRecommendations(category, type = 'movie', limit = 5) {
    const API_KEY = process.env.API_KEY;
    const excludedKeywords = ['erótica', 'adulto', 'sensual', 'sexo', 'sexuais'];

    try {
        // Faz uma requisição para buscar filmes ou séries
        const response = await axios.get(`https://api.themoviedb.org/3/discover/${type}`, {
            params: {
                api_key: API_KEY,
                with_genres: category,
                language: 'pt-BR',
                sort_by: 'popularity.desc',
                page: Math.floor(Math.random() * 10) + 1, // Página aleatória
                certification_country: 'BR',
                certification_lte: '16',
                include_adult: false,
                with_original_language: 'en'
            }
        });

        let mediaItems = response.data.results;

        // Filtro de itens
        mediaItems = mediaItems.filter(item => {
            const titleOrName = item.title || item.name || '';
            const overview = item.overview || '';

            const hasExcludedKeyword = excludedKeywords.some(keyword =>
                titleOrName.toLowerCase().includes(keyword) ||
                overview.toLowerCase().includes(keyword)
            );

            const hasValidPoster = item.poster_path;
            const hasValidTitle = /^[\w\sÀ-ÿ.,!?'()-]+$/.test(titleOrName);

            return !hasExcludedKeyword && hasValidPoster && hasValidTitle;
        });

        // Retorna os primeiros 'limit' itens ou menos
        return mediaItems.slice(0, limit);
    } catch (error) {
        console.error(`Erro ao buscar ${type}s:`, error.message);
        return [];
    }
}


app.get('/api/recommendation', async (req, res) => {
    const category = req.query.category;
    const type = req.query.type || 'movie'; // Padrão para 'movie' se 'type' não for especificado
    const limit = parseInt(req.query.limit, 10) || 5; // Padrão: até 5 itens

    try {
        const recommendations = await getRecommendations(category, type, limit);
        if (recommendations.length > 0) {
            res.json(recommendations);
        } else {
            res.status(404).json({ error: 'Nenhuma recomendação encontrada' });
        }
    } catch (error) {
        console.error('Erro ao buscar recomendações:', error.message);
        res.status(500).json({ error: 'Erro ao buscar recomendações' });
    }
});

app.get('/api/media/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    console.log(`Recebido tipo: ${type}, ID: ${id}`); // Log para depuração

    if (!['movie', 'tv'].includes(type)) {
        console.error('Tipo de mídia inválido:', type);
        return res.status(400).json({ error: 'Tipo de mídia inválido.' });
    }

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
            params: {
                api_key: process.env.API_KEY,
                language: 'pt-BR',
            },
        });

        console.log('Detalhes da mídia recebidos:', response.data);

        const providersResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${id}/watch/providers`, {
            params: {
                api_key: process.env.API_KEY,
            },
        });

        const providersData = providersResponse.data.results.BR?.flatrate || [];
        console.log('Provedores recebidos:', providersData);

        res.json({ mediaDetails: response.data, providersData });
    } catch (error) {
        console.error('Erro ao buscar detalhes da mídia:', error.message);
        res.status(404).json({ error: 'Mídia não encontrada.' });
    }
});

app.get('/api/search', async (req, res) => {
    const { name, type } = req.query;

    if (!name || !type) {
        return res.status(400).json({ error: 'Os parâmetros "name" e "type" são obrigatórios.' });
    }

    if (!['movie', 'tv'].includes(type)) {
        return res.status(400).json({ error: 'O parâmetro "type" deve ser "movie" ou "tv".' });
    }

    try {
        // Faz a busca na API do TMDb com base no tipo (movie ou tv)
        const response = await axios.get(`https://api.themoviedb.org/3/search/${type}`, {
            params: {
                api_key: API_KEY,
                query: name,
                language: 'pt-BR'
            }
        });

        const results = response.data.results;

        if (results.length === 0) {
            return res.status(404).json({ error: `${type === 'movie' ? 'Filme' : 'Série'} não encontrado(a).` });
        }

        // Retorna os resultados
        res.json(results[0]); // Retorna apenas o primeiro resultado
    } catch (error) {
        console.error('Erro ao buscar:', error.message);
        res.status(500).json({ error: 'Erro interno ao buscar.' });
    }
});

app.get('/tv-populares', async (req, res) => {
    console.log('Requisição recebida para séries populares'); // Log para verificar a rota
    try {
        const response = await axios.get('https://api.themoviedb.org/3/tv/popular', {
            params: {
                api_key: process.env.API_KEY,
                language: 'pt-BR',
                page: 1,
            },
        });

        // Filtrar resultados para excluir programas de TV não desejados
        const filteredResults = response.data.results.filter(tvShow => {
            const unwantedGenres = [10763, 10764, 10767]; // IDs para "Talk", "Reality", etc.
            const hasUnwantedGenre = tvShow.genre_ids.some(genre => unwantedGenres.includes(genre));
            return !hasUnwantedGenre; 
        });

        res.json(filteredResults);
    } catch (error) {
        console.error('Erro ao buscar séries populares:', error.message);
        res.status(500).json({ error: 'Erro ao buscar séries populares.' });
    }
});

app.get('/api/tv/:id/', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
            params: {
                api_key: process.env.API_KEY,
                language: 'pt-BR',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar detalhes da série:', error.message);
        res.status(404).json({ error: 'Série não encontrada.' });
    }
});

app.get('/api/tv/:id/providers', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}/watch/providers`, {
            params: {
                api_key: process.env.API_KEY,
            },
        });

        const providers = response.data.results?.BR || {}; // Filtro para provedores do Brasil (ou ajuste conforme necessário)
        res.json(providers);
    } catch (error) {
        console.error('Erro ao buscar provedores de streaming da série:', error.message);
        res.status(500).json({ error: 'Erro ao buscar provedores de streaming.' });
    }
});

app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});



