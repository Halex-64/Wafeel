// Lista de IDs dos provedores específicos
const selectedProviderIds = [337, 8, 119, 1899, 307, 283]; // Disney+, Netflix, Prime Video, Max, Globoplay, Crunchyroll

// Função para configurar eventos nos logos
function setupClickEvents() {
    const logos = document.querySelectorAll('.provider-logo');
    logos.forEach(logo => {
        logo.addEventListener('click', (event) => {
            const providerId = event.target.getAttribute('data-provider-id');
            filterMoviesByProvider(providerId);
        });
    });
}

// Função para filtrar filmes por provedor
function filterMoviesByProvider(providerId) {
    // Filtrar filmes populares
    fetch(`/api/movies?provider=${providerId}&type=popular`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.results)) {
                renderMovies(data.results, 'movie-container'); // Renderiza no container de filmes populares
            } else {
                console.error('Estrutura de dados inesperada para filmes populares:', data);
            }
        })
        .catch(error => console.error('Erro ao filtrar filmes populares:', error));

    // Filtrar filmes recentes
    fetch(`/api/movies?provider=${providerId}&type=recent`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.results)) {
                renderMovies(data.results, 'filmes-recentes'); // Renderiza no container de filmes recentes
            } else {
                console.error('Estrutura de dados inesperada para filmes recentes:', data);
            }
        })
        .catch(error => console.error('Erro ao filtrar filmes recentes:', error));
}

function renderMovies(movies) {
    const movieContainer = document.getElementById('movie-container');
    if (!movieContainer) {
        console.error("Elemento 'movie-container' não encontrado no DOM.");
        return;
    }
    movieContainer.innerHTML = ''; // Limpa os filmes atuais
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        `;
        movieElement.addEventListener('click', () => {
            window.location.href = `./filmes-detalhes.html?id=${movie.id}`;
        });
        movieContainer.appendChild(movieElement);
    });
}

// Carregamento inicial dos filmes populares e recentes
function loadInitialMovies() {
    const defaultProvider = '8'; // Netflix como padrão
    fetch(`/filmes-populares?plataforma=${defaultProvider}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(filmes => {
            if (Array.isArray(filmes)) {
                renderMovies(filmes);
            } else {
                console.error('Estrutura inesperada para filmes populares:', filmes);
            }
        })
        .catch(error => console.error('Erro ao carregar filmes populares:', error));

    fetch('/filmes-recentes')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(filmes => {
            if (Array.isArray(filmes)) {
                const filmesDiv = document.getElementById('filmes-recentes');
                filmesDiv.innerHTML = ''; // Limpa o conteúdo anterior
                filmes.forEach(filme => {
                    const filmeElement = document.createElement('div');
                    filmeElement.classList.add('movie-item');
                    filmeElement.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}" />
                    `;
                    filmeElement.addEventListener('click', () => {
                        window.location.href = `./filmes-detalhes.html?id=${filme.id}`;
                    });
                    filmesDiv.appendChild(filmeElement);
                });
            } else {
                console.error('Estrutura inesperada para filmes recentes:', filmes);
            }
        })
        .catch(error => console.error('Erro ao carregar filmes recentes:', error));
}

function loadProviders() {
    fetch('/api/providers') // Endpoint para carregar provedores
        .then(response => {
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            return response.json();
        })
        .then(providers => {

            const filteredProviders = providers.filter(provider =>
                selectedProviderIds.includes(provider.provider_id)
            );

            const sidebar = document.getElementById('sidebar');
            sidebar.innerHTML = '';

            filteredProviders.forEach(provider => {
                const logoElement = document.createElement('img');
                logoElement.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
                logoElement.alt = provider.provider_name;
                logoElement.classList.add('provider-logo');
                logoElement.setAttribute('data-provider-id', provider.provider_id);
                sidebar.appendChild(logoElement);
            });

            setupClickEvents();
        })
        .catch(error => console.error('Erro ao carregar provedores:', error));
}

loadProviders();
loadInitialMovies();
