function getMediaTypeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('type'); // Retorna "movie" ou "tv"
}
async function fetchMediaDetalhes() {
    try {
        const { id, type } = getMediaInfoFromUrl();
        if (!id || !['movie', 'tv'].includes(type)) {
            mediaDetalhesDiv.innerHTML = `<p>Mídia inválida ou não encontrada.</p>`;
            return;
        }

        // Faz a requisição para obter os detalhes da mídia
        const response = await fetch(`/api/media/${type}/${id}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar mídia: ${response.statusText}`);
        }

        const { mediaDetails, providersData } = await response.json();

        // Renderiza os detalhes da mídia
        const title = mediaDetails.title || mediaDetails.name;
        const releaseDate = mediaDetails.release_date || mediaDetails.first_air_date;
        const generos = mediaDetails.genres.map(genre => genre.name).join(", ");
        const providersHTML = providersData.map(provider => `
            <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" class="provider-logo">
        `).join("");

        mediaDetalhesDiv.innerHTML = `
            <h1>${title}</h1>
            <img src="https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}" alt="${title}">
            <p>${mediaDetails.overview}</p>
            <p><strong>Data de lançamento:</strong> ${releaseDate}</p>
            <p><strong>Popularidade:</strong> ${mediaDetails.popularity}</p>
            <p><strong>Avaliação:</strong> ${mediaDetails.vote_average}</p>
            <p><strong>Gêneros:</strong> ${generos}</p>
            <div class="providers">
                <h3>Disponível em:</h3>
                ${providersHTML || "<p>Sem plataformas disponíveis no momento</p>"}
            </div>
        `;
    } catch (error) {
        console.error("Erro ao buscar detalhes da mídia:", error);
        mediaDetalhesDiv.innerHTML = `<p>Erro ao carregar os detalhes da mídia.</p>`;
    }
}
