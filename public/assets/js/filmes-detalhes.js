 // Função para capturar o ID do filme da URL
 function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmeId = urlParams.get('id');
}

const filmeDetalhesDiv = document.getElementById('filme-detalhes');

// Função para buscar detalhes do filme e plataformas de streaming
async function fetchFilmeDetalhes() {
    try {
        // Faz a requisição dos detalhes do filme
        const API_KEY = process.env.API_KEY;

        const filmeId = getMovieIdFromUrl();

        const response = await fetch(`https://api.themoviedb.org/3/movie/${filmeId}?api_key=${API_KEY}&language=pt-BR`);
        const filme = await response.json();

        // Faz a requisição das plataformas de streaming
        const providersResponse = await fetch(`https://api.themoviedb.org/3/movie/${filmeId}/watch/providers?api_key=${API_KEY}`);
        const providersData = await providersResponse.json();
        
        // Verifica se há provedores de streaming no Brasil, por exemplo
        const providers = providersData.results.BR?.flatrate || [];

        // Gera HTML com detalhes do filme
        let generos = filme.genres.map(genre => genre.name).join(", ");
        let providersHTML = providers.map(provider => `
            <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" class="provider-logo">
        `).join("");

        filmeDetalhesDiv.innerHTML = `
            <h1>${filme.title}</h1>
            <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}">
            <p>${filme.overview}</p>
            <p>Data de lançamento: ${filme.release_date}</p>
            <p>Popularidade: ${filme.popularity}</p>
            <p>Avaliação: ${filme.vote_average}</p>
            <p>Gêneros: ${generos}</p>
            <div class="providers">
                <h3>Disponível em:</h3>
                ${providersHTML || "<p>Sem plataformas disponíveis no momento</p>"}
            </div>
        `;
    } catch (error) {
        console.error("Erro ao buscar detalhes do filme ou provedores de streaming:", error);
    }
}

// Exemplo de chamada da função com o ID do filme
fetchFilmeDetalhes();