// Função para capturar o ID do filme da URL
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // Agora retorna o valor do filmeId
}

const filmeDetalhesDiv = document.getElementById('filme-detalhes');

// Função para buscar detalhes do filme e plataformas de streaming
async function fetchFilmeDetalhes() {
    try {
        const filmeId = getMovieIdFromUrl();
        if (!filmeId) {
            filmeDetalhesDiv.innerHTML = `<p>Filme não encontrado.</p>`;
            return;
        }

        const response = await fetch(`/api/movie/${filmeId}`);
        const { movieDetails, providersData } = await response.json();

        const generos = movieDetails.genres.map(genre => genre.name).join(", ");
        const providersHTML = providersData.map(provider => `
            <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" class="provider-logo">
        `).join("");

        filmeDetalhesDiv.innerHTML = `
            <h1>${movieDetails.title}</h1>
            <img src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" alt="${movieDetails.title}">
            <p>${movieDetails.overview}</p>
            <p><strong>Data de lançamento:</strong> ${movieDetails.release_date}</p>
            <p><strong>Popularidade:</strong> ${movieDetails.popularity}</p>
            <p><strong>Avaliação:</strong> ${movieDetails.vote_average}</p>
            <p><strong>Gêneros:</strong> ${generos}</p>
            <div class="providers">
                <h3>Disponível em:</h3>
                ${providersHTML || "<p>Sem plataformas disponíveis no momento</p>"}
            </div>
        `;
    } catch (error) {
        console.error("Erro ao buscar detalhes do filme:", error);
        filmeDetalhesDiv.innerHTML = `<p>Erro ao carregar os detalhes do filme.</p>`;
    }
}
// Chamada inicial para carregar os detalhes do filme
fetchFilmeDetalhes();