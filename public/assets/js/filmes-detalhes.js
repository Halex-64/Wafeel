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

// Função para pegar a classificação indicativa (rating) usando a API TMDB
async function fetchRating() {
    const mediaId = getFilmeIdFromURL();
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Insira sua chave da API do TMDB aqui

    if (!mediaId) {
        console.error("ID do filme ausente:", mediaId);
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${mediaId}/release_dates?api_key=${apiKey}`);

        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Dados de lançamento recebidos:", data);

        const releases = data.results || [];
        const brazilRelease = releases.find(release => release.iso_3166_1 === 'BR');
        const rating = brazilRelease ? (brazilRelease.release_dates[0] ? brazilRelease.release_dates[0].certification : 'Indisponível') : 'Indisponível';

        console.log("Classificação indicativa:", rating);
        document.getElementById('id_classificacao').textContent = rating || 'Indefinido';

    } catch (error) {
        console.error("Erro ao buscar a classificação indicativa:", error);
    }
}

async function fetchPopularidade() {
    const mediaId = getFilmeIdFromURL();
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Insira sua chave da API do TMDB aqui

    if (!mediaId) {
        console.error("ID do filme ausente:", mediaId);
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${mediaId}?api_key=${apiKey}`);

        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Dados do filme recebidos:", data);

        const popularidade = data.popularity || 'Indisponível';

        console.log("Popularidade do filme:", popularidade);
        document.getElementById('id_popularidade').textContent = popularidade;

    } catch (error) {
        console.error("Erro ao buscar a popularidade do filme:", error);
    }
}

async function fetchDiretor() {
    const mediaId = getFilmeIdFromURL();
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Insira sua chave da API do TMDB aqui

    if (!mediaId) {
        console.error("ID do filme ausente:", mediaId);
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${mediaId}/credits?api_key=${apiKey}`);

        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Dados dos créditos do filme recebidos:", data);

        const diretor = data.crew.find(crewMember => crewMember.job === 'Director')?.name || 'Indisponível';

        console.log("Diretor do filme:", diretor);
        document.getElementById('id_realizador').textContent = diretor;

    } catch (error) {
        console.error("Erro ao buscar o diretor do filme:", error);
    }
}

async function fetchTrailer() {
    const mediaId = getFilmeIdFromURL();
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Insira sua chave da API do TMDB aqui

    if (!mediaId) {
        console.error("ID do filme ausente:", mediaId);
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${mediaId}/videos?api_key=${apiKey}`);

        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Dados dos vídeos do filme recebidos:", data);

        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

        if (trailer) {
            const trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
            const trailerIframe = document.getElementById('trailer_titulo');
            trailerIframe.src = trailerUrl;
            console.log("URL do trailer do filme:", trailerUrl);
        } else {
            console.log("Trailer indisponível");
            document.getElementById('trailer_titulo').textContent = 'Trailer indisponível';
        }

    } catch (error) {
        console.error("Erro ao buscar o trailer do filme:", error);
    }
}

function formatarDuracao(duracaoEmMinutos) {
    if (!duracaoEmMinutos) return 'Indisponível';
    const horas = Math.floor(duracaoEmMinutos / 60);
    const minutos = duracaoEmMinutos % 60;
    return `${horas}h ${minutos}min`;
}

async function fetchFilmeDetalhes() {
    const filmeDetalhesDiv = document.querySelector('.right_bar .informacoes_sinopse');
    try {
        const mediaId = getFilmeIdFromURL();
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
        console.log("Título do Filme:", mediaTitle);
        console.log("Sinopse do Filme:", mediaDetails.overview);

        document.title = `Detalhes de ${mediaTitle}`;
        const posterPath = mediaDetails.poster_path ? `https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}` : './placeholder.jpg';
        const backdropPath = mediaDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${mediaDetails.backdrop_path}` : './placeholder.jpg';

        const generos = (mediaDetails.genres || []).map(genre => genre.name).join(", ");
        const providersHTML = (providersData || []).map(provider => `
    <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" class="provider-logo">
    `).join("");

        // Atualizar o HTML com os detalhes da mídia
        document.getElementById('id_poster_filme').src = posterPath;
        document.getElementById('titulo_filme').textContent = mediaTitle;
        document.getElementById('ano_lancamento').textContent = mediaDetails.release_date ? `(${mediaDetails.release_date.split('-')[0]})` : '(Indisponível)';
        document.getElementById('sinopse_titulo').textContent = mediaDetails.overview || 'Descrição indisponível.';
        document.getElementById('id_generos').textContent = generos || 'Indisponível';
        document.getElementById('id_duracao').textContent = formatarDuracao(mediaDetails.runtime);
        document.getElementById('id_pais_origem').textContent = mediaDetails.origin_country || 'Indisponível';
        document.querySelector('.streamins_titulo').innerHTML = providersHTML || "<p>Sem plataformas disponíveis no momento</p>";

        const favoritarBtn = document.getElementById('favoritar-btn');
        favoritarBtn.addEventListener('click', () => toggleFavorito(mediaDetails));

    } catch (error) {
        console.error("Erro ao buscar detalhes da mídia:", error);
    }

}

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

document.addEventListener('DOMContentLoaded', () => {
    const filmeId = getFilmeIdFromURL();
    fetchFilmeDetalhes();
    fetchRating();
    fetchPopularidade();
    fetchDiretor();
    fetchTrailer();
    atualizarBotaoFavorito(filmeId);
    const favoritarBtn = document.getElementById('favoritar-btn');
    favoritarBtn.addEventListener('click', () => toggleFavorito(filmeId));
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