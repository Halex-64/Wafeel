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
    fetch(`/api/movies?provider=${providerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.results)) {
                renderMovies(data.results);
            } else {
                console.error('Estrutura de dados inesperada:', data);
            }
        })
        .catch(error => console.error('Erro ao filtrar filmes:', error));
}

function renderMovies(movies) {
    const movieContainer = document.getElementById('movie-container');
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
    const defaultProvider = '8'; // Substitua pelo ID de um provedor padrão

    // Atualização para incluir o parâmetro `plataforma`
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

    // Código para carregar filmes recentes permanece inalterado
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

// Carregamento das logos dos provedores e configuração dos eventos
fetch('/api/providers')
    .then(response => response.json())
    .then(providers => {
        const sidebar = document.getElementById('sidebar');
        providers.forEach(provider => {
            const logoElement = document.createElement('img');
            logoElement.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
            logoElement.alt = provider.provider_name;
            logoElement.classList.add('provider-logo');
            logoElement.setAttribute('data-provider-id', provider.provider_id);
            sidebar.appendChild(logoElement);
        });
        setupClickEvents(); // Configura os eventos de clique após adicionar as logos
    })
    .catch(error => console.error('Erro ao carregar provedores:', error));
loadInitialMovies();
