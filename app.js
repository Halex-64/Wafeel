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
async function getRecommendation(category) {
    const API_KEY = process.env.API_KEY; // Use sua chave da API aqui
    const excludedKeywords = ['erótica', 'adulto', 'sensual', 'sexo', 'sexuais',];
    //const excludedGenres = [18];
    try {
        // Faz uma requisição para buscar filmes dentro da categoria
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: {
                api_key: API_KEY,
                with_genres: category, // Filtra pela categoria (gênero)
                language: 'pt-BR',
                sort_by: 'popularity.desc', // Ordena por popularidade
                page: Math.floor(Math.random() * 10) + 1, // Página aleatória para maior variedade
                certification_country: 'BR',
                certification_lte: '16',
                include_adult: false,
                with_original_language: 'en'
            }
        });

        let movies = response.data.results;

       movies = movies.filter(movie => {

        const hasExcludedKeyword = excludedKeywords.some(keyword =>movie.title && movie.overview && movie.overview.toLowerCase().includes(keyword));
        //const hasExcludedGenre = movie.genre_ids.some(genre => excludedGenres.includes(genre));
        const hasValidTitle = /^[\w\sÀ-ÿ.,!?'()-]+$/.test(movie.title || '');
        const hasValidPoster = movie.poster_path && !movie.title.includes("가슴");
        const hasCertification = movie.certification || movie.vote_average >= 5.0;

        return hasValidTitle && hasValidPoster && hasCertification && !hasExcludedKeyword;
    });

        // Seleciona um filme aleatório da lista
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        return randomMovie;
    } catch (error) {
        console.error('Erro ao buscar filmes:', error.message);
        return null;
    }
}


app.get('/api/recommendation', async (req, res) => {
    const category = req.query.category;
    try {
        const recommendation = await getRecommendation(category);
        if (recommendation) {
            res.json(recommendation);
        } else {
            res.status(404).json({ error: 'Nenhuma recomendação encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar recomendação' });
    }
});

// Rota no backend para detalhes do filme
app.get('/api/movie/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: {
                api_key: process.env.API_KEY, // Sua chave API
                language: 'pt-BR'
            }
        });
        const providersResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, {
            params: { api_key: process.env.API_KEY }
        });

        const movieDetails = response.data;
        const providersData = providersResponse.data.results.BR?.flatrate || [];
        res.json({ movieDetails, providersData });
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error.message);
        res.status(500).json({ error: 'Erro ao buscar detalhes do filme.' });
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

app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);

app.use('/', routes);




