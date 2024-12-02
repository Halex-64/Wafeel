function getMediaTypeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'movie'; // Obter o tipo
    console.log("Tipo capturado da URL:", type); // Log para depuração
    return type;
}

function getFilmeIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Obter o ID
    console.log("ID capturado da URL:", id); // Log para depuração
    return id;
}

async function fetchFilmeDetalhes() {
    const filmeDetalhesDiv = document.getElementById('filme-detalhes');
    try {
        const mediaId = getMovieIdFromUrl();
        const mediaType = getMediaTypeFromUrl();

        if (!mediaId || !mediaType) {
            console.error("ID ou tipo ausente:", { mediaId, mediaType });
            filmeDetalhesDiv.innerHTML = `<p>Mídia não encontrada.</p>`;
            return;
        }

        console.log(`Buscando detalhes para ${mediaType} com ID: ${mediaId}`);

        const response = await fetch(`/api/media/${mediaType}/${mediaId}`);
        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            filmeDetalhesDiv.innerHTML = `<p>Erro ao buscar os detalhes da mídia.</p>`;
            return;
        }

        const { mediaDetails, providersData } = await response.json();
        console.log("Detalhes da mídia recebidos:", mediaDetails);

        if (!mediaDetails) {
            filmeDetalhesDiv.innerHTML = `<p>Detalhes da mídia indisponíveis.</p>`;
            return;
        }

        const mediaTitle = mediaDetails.title || mediaDetails.name || 'Título indisponível';
        document.title = `Detalhes de ${mediaTitle}`
        const posterPath = mediaDetails.poster_path
            ? `https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}`
            : './placeholder.jpg';

        const generos = (mediaDetails.genres || []).map(genre => genre.name).join(", ");
        const providersHTML = (providersData || []).map(provider => `
            <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" class="provider-logo">
        `).join("");

        filmeDetalhesDiv.innerHTML = `
            <h1>${mediaTitle}</h1>
            <img src="${posterPath}" alt="${mediaTitle}">
            <p>${mediaDetails.overview || 'Descrição indisponível.'}</p>
            <p><strong>Data de lançamento:</strong> ${mediaDetails.release_date || mediaDetails.first_air_date || 'Indisponível'}</p>
            <p><strong>Popularidade:</strong> ${mediaDetails.popularity || 'Indisponível'}</p>
            <p><strong>Avaliação:</strong> ${mediaDetails.vote_average || 'Indisponível'}/10</p>
            <p><strong>Gêneros:</strong> ${generos || 'Indisponível'}</p>
            <div class="providers">
                <h3>Disponível em:</h3>
                ${providersHTML || "<p>Sem plataformas disponíveis no momento</p>"}
            </div>
        `;

        const favoritarBtn = document.getElementById('favoritar-btn');
        favoritarBtn.addEventListener('click', () => toggleFavorito(mediaDetails));

        atualizarBotaoFavorito(mediaDetails.id);
    } catch (error) {
        console.error("Erro ao buscar detalhes da mídia:", error);
        filmeDetalhesDiv.innerHTML = `<p>Erro ao carregar os detalhes da mídia.</p>`;
    }
}
fetchFilmeDetalhes()

async function toggleFavorito(filme) {
    try {
        const response = await fetch('/auth/favoritos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: filme.id,
                title: filme.title || filme.name,
                poster_path: filme.poster_path,
                media_type: filme.media_type || 'movie',
            }),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error);
    }
}

// Quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const filmeId = getFilmeIdFromURL(); // Função para obter o ID do filme da URL
    const filmeDetalhes = getFilmeDetalhes(filmeId); // Função para obter detalhes do filme

    // Atualiza o botão de favoritar com base nos favoritos
    atualizarBotaoFavorito(filmeId);

    // Adiciona o evento de clique ao botão
    const favoritarBtn = document.getElementById('favoritar-btn');
    favoritarBtn.addEventListener('click', () => toggleFavorito(filmeDetalhes));
});

function atualizarBotaoFavorito(filmeId) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const isFavorito = favoritos.some(item => item.id === filmeId);
    const favoritarBtn = document.getElementById('favoritar-btn');

    if (isFavorito) {
        favoritarBtn.textContent = 'Remover dos Favoritos';
    } else {
        favoritarBtn.textContent = 'Adicionar aos Favoritos';
    }
}



