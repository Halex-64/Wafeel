    // Função para carregar os favoritos salvos
async function carregarFavoritos() {
    try {
        const response = await fetch('/auth/favoritos');
        if (!response.ok) {
            throw new Error('Falha ao carregar favoritos. Certifique-se de estar logado.');
        }

        const favoritos = await response.json();
        const favoritosFilmesDiv = document.getElementById('favoritos-filmes');
        const favoritosSeriesDiv = document.getElementById('favoritos-series');

        const filmes = favoritos.filter(item => item.media_type === 'movie');
        const series = favoritos.filter(item => item.media_type === 'tv');

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
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
    }
}

// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', carregarFavoritos);

// Função para adicionar ou remover favoritos
function toggleFavorito(filme) {
    // Obtém o e-mail do usuário logado
    const email = localStorage.getItem('usuarioLogado');

    if (!email) {
        alert('Você precisa estar logado para favoritar filmes.');
        return;
    }

    // Obtém os dados de favoritos do Local Storage
    const allFavoritos = JSON.parse(localStorage.getItem('favoritos')) || {};

    // Pega a lista de favoritos do usuário logado ou inicializa como array vazio
    const favoritosUsuario = allFavoritos[email] || [];

    // Verifica se o filme já está nos favoritos
    const isFavorito = favoritosUsuario.some(item => item.id === filme.id);

    if (isFavorito) {
        // Remove dos favoritos
        const novosFavoritos = favoritosUsuario.filter(item => item.id !== filme.id);
        allFavoritos[email] = novosFavoritos;
        alert('Filme removido dos favoritos!');
    } else {
        // Adiciona aos favoritos
        const novoFavorito = {
            id: filme.id,
            title: filme.title || filme.name,
            poster_path: filme.poster_path,
            media_type: filme.media_type || 'movie',
        };
        favoritosUsuario.push(novoFavorito);
        allFavoritos[email] = favoritosUsuario;
        alert('Filme adicionado aos favoritos!');
    }

    // Salva os favoritos atualizados no Local Storage
    localStorage.setItem('favoritos', JSON.stringify(allFavoritos));
}
