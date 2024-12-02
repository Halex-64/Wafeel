document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Substitua pela sua chave de API do TMDb

    // Filmes a serem carregados, com IDs específicos
    const movies = [
        { id: 786892, containerId: 'resumo_filme_1' },
        { id: 929590, containerId: 'resumo_filme_2' },
        { id: 1023922, containerId: 'resumo_filme_3' },
        { id: 437342, containerId: 'resumo_filme_4' },
        { id: 1111873, containerId: 'resumo_filme_5' },
        { id: 937287, containerId: 'resumo_filme_6' },
        { id: 762441, containerId: 'resumo_filme_7' },
        { id: 693134, containerId: 'resumo_filme_8' },
        { id: 560016, containerId: 'resumo_filme_9' },
        { id: 948549, containerId: 'resumo_filme_10' },
        { id: 1032823, containerId: 'resumo_filme_11' },
        { id: 933260, containerId: 'resumo_filme_12' }
    ];

    // Função para buscar as informações do filme
    async function getMovieDetails(movieId, containerId) {
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.warn(`Container com ID "${containerId}" não encontrado.`);
            return;
        }

        // Seleciona elementos dentro do contêiner específico
        const movieTitleElement = container.querySelector('#titulo_filme');
        const genreOneElement = container.querySelector('#genero_um');
        const synopsisElement = container.querySelector('#sinopse_filme');
        const infoElement = container.querySelector('#informacoes_filme');
        const movieImageElement = container.querySelector('.resumo_filme_imagem');

        try {
            const response = await fetch(movieUrl);
            const movieData = await response.json();

            // Título do filme
            movieTitleElement.textContent = movieData.title || 'Título não disponível';

            // Ajustar o tamanho da fonte do título
            adjustTitleFontSize(movieTitleElement);

            // Gêneros
            const genres = movieData.genres.map(genre => genre.name).slice(0, 2).join(' • ');
            genreOneElement.textContent = genres || 'Gêneros não disponíveis';

            // Sinopse
            const maxSynopsisLength = 125;
            let shortSynopsis = movieData.overview || 'Sinopse não disponível';

            if (shortSynopsis.length > maxSynopsisLength) {
                shortSynopsis = shortSynopsis.slice(0, maxSynopsisLength) + '...';
            }
            synopsisElement.textContent = shortSynopsis;

            // Ano de lançamento, duração e classificação indicativa concatenados
            const releaseYear = new Date(movieData.release_date).getFullYear() || 'Ano não disponível';
            const duration = `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}min` || 'Duração não disponível';
            const rating = movieData.adult ? '18 Anos' : 'Livre';
            infoElement.innerHTML = [releaseYear, duration, rating].join(' • ');


            // Imagem de fundo
            if (movieData.backdrop_path) {
                const backdropUrl = `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`;
                movieImageElement.style.backgroundImage = `url(${backdropUrl})`;
            } else {
                console.warn('Nenhum backdrop disponível para este filme.');
            }
        } catch (error) {
            console.error(`Erro ao buscar dados do filme com ID ${movieId}:`, error);
        }
    }

    // Função para ajustar o tamanho da fonte do título
    function adjustTitleFontSize(titleElement) {
        const titleLength = titleElement.textContent.length;

        if (titleLength <= 15) {
            titleElement.style.fontSize = '48px';
        } else if (titleLength <= 30) {
            titleElement.style.fontSize = '40px';
        } else if (titleLength <= 45) {
            titleElement.style.fontSize = '32px';
        } else {
            titleElement.style.fontSize = '24px';
        }
    }

    // Itera por todos os filmes e preenche as informações
    movies.forEach((movie) => {
        getMovieDetails(movie.id, movie.containerId);
    });
});

