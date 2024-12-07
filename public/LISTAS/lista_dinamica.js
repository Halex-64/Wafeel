// Função para resetar os filtros
function clearFilters() {
    const movieCards = document.querySelectorAll('.resumo_filme');
    movieCards.forEach(card => card.style.display = 'block');

    const resetButton = document.getElementById('resetar-filtro');
    if (resetButton) resetButton.style.display = 'none';
}

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

    // Exibir no console os dados de filmes
    console.log(movies);

    // Define o título da lista
    const tituloListaElement = document.getElementById('titulo_lista');
    if (listName) {
        tituloListaElement.textContent = listName;
    }

    const containerFilmes = document.querySelector('.container_filmes');
    if (!containerFilmes) {
        console.error('O contêiner de filmes não foi encontrado.');
        return;
    }

    // Função para buscar a classificação indicativa do filme
    async function getMovieRating(movieId) {
        const ratingUrl = `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${apiKey}`;
        try {
            const response = await fetch(ratingUrl);
            const data = await response.json();

            const brazilCertification = data.results.find(entry => entry.iso_3166_1 === 'BR');
            const usCertification = data.results.find(entry => entry.iso_3166_1 === 'US');

            if (brazilCertification && brazilCertification.release_dates.length > 0) {
                return brazilCertification.release_dates[0].certification || 'Indefinido';
            } else if (usCertification && usCertification.release_dates.length > 0) {
                return usCertification.release_dates[0].certification || 'Indefinido';
            } else {
                return 'Indefinido';
            }
        } catch (error) {
            console.error(`Erro ao buscar classificação indicativa do filme com ID ${movieId}:`, error);
            return 'Indefinido';
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

    // Função para buscar detalhes do filme ou série
    async function getMovieDetails(movie) {
        let movieUrl;
        let additionalInfo = '';
        let duration = '';
        let servicesList = [];
    
        if (movie.type === 'movie') {
            movieUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=pt-BR`;
        } else if (movie.type === 'tv') {
            movieUrl = `https://api.themoviedb.org/3/tv/${movie.id}?api_key=${apiKey}&language=pt-BR`;
        } else {
            console.error('Tipo de item desconhecido');
            return;
        }
    
        try {
            const response = await fetch(movieUrl);
            const movieData = await response.json();
            const rating = await getMovieRating(movie.id);
            const services = await getStreamingServices(movie.id);
            servicesList = services.map(service => service.id);
    
            if (movie.type === 'tv') {
                additionalInfo = `Temporadas: ${movieData.number_of_seasons || 'Indefinido'}`;
                duration = '';
            } else {
                duration = `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}min`;
            }
    
            const releaseYear = new Date(movieData.release_date || movieData.first_air_date)?.getFullYear() || 'Ano não disponível';
            let sinopse = movieData.overview || 'Sinopse não disponível';
            const sinopseDisplay = sinopse.length > 125 ? `${sinopse.slice(0, 125)}...` : sinopse;
            const leiaMais = sinopse.length > 125 ? `<a style="color:#ccc; cursor: pointer;" onclick="showFullSynopsis('${movie.id}')">Leia mais</a>` : '';
    
            const movieCard = document.createElement('div');
            movieCard.className = 'resumo_filme';
            movieCard.setAttribute('data-genres', movieData.genres.map(genre => genre.id).join(','));
            movieCard.setAttribute('data-services', servicesList.join(','));
            movieCard.setAttribute('data-release-year', new Date(movieData.release_date || movieData.first_air_date)?.getFullYear() || '');
            movieCard.setAttribute('data-rating', rating || '');
            movieCard.innerHTML = `
                <div class="resumo_filme_imagem" style="background-image: url('https://image.tmdb.org/t/p/w500${movieData.backdrop_path || ''}');">
                    <div class="titulo_genero">
                        <li id="titulo_filme">${movieData.title || movieData.name || 'Título não disponível'}</li>
                        <ul id="genero_filme">
                            <li>${movieData.genres?.map(genre => genre.name).slice(0, 2).join(' • ') || 'Gêneros não disponíveis'}</li>
                        </ul>
                    </div>
                    <div class="novo_texto">
                        <li id="sinopse_filme_${movie.id}" data-full-synopsis="${sinopse}" data-truncated-synopsis="${sinopseDisplay}">${sinopseDisplay} ${leiaMais}</li>
                        <ul id="informacoes_filme">
                            <li id="informacoes">${[releaseYear, duration, additionalInfo, rating].filter(Boolean).join(' • ')}</li>
                        </ul>
                    </div>
                </div>
            `;
            containerFilmes.appendChild(movieCard);
            const titleElement = movieCard.querySelector('#titulo_filme');
            adjustTitleFontSize(titleElement);
    
        } catch (error) {
            console.error(`Erro ao buscar dados do filme com ID ${movie.id}:`, error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'erro_filme';
            errorMessage.textContent = 'Ocorreu um erro ao buscar os detalhes do filme. Por favor, tente novamente mais tarde.';
            containerFilmes.appendChild(errorMessage);
        }
    }    

    // Função para exibir a sinopse completa 
    function showFullSynopsis(movieId) { 
        const sinopseElement = document.getElementById(`sinopse_filme_${movieId}`); 
        if (sinopseElement) { 
            const fullSynopsis = sinopseElement.dataset.fullSynopsis; 
            sinopseElement.innerHTML = `${fullSynopsis} <a style="color:#ccc; cursor: pointer;" onclick="hideFullSynopsis('${movieId}')">Mostrar menos</a>`; 
            sinopseElement.style.maxHeight = '111px';   
            sinopseElement.classList.add('sinopse-scroll');  
            }
    }

    // Função para ocultar a sinopse completa 
    function hideFullSynopsis(movieId) { 
        const sinopseElement = document.getElementById(`sinopse_filme_${movieId}`); 
        if (sinopseElement) { 
            const truncatedSynopsis = sinopseElement.dataset.truncatedSynopsis; 
            sinopseElement.innerHTML = `${truncatedSynopsis} <a style="color:#ccc; cursor: pointer;" onclick="showFullSynopsis('${movieId}')">Leia mais</a>`; 
            sinopseElement.style.maxHeight = '';  
            sinopseElement.classList.remove('sinopse-scroll');  
        } 
    }

    // Função para obter gêneros da API TMDb
    async function getGenres() {
        const genresUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=pt-BR`;
        try {
            const response = await fetch(genresUrl);
            const data = await response.json();
            console.log("Gêneros recebidos: ", data.genres);
            return data.genres || [];
        } catch (error) {
            console.error('Erro ao buscar gêneros:', error);
            return [];
        }
    }

    // Função para popular a barra de filtro de gêneros
    async function populateGenreFilter() {
        const genres = await getGenres();
        const dropdownGenero = document.getElementById('dropdown-genero');

        if (!dropdownGenero) {
            console.error('Dropdown de gêneros não encontrado.');
            return;
        }

        console.log("Gêneros carregados: ", genres);

        dropdownGenero.innerHTML = '';

        genres.forEach(genre => {
            const genreOption = document.createElement('li');
            genreOption.className = 'option';
            genreOption.textContent = genre.name;
            genreOption.dataset.genreId = genre.id;
            genreOption.onclick = () => filterByGenre(genre.id);
            dropdownGenero.appendChild(genreOption);
        });
    }

    // Função para filtrar filmes/séries pelo gênero
    function filterByGenre(genreId) {
        const movieCards = document.querySelectorAll('.resumo_filme');
        movieCards.forEach(card => {
            const genres = card.dataset.genres ? card.dataset.genres.split(',') : [];
            if (genres.includes(String(genreId))) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        const resetButton = document.getElementById('resetar-filtro');
        if (resetButton) resetButton.style.display = 'block';
    }

    // Função para filtrar filmes/séries por década
    function filterByDecade(decade) {
        const movieCards = document.querySelectorAll('.resumo_filme');
        movieCards.forEach(card => {
            const releaseYear = card.dataset.releaseYear ? parseInt(card.dataset.releaseYear) : null;
            if (releaseYear && Math.floor(releaseYear / 10) === Math.floor(decade / 10)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        const resetButton = document.getElementById('resetar-filtro');
        if (resetButton) resetButton.style.display = 'block';
    }

    // Função para filtrar filmes/séries por classificação indicativa
    function filterByRating(rating) {
        const movieCards = document.querySelectorAll('.resumo_filme');
        movieCards.forEach(card => {
            const cardRating = card.dataset.rating || '';
            if (cardRating === rating) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        const resetButton = document.getElementById('resetar-filtro');
        if (resetButton) resetButton.style.display = 'block';
    }

    // Função para obter serviços de streaming da API TMDb
    async function getStreamingServices(movieId) {
        const streamingUrl = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}&language=pt-BR`;

        try {
            const response = await fetch(streamingUrl);
            const data = await response.json();

            // Adiciona um log para depuração
            console.log('Dados retornados:', data);

            // Verifica se a resposta contém a chave 'results'
            if (data.results) {
                // Verifica se a chave 'BR' existe e contém o array 'flatrate'
                const providers = data.results['BR']?.flatrate || []; // Pega os provedores de streaming no Brasil
                if (providers.length > 0) {
                    console.log('Provedores de streaming encontrados:', providers);
                    return providers.map(provider => ({
                        id: provider.provider_id,
                        name: provider.provider_name,
                        logo: provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : null  // URL para o logo do provedor
                    }));
                } else {
                    console.error('Nenhum provedor de streaming encontrado para o Brasil.');
                    return [];
                }
            } else {
                console.error('A chave "results" não foi encontrada na resposta da API.');
                return [];
            }
        } catch (error) {
            console.error('Erro ao buscar serviços de streaming:', error);
            return [];
        }
    }

    // Função para popular a barra de filtro de SERVIÇOS
    async function populateServiceFilter() {
        // Verifica se há filmes na lista
        if (!movies || movies.length === 0) {
            console.error('Nenhum filme disponível na lista.');
            return;
        }

        // Cria um conjunto para evitar duplicação de serviços
        const servicesSet = new Set();

        // Itera sobre os filmes na lista
        for (const movie of movies) {
            const services = await getStreamingServices(movie.id);  // Obtém os serviços de streaming para o filme

            services.forEach(service => {
                if (service.name && service.id) { // Verifica se o serviço possui os campos esperados
                    // Adiciona ao Set de forma única, armazenando o nome e id de cada serviço
                    servicesSet.add(JSON.stringify({ id: service.id, name: service.name }));  
                }
            });
        }

        // Converte o conjunto de serviços de volta para uma lista e parse os objetos JSON
        const servicesList = Array.from(servicesSet).map(service => JSON.parse(service));

        const dropdownServico = document.getElementById('dropdown-servico');
        if (!dropdownServico) {
            console.error('Dropdown de serviço não encontrado.');
            return;
        }

        dropdownServico.innerHTML = '';  // Limpa o dropdown antes de adicionar as opções

        // Popula o dropdown com os serviços únicos
        servicesList.forEach(service => {
            const serviceOption = document.createElement('li');
            serviceOption.className = 'option';
            serviceOption.textContent = service.name;
            serviceOption.dataset.serviced = service.id;
            serviceOption.onclick = () => filterByService(service.id);
            dropdownServico.appendChild(serviceOption);
        });
    }

    // Função para filtrar filmes/séries pelo serviço de streaming
    function filterByService(serviceId) {
        const movieCards = document.querySelectorAll('.resumo_filme');
        
        movieCards.forEach(card => {
            // Obtém a lista de serviços associados ao filme (armazenada no dataset)
            const services = card.dataset.services ? card.dataset.services.split(',') : [];

            // Verifica se o filme está disponível no serviço selecionado
            if (services.includes(String(serviceId))) {
                card.style.display = 'block';  // Exibe o cartão do filme
            } else {
                card.style.display = 'none';  // Oculta o cartão do filme
            }
        });

        // Exibe o botão de resetar o filtro
        const resetButton = document.getElementById('resetar-filtro');
        if (resetButton) resetButton.style.display = 'block';
    } 

    // Inicialização
    populateGenreFilter();
    window.showFullSynopsis = showFullSynopsis;
    window.hideFullSynopsis = hideFullSynopsis; 
    window.filterByDecade = filterByDecade;
    window.filterByRating = filterByRating;
    movies.forEach(movie => populateServiceFilter(movie.id));
    movies.forEach(movie => getMovieDetails(movie));
});