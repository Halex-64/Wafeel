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

    // Lista para armazenar os dados dos filmes carregados
    const loadedMovies = [];

    // Função para buscar a classificação indicativa
    async function getMovieRating(movieId) {
        const ratingUrl = `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${apiKey}`;
        try {
            const response = await fetch(ratingUrl);
            const data = await response.json();

            // Encontrar certificação para o Brasil
            const brazilCertification = data.results.find(entry => entry.iso_3166_1 === 'BR');
            if (brazilCertification && brazilCertification.release_dates.length > 0) {
                return brazilCertification.release_dates[0].certification || 'Indefinido';
            }

            return 'Indefinido'; // Caso não haja certificação para o Brasil
        } catch (error) {
            console.error(`Erro ao buscar classificação indicativa do filme com ID ${movieId}:`, error);
            return 'Erro';
        }
    }

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

            // Obter classificação indicativa
            const rating = await getMovieRating(movieId);

            const streamingServices = await getMovieStreamingServices(movieId);

            // Salvar os dados do filme carregado
            loadedMovies.push({
                id: movieId,
                title: movieData.title,
                genres: movieData.genres.map(genre => genre.name),
                releaseYear: new Date(movieData.release_date).getFullYear(),
                rating: rating, // Salva a classificação indicativa
                streamingServices: streamingServices, // Adiciona serviços de streaming
                containerId: containerId,
            });

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

    function clearFilters() {
        // Exibir todos os filmes
        loadedMovies.forEach(movie => {
            const movieElement = document.getElementById(movie.containerId);
            movieElement.style.display = 'block';
        });
    
        // Resetar dropdowns de filtros (se houver)
        document.getElementById('dropdown-genero').value = '';
        document.getElementById('dropdown-ano').value = '';
        document.getElementById('dropdown-faixa-etaria').value = '';
        document.getElementById('dropdown-servico').value = '';
        
        // Remover qualquer seleção de filtro nos itens
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
    
        // Esconder o botão de reset após o reset
        document.getElementById('resetar-filtro').style.display = 'none';
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

    // Função para filtrar filmes por gênero
    function filterMoviesByGenre(selectedGenre) {
        let anyFilterApplied = false;
    
        loadedMovies.forEach(movie => {
            const movieElement = document.getElementById(movie.containerId);
            if (movie.genres.includes(selectedGenre)) {
                movieElement.style.display = 'block';
                anyFilterApplied = true;
            } else {
                movieElement.style.display = 'none';
            }
        });
    
        // Mostrar ou esconder o botão de reset dependendo se algum filtro foi aplicado
        if (anyFilterApplied) {
            document.getElementById('resetar-filtro').style.display = 'block';
        } else {
            document.getElementById('resetar-filtro').style.display = 'none';
        }
    }
    

    // Função para filtrar filmes por década
    function filterMoviesByDecade(selectedDecade) {
        const startYear = parseInt(selectedDecade.slice(0, -1), 10); // Ex.: "1990s" -> 1990
        const endYear = startYear + 9;
        let anyFilterApplied = false;
    
        loadedMovies.forEach(movie => {
            const movieElement = document.getElementById(movie.containerId);
            if (movie.releaseYear >= startYear && movie.releaseYear <= endYear) {
                movieElement.style.display = 'block';
                anyFilterApplied = true;
            } else {
                movieElement.style.display = 'none';
            }
        });
    
        // Mostrar ou esconder o botão de reset dependendo se algum filtro foi aplicado
        if (anyFilterApplied) {
            document.getElementById('resetar-filtro').style.display = 'block';
        } else {
            document.getElementById('resetar-filtro').style.display = 'none';
        }
    }

    // Função para filtrar filmes por faixa etária
    function filterMoviesByRating(selectedRating) {
        let anyFilterApplied = false; // Variável para verificar se algum filtro foi aplicado
    
        loadedMovies.forEach(movie => {
            const movieElement = document.getElementById(movie.containerId);
            const rating = movie.rating.split(' ')[0]; // Pega apenas a parte numérica da classificação
        
            // Verifica se a classificação é exatamente igual à selecionada
            if (rating === selectedRating || (selectedRating === 'Livre' && rating === 'Indefinido')) {
                movieElement.style.display = 'block';
                anyFilterApplied = true; // Filtro foi aplicado
            } else {
                movieElement.style.display = 'none';
            }
        });
    
        // Mostrar ou esconder o botão de reset dependendo se algum filtro foi aplicado
        if (anyFilterApplied) {
            document.getElementById('resetar-filtro').style.display = 'block';
        } else {
            document.getElementById('resetar-filtro').style.display = 'none';
        }
    }
    

    async function getMovieStreamingServices(movieId) {
        const streamingUrl = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`;
        try {
            const response = await fetch(streamingUrl);
            const data = await response.json();
            if (data.results && data.results.BR && data.results.BR.flatrate) {
                return data.results.BR.flatrate.map(service => service.provider_name); // Retorna apenas os nomes dos serviços de streaming
            }
            return [];
        } catch (error) {
            console.error(`Erro ao buscar serviços de streaming do filme com ID ${movieId}:`, error);
            return [];
        }
    }

    // Função para filtrar filmes por serviço de streaming
    function filterMoviesByStreaming(selectedService) {
        let anyFilterApplied = false; // Variável para verificar se algum filtro foi aplicado
    
        loadedMovies.forEach(movie => {
            const movieElement = document.getElementById(movie.containerId);
    
            // Verifica se o filme possui o serviço de streaming selecionado
            if (movie.streamingServices.includes(selectedService)) {
                movieElement.style.display = 'block';
                anyFilterApplied = true; // Filtro foi aplicado
            } else {
                movieElement.style.display = 'none';
            }
        });
    
        // Mostrar ou esconder o botão de reset dependendo se algum filtro foi aplicado
        if (anyFilterApplied) {
            document.getElementById('resetar-filtro').style.display = 'block';
        } else {
            document.getElementById('resetar-filtro').style.display = 'none';
        }
    }
    

    function populateStreamingDropdown() {
        const dropdown = document.getElementById('dropdown-servico');
        const uniqueServices = [...new Set(loadedMovies.flatMap(movie => movie.streamingServices))]; // Remove duplicatas

        uniqueServices.forEach(service => {
            const li = document.createElement('li');
            li.className = 'option';
            li.textContent = service;
            li.addEventListener('click', () => {
                filterMoviesByStreaming(service);
            });
            dropdown.appendChild(li);
        });
    }

    // Função para preencher o dropdown de gêneros
    function populateGenreDropdown() {
        const dropdown = document.getElementById('dropdown-genero');
        const uniqueGenres = [...new Set(loadedMovies.flatMap(movie => movie.genres))]; // Remove duplicatas

        uniqueGenres.forEach(genre => {
            const li = document.createElement('li');
            li.className = 'option';
            li.textContent = genre;
            li.addEventListener('click', () => {
                filterMoviesByGenre(genre);
            });
            dropdown.appendChild(li);
        });
    }

    // Adiciona eventos de clique aos itens do dropdown de gênero
    document.querySelectorAll('#dropdown-genero .option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedGenre = option.textContent;
            filterMoviesByGenre(selectedGenre);
        });
    });

    // Adiciona eventos de clique aos itens do dropdown de década
    document.querySelectorAll('#dropdown-ano .option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedDecade = option.textContent; // Ex.: "1990s"
            filterMoviesByDecade(selectedDecade);
        });
    });

    // Adiciona eventos de clique aos itens do dropdown de faixa etária
    document.querySelectorAll('#dropdown-faixa-etaria .option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedRating = option.textContent.split(' ')[0]; // Pega apenas a parte numérica
            filterMoviesByRating(selectedRating);
        });
    });

    //RESETAR FILTRO
    document.getElementById('resetar-filtro').addEventListener('click', clearFilters);

    // Itera por todos os filmes e preenche as informações
    Promise.all(movies.map((movie) => getMovieDetails(movie.id, movie.containerId)))
        .then(() => {
            // Após todos os filmes serem carregados, popula o dropdown de streaming e gênero
            populateStreamingDropdown();
            populateGenreDropdown();
        });
});