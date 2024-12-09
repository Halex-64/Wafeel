function getMediaTypeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'tv'; // Define o tipo como 'tv' por padrão para séries
    console.log("Tipo capturado da URL:", type);
    return type;
}

function getSerieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Obter o ID
    console.log("ID capturado da URL:", id);
    return id;
}

async function fetchSerieDetalhes() {
    const serieDetalhesDiv = document.getElementById('serie-detalhes');
    try {
        const mediaId = getSerieIdFromUrl();
        const mediaType = getMediaTypeFromUrl();

        if (!mediaId || !mediaType) {
            console.error("ID ou tipo ausente:", { mediaId, mediaType });
            serieDetalhesDiv.innerHTML = `<p>Mídia não encontrada.</p>`;
            return;
        }

        console.log(`Buscando detalhes para ${mediaType} com ID: ${mediaId}`);

        const response = await fetch(`/api/media/${mediaType}/${mediaId}`);
        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            serieDetalhesDiv.innerHTML = `<p>Erro ao buscar os detalhes da mídia.</p>`;
            return;
        }

        const { mediaDetails, providersData } = await response.json();
        console.log("Detalhes da mídia recebidos:", mediaDetails);

        if (!mediaDetails) {
            serieDetalhesDiv.innerHTML = `<p>Detalhes da mídia indisponíveis.</p>`;
            return;
        }

        const mediaTitle = mediaDetails.title || mediaDetails.name || 'Título indisponível';
        document.title = `Detalhes de ${mediaTitle}`;
        const backdropPath = mediaDetails.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${mediaDetails.backdrop_path}`
            : './placeholder.jpg';

        const generos = (mediaDetails.genres || []).map(genre => genre.name).join(", ");
        const providersHTML = (providersData || []).map(provider => `
            <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" class="provider-logo">
        `).join("");

        serieDetalhesDiv.innerHTML = `
            <h1>${mediaTitle}</h1>
            <img src="${backdropPath}" alt="${mediaTitle}">
            <p>${mediaDetails.overview || 'Descrição indisponível.'}</p>
            <p><strong>Data de estreia:</strong> ${mediaDetails.first_air_date || 'Indisponível'}</p>
            <p><strong>Popularidade:</strong> ${mediaDetails.popularity || 'Interações indisponíveis'} Interações</p>
            <p><strong>Avaliação:</strong> ${mediaDetails.vote_average || 'Indisponível'}/10</p>
            <p><strong>Gêneros:</strong> ${generos || 'Indisponível'}</p>
            <h3 class='providers-title'>Disponível em:</h3>
            <div class="providers">
                ${providersHTML || "<p>Sem plataformas disponíveis no momento</p>"}
            </div>
        `;

        const favoritarBtn = document.getElementById('favoritar-btn');
        favoritarBtn.addEventListener('click', () => toggleFavorito(mediaDetails));

        atualizarBotaoFavorito(mediaDetails.id);
    } catch (error) {
        console.error("Erro ao buscar detalhes da mídia:", error);
        serieDetalhesDiv.innerHTML = `<p>Erro ao carregar os detalhes da mídia.</p>`;
    }
}

fetchSerieDetalhes();

async function toggleFavorito(serie) {
    try {
        const response = await fetch('/auth/favoritos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: serie.id,
                title: serie.title || serie.name,
                poster_path: serie.poster_path,
                media_type: 'tv',
            }),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const serieId = getSerieIdFromUrl();
    const serieDetalhes = fetchSerieDetalhes(serieId);

    atualizarBotaoFavorito(serieId);

    const favoritarBtn = document.getElementById('favoritar-btn');
    favoritarBtn.addEventListener('click', () => toggleFavorito(serieDetalhes));
});

function atualizarBotaoFavorito(serieId) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const isFavorito = favoritos.some(item => item.id === serieId);
    const favoritarBtn = document.getElementById('favoritar-btn');

    if (isFavorito) {
        favoritarBtn.textContent = 'Remover dos Favoritos';
    } else {
        favoritarBtn.textContent = 'Adicionar aos Favoritos';
    }
}
