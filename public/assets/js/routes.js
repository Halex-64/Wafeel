const express = require('express');
const path = require('path');
const axios = require('axios');
const { isLoggedIn } = require('../../../routes/auth');
require('dotenv').config();

const { users } = require('./user');

console.log(users);

//Chave da API
const API_KEY = process.env.API_KEY;

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

// Rota para a página de Quiz 
router.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Rota para a página de Séries
router.get('/series', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'series.html'));
});

// Rota para a página de Listas
router.get('/listas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'listas.html'));
});

// Rota para a página de Favoritos
router.get('/favoritos', (req, res) => {
    if (req.session.isLoggedin === true) {
        res.sendFile(path.join(__dirname, 'public', 'favoritos.html'));
    } else {
        res.redirect('login.html');
    }
});

// Rota para a página de Perfil
router.get('/perfil', (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
    } else {
        res.redirect('login.html')
    }
});


// Rota que checa se o Usuario está logado ou não
router.get('/api/check-login', (req, res) => {
    if (req.session.isLoggedin) {
        res.json({ isLoggedin: true });
    } else {
        res.json({ isLoggedin: false });
    }
});

// Rota para a página de Cadastro
router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

//Rota de login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Requisição de login recebida');

    // Verificar se o usuário existe e a senha está correta
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(400).send('Email ou senha inválidos!');
    };

    req.session.isLoggedin = true;
    req.session.user = user;

    res.redirect('/perfil.html');
    console.log('isLoggedin: ', req.session.isLoggedin);
});

router.get('/providers', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}&language=pt-BR&watch_region=BR`);

        // Verificação e mapeamento dos provedores
        const providersData = response.data?.results;
        if (providersData && providersData['BR'] && providersData['BR'].flatrate) {
            const platforms = providersData['BR'].flatrate.map(provider => provider.provider_name);
            res.json(platforms);
        } else {
            console.warn('Não foram encontrados provedores de streaming na resposta da API.');
            res.json([]); // Retorna uma lista vazia caso não haja provedores
        }
    } catch (error) {
        console.error('Erro ao buscar provedores:', error.message);
        res.status(500).send('Erro ao buscar provedores');
    }
});

router.get('/filmes-streaming', async (req, res) => {
    try {
        const { data } = await axios.get(`https://api.themoviedb.org/3/movie/{movie_id}/watch/providers?api_key=${API_KEY}`);
        res.json(data.results);
    } catch (error) {
        console.error('Erro ao buscar plataformas de streaming:', error.message);
        res.status(500).send('Erro ao buscar plataformas de streaming');
    }
});

router.get('/filmes-populares', async (req, res) => {
    const plataforma = req.query.plataforma;
    let url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=pt-BR`;

    if (plataforma) {
        url += `&with_watch_providers=${plataforma}`;
    }

    try {
        const response = await axios.get(url);
        res.json(response.data.results);
    } catch (error) {
        console.error('Erro ao buscar filmes populares: ', error.message);
        res.status(500).send('Erro ao buscar filmes populares');
    }
});

//Rota que faz a conexão com a API e busca os filmes recentes
router.get('/filmes-recentes', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);

        res.json(response.data.results);
    } catch (error) {
        console.error('Erro ao buscar filmes recentes: ', error.message);
        res.status(500).send('Erro ao buscar filmes populares');
    }
})

//Rota que faz a conexão com a API e traz os detalhes dos filmes
router.get('/filmes-detalhes', async (req, res) => {
    const movieId = req.query.id; // Captura o ID da URL

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=pt-BR`);
        res.json(response.data); // Retorna os detalhes do filme
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme: ', error.message);
        res.status(500).send('Erro ao buscar detalhes do filme');
    }
});

router.get('/series-populares', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=pt-BR`);

        res.json(response.data.results);
    } catch (error) {
        console.error('Erro ao buscar Series Populares: ', error.message);
        res.status(500).send('Erro ao buscar series populares');
    }
});

router.get('/series-detalhes', async (req, res) => {
    const serieId = req.query.id; // Captura o ID da URL

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${serieId}?api_key=${API_KEY}&language=pt-BR`);
        res.json(response.data); // Retorna os detalhes do serie
    } catch (error) {
        console.error('Erro ao buscar detalhes do serie: ', error.message);
        res.status(500).send('Erro ao buscar detalhes do serie');
    }
});

