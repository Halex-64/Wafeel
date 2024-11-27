// Função para carregar os favoritos salvos
function carregarFavoritos() {
    const favoritosFilmesDiv = document.getElementById('favoritos-filmes');
    const favoritosSeriesDiv = document.getElementById('favoritos-series');

    // Recupera os favoritos do localStorage
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Separa os favoritos em filmes e séries
    const filmes = favoritos.filter(item => item.media_type === 'movie');
    const series = favoritos.filter(item => item.media_type === 'tv');

    // Exibe os filmes
    if (filmes.length > 0) {
        filmes.forEach(filme => {
            const img = document.createElement('img');
            img.src = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
            img.alt = filme.title || filme.name;
            img.title = filme.title || filme.name;

            // Redireciona para a página de detalhes ao clicar
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

            // Redireciona para a página de detalhes ao clicar
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

// Função para adicionar ou remover favoritos
function toggleFavorito(filme) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const isFavorito = favoritos.some(item => item.id === filme.id);

    if (isFavorito) {
        // Remove o filme da lista de favoritos
        const novosFavoritos = favoritos.filter(item => item.id !== filme.id);
        localStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
        alert('Removido dos favoritos.');
    } else {
        // Adiciona o filme à lista de favoritos
        favoritos.push(filme);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        alert('Adicionado aos favoritos!');
    }
}
