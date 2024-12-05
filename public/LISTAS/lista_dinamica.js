const { Script } = require("vm");

document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Substitua pela sua chave de API do TMDb

    // Função para obter os parâmetros da URL
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            listName: params.get('list'),
            movies: JSON.parse(params.get('movies') || '[]'), // Desserializa os filmes
        };
    }

    // Obtém os parâmetros da URL
    const { listName, movies } = getQueryParams();

    // Define o título da lista
    const tituloListaElement = document.getElementById('titulo_lista');
    if (listName) {
        tituloListaElement.textContent = listName;
    }

    const containerFilmes = document.querySelector('.container_filmes'); // Garantir que o contêiner existe
    if (!containerFilmes) {
        console.error('O contêiner de filmes não foi encontrado.');
        return;
    }

    // Adiciona os filmes dinamicamente
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'resumo_filme';
        movieCard.id = `movie_${movie.id}`; // Adiciona um ID único

        movieCard.innerHTML = `
            <div class="resumo_filme_imagem">
                <div class="titulo_genero">
                    <h3 id="titulo_filme">${movie.title || 'Título não disponível'}</h3>
                    <ul id="genero_filme">
                        <li id="genero_um">${movie.genres || 'Gêneros não disponíveis'}</li>
                    </ul>
                </div>
                <div class="novo_texto">
                    <p id="sinopse_filme">${movie.synopsis || 'Sinopse não disponível'}</p>
                    <ul id="informacoes_filme">
                        <li id="ano_lancamento">${movie.releaseYear || 'Ano não disponível'}</li>
                        <li id="duracao">${movie.duration || 'Duração não disponível'}</li>
                        <li id="classificacao_indicativa">${movie.rating || 'Classificação não disponível'}</li>
                    </ul>
                </div>
            </div>
        `;

        // Adiciona o card do filme ao contêiner
        containerFilmes.appendChild(movieCard);
    });

    // Função para buscar a classificação indicativa do filme
    async function getMovieRating(movieId) {
        const ratingUrl = `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${apiKey}`;
        try {
            const response = await fetch(ratingUrl);
            const data = await response.json();

            // Encontrar certificação para o Brasil
            const brazilCertification = data.results.find(entry => entry.iso_3166_1 === 'BR');
            return brazilCertification && brazilCertification.release_dates.length > 0
                ? brazilCertification.release_dates[0].certification || 'Indefinido'
                : 'Indefinido';
        } catch (error) {
            console.error(`Erro ao buscar classificação indicativa do filme com ID ${movieId}:`, error);
            return 'Erro';
        }
    }

    // Função para buscar detalhes do filme
    async function getMovieDetails(movieId, container) {
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`;

        const movieTitleElement = container.querySelector('.titulo_filme');
        const movieGenresElement = container.querySelector('.genero_um');
        const movieSynopsisElement = container.querySelector('.sinopse_filme');
        const movieInfoElement = container.querySelector('.informacoes_filme');
        const movieImageElement = container.querySelector('.resumo_filme_imagem');

        try {
            const response = await fetch(movieUrl);
            const movieData = await response.json();
            const rating = await getMovieRating(movieId);

            // Preenchendo os dados no contêiner
            movieTitleElement.textContent = movieData.title || 'Título não disponível';
            movieGenresElement.textContent = movieData.genres.map(genre => genre.name).slice(0, 2).join(' • ') || 'Gêneros não disponíveis';

            const shortSynopsis = movieData.overview?.length > 125
                ? movieData.overview.slice(0, 125) + '...'
                : movieData.overview || 'Sinopse não disponível';
            movieSynopsisElement.textContent = shortSynopsis;

            const releaseYear = new Date(movieData.release_date).getFullYear() || 'Ano não disponível';
            const duration = `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}min` || 'Duração não disponível';
            movieInfoElement.textContent = [releaseYear, duration, rating].join(' • ');

            // Imagem de fundo
            if (movieData.backdrop_path) {
                movieImageElement.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movieData.backdrop_path})`;
            }

        } catch (error) {
            console.error(`Erro ao buscar dados do filme com ID ${movieId}:`, error);
        }
    }

    // Função para preencher os filtros ao carregar a página
    function populateDropdowns() {
        const genreDropdown = document.getElementById('dropdown-genero');
        const yearDropdown = document.getElementById('dropdown-ano');
        const ratingDropdown = document.getElementById('dropdown-faixa-etaria');
        const serviceDropdown = document.getElementById('dropdown-servico');

        const uniqueGenres = [...new Set(loadedMovies.flatMap(movie => movie.genres))];
        const uniqueYears = [...new Set(loadedMovies.map(movie => movie.releaseYear))].sort();
        const uniqueRatings = [...new Set(loadedMovies.map(movie => movie.rating.split(' ')[0]))];
        const uniqueServices = [...new Set(loadedMovies.flatMap(movie => movie.streamingServices))];

        // Preencher dropdown de gêneros
        uniqueGenres.forEach(genre => {
            const li = document.createElement('li');
            li.className = 'option';
            li.textContent = genre;
            li.addEventListener('click', () => filterMoviesByGenre(genre));
            genreDropdown.appendChild(li);
        });

        // Preencher dropdown de ano
        uniqueYears.forEach(year => {
            const li = document.createElement('li');
            li.className = 'option';
            li.textContent = year;
            li.addEventListener('click', () => filterMoviesByDecade(`${Math.floor(year / 10) * 10}s`));
            yearDropdown.appendChild(li);
        });

        // Preencher dropdown de faixa etária
        uniqueRatings.forEach(rating => {
            const li = document.createElement('li');
            li.className = 'option';
            li.textContent = rating;
            li.addEventListener('click', () => filterMoviesByRating(rating));
            ratingDropdown.appendChild(li);
        });

        // Preencher dropdown de serviços de streaming
        uniqueServices.forEach(service => {
            const li = document.createElement('li');
            li.className = 'option';
            li.textContent = service;
            li.addEventListener('click', () => filterMoviesByStreaming(service));
            serviceDropdown.appendChild(li);
        });
    }

    // Preencher os filtros ao carregar a página
    populateDropdowns();
});