// Rota para filtrar séries populares por provedor
router.get('/api/tv', async (req, res) => {
    const { provider, type } = req.query;

    if (!provider || !type) {
        return res.status(400).send('Parâmetros provider e type são necessários');
    }

    let url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=pt-BR`;

    if (type === 'popular') {
        url += `&sort_by=popularity.desc`;
    } else if (type === 'recent') {
        url += `&sort_by=first_air_date.desc`;
    } else if (type === 'top-rated') {
        url += `&sort_by=vote_average.desc`;
    }

    // Adicionando o provedor de streaming
    url += `&with_watch_providers=${provider}`;

    try {
        const response = await axios.get(url);
        res.json(response.data.results);
    } catch (error) {
        console.error(`Erro ao buscar séries ${type}: `, error.message);
        res.status(500).send(`Erro ao buscar séries ${type}`);
    }
});


router.get('/series-recentes', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=1&sort_by=popularity.desc&watch_region=br&with_original_language=en`
        );

        const data = response.data; // Resposta da API

        // IDs dos gêneros que você deseja excluir
        const excludedGenres = [10764, 10766, 10763, 10767, 10762]; // 10764: Reality, 10766: Drama televisivo, 10763: Jornais/News, 10767: Talk, 10762: Kids

        if (Array.isArray(data.results) && data.results.length > 0) {
            // Filtrar séries lançadas até o ano atual e excluir gêneros indesejados
            const filteredSeries = data.results.filter(serie => {
                const releaseYear = parseInt(serie.first_air_date?.split('-')[0], 10); // Extrai o ano de lançamento
                const hasExcludedGenre = serie.genre_ids.some(id => excludedGenres.includes(id)); // Verifica se contém gênero excluído
                return releaseYear <= 2024 && !hasExcludedGenre; // Inclui apenas séries sem os gêneros excluídos
            });

            // Ordenar os resultados de forma decrescente pelo ano de lançamento
            const sortedSeries = filteredSeries.sort((a, b) => {
                const yearA = parseInt(a.first_air_date?.split('-')[0], 10);
                const yearB = parseInt(b.first_air_date?.split('-')[0], 10);
                return yearB - yearA; // Ordem decrescente
            });

            return res.json(sortedSeries); // Envia a resposta ordenada
        }

        // Se não houver resultados, retorna um array vazio
        console.warn('Nenhuma série encontrada:', data);
        return res.json([]);

    } catch (error) {
        console.error('Erro ao buscar séries recentes:', error);
        return res.status(500).json({ error: 'Erro ao buscar séries recentes' });
    }
});

router.get('/series-melhores-avaliacoes', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=1&sort_by=vote_average.desc&vote_count.gte=50&watch_region=br&with_original_language=en`
        );

        const data = response.data; // Resposta da API

        // IDs dos gêneros que você deseja excluir
        const excludedGenres = [10764, 10766, 10763, 10767, 10762, 99]; // 10764: Reality, 10766: Drama televisivo, 10763: Jornais/News, 10767: Talk, 10762: Kids, 99: Documentários

        if (Array.isArray(data.results) && data.results.length > 0) {
            // Filtrar séries que não contenham gêneros excluídos
            const filteredSeries = data.results.filter(serie => {
                const hasExcludedGenre = serie.genre_ids.some(id => excludedGenres.includes(id)); // Verifica se contém gênero excluído
                return !hasExcludedGenre; // Inclui apenas séries sem os gêneros excluídos
            });

            return res.json(filteredSeries); // Envia a resposta filtrada
        }

        // Se não houver resultados, retorna um array vazio
        console.warn('Nenhuma série encontrada:', data);
        return res.json([]);

    } catch (error) {
        console.error('Erro ao buscar séries com melhor avaliação:', error);
        return res.status(500).json({ error: 'Erro ao buscar séries com melhor avaliação' });
    }
});

router.get('/filmes-melhores-avaliacoes', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&include_adult=false&include_video=false&language=pt-BR&page=1&sort_by=vote_average.desc&vote_count.gte=50&watch_region=br&with_original_language=en`
        );

        const data = response.data; // Resposta da API

        // IDs dos gêneros que você deseja excluir
        const excludedGenres = [10749, 16, 99]; // Exemplo: 10749: Romance, 16: Animação, 99: Documentário

        if (Array.isArray(data.results) && data.results.length > 0) {
            // Filtrar filmes que não contenham gêneros excluídos
            const filteredMovies = data.results.filter(movie => {
                const hasExcludedGenre = movie.genre_ids.some(id => excludedGenres.includes(id)); // Verifica se contém gênero excluído
                return !hasExcludedGenre; // Inclui apenas filmes sem os gêneros excluídos
            });

            return res.json(filteredMovies); // Envia a resposta filtrada
        }

        // Se não houver resultados, retorna um array vazio
        console.warn('Nenhum filme encontrado:', data);
        return res.json([]);

    } catch (error) {
        console.error('Erro ao buscar filmes com melhor avaliação:', error);
        return res.status(500).json({ error: 'Erro ao buscar filmes com melhor avaliação' });
    }
});

router.get('/api/movies', async (req, res) => {
    const { provider, type } = req.query;

    if (!provider || !type) {
        return res.status(400).json({ error: 'Os parâmetros "provider" e "type" são obrigatórios.' });
    }

    try {
        let sortBy;
        if (type === 'popular') {
            sortBy = 'popularity.desc';
        } else if (type === 'recent') {
            sortBy = 'release_date.desc';
        } else if (type === 'top-rated') {
            sortBy = 'vote_average.desc';
        } else {
            return res.status(400).json({ error: 'O parâmetro "type" é inválido.' });
        }

        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?with_watch_providers=${provider}&sort_by=${sortBy}&api_key=${API_KEY}&language=pt-BR&watch_region=BR`
        );

        console.log('Requisição para TMDb:', tmdbResponse.config.url);

        // Retorne os resultados ao cliente
        return res.json(tmdbResponse.data.results);
    } catch (error) {
        console.error('Erro ao processar /api/movies:', error.message);

        // Retorne apenas uma vez o erro ao cliente
        return res.status(500).json({ error: 'Erro ao buscar filmes.' });
    }
});



module.exports = router;