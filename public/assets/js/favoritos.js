// Função para carregar os favoritos salvos
function carregarFavoritos() {
    const favoritosFilmesDiv = document.getElementById('favoritos-filmes');
    const favoritosSeriesDiv = document.getElementById('favoritos-series');

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Separa os filmes e séries
    const filmes = favoritos.filter(item => item.media_type === 'movie');
    const series = favoritos.filter(item => item.media_type === 'tv');

    // Exibe os filmes
    if (filmes.length > 0) {
        filmes.forEach(filme => {
            const img = document.createElement('img');
            img.src = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
            img.alt = filme.title || filme.name;
            img.title = filme.title || filme.name;
            img.addEventListener('click', () => {
                window.location.href = `./filmes-detalhes.html?id=${filme.id}&type=movie`;
            });
            favoritosFilmesDiv.appendChild(img);
        });
    } else {
        favoritosFilmesDiv.innerHTML = `<p>Nenhum filme favorito adicionado.</p>`;
    }

    // Exibe as séries
    if (series.length > 0) {
        series.forEach(serie => {
            const img = document.createElement('img');
            img.src = `https://image.tmdb.org/t/p/w500${serie.poster_path}`;
            img.alt = serie.title || serie.name;
            img.title = serie.title || serie.name;
            img.addEventListener('click', () => {
                window.location.href = `./filmes-detalhes.html?id=${serie.id}&type=tv`;
            });
            favoritosSeriesDiv.appendChild(img);
        });
    } else {
        favoritosSeriesDiv.innerHTML = `<p>Nenhuma série favorita adicionada.</p>`;
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', carregarFavoritos);

function toggleFavorito(filme) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const isFavorito = favoritos.some(item => item.id === filme.id);

    if (isFavorito) {
        const novosFavoritos = favoritos.filter(item => item.id !== filme.id);
        localStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
        alert('Removido dos favoritos.');
    } else {
        favoritos.push(filme);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        alert('Adicionado aos favoritos!');
    }
}
