
const logos = document.querySelectorAll('.provider-logo');

logos.forEach(logo => {
    logo.addEventListener('click', (event) => {
        const providerId = event.target.getAttribute('data-provider-id');
        filterMoviesByProvider(providerId);
    });
});
    
function setupClickEvents() {
    const logos = document.querySelectorAll('.provider-logo');
    logos.forEach(logo => {
        logo.addEventListener('click', (event) => {
            const providerId = event.target.getAttribute('data-provider-id');
            filterMoviesByProvider(providerId);
        });
    });
}

function filterMoviesByProvider(providerId) {
    fetch(`/api/movies?provider=${providerId}`)
        .then(response => response.json())
        .then(data => {
            // Renderize os filmes filtrados na tela
            renderMovies(data.results);
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
            <h3>${movie.title}</h3>
        `;
        movieContainer.appendChild(movieElement);
    });
}

fetch('/filmes-populares')
.then(response => response.json())
.then(filmes => {
    const filmesDiv = document.getElementById('filmes-populares');
    filmes.forEach(filme => {
        const filmeElement = document.createElement('div');
        filmeElement.classList.add('filme-card');
        filmeElement.innerHTML = `
        <h2 class = 'titulo'>${filme.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}" />
        <p>${filme.overview}</p>
        <p>${filme.popularity}<p>
    `;
        filmeElement.addEventListener('click', () => {
            window.location.href = `./filmes-detalhes.html?id=${filme.id}`;
        });
        filmesDiv.appendChild(filmeElement);
    });
})
.catch(error => {
    console.error('Erro ao carregar filmes: ', error);
});

fetch('/filmes-recentes')
.then(response => response.json())
.then(filmes => {
    const filmesDiv = document.getElementById('filmes-recentes');
    filmes.forEach(filme => {
        const filmeElement = document.createElement('div');
        filmeElement.classList.add('filme-card');
        filmeElement.innerHTML = `
    <h2>${filme.title}</h2>
    <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}" />
    <p>${filme.overview}</p> 
    `;
        filmeElement.addEventListener('click', () => {
            window.location.href = `./filmes-detalhes.html?id=${filme.id}`;
        });
        filmesDiv.appendChild(filmeElement);
    });
})
.catch(error => {
    console.error('Erro ao carregar filmes: ', error);
});

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
        setupClickEvents();
    })
    .catch(error => console.error('Erro ao carregar provedores:', error))