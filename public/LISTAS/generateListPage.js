document.addEventListener('DOMContentLoaded', () => {
    // Obter o nome da lista a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const listName = urlParams.get('list');

    if (!listName) {
        console.error('Nenhuma lista foi especificada.');
        return;
    }

    // Recuperar as listas salvas
    const lists = JSON.parse(localStorage.getItem('userLists') || '[]');
    const list = lists.find(l => l.name === listName);

    if (!list) {
        console.error('A lista especificada não foi encontrada.');
        return;
    }

    // Atualizar o título da página
    document.querySelector('.titulo_lista').textContent = list.name;

    // Renderizar os filmes da lista
    const containerFilmes = document.querySelector('.container_filmes');
    list.movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('resumo_filme');
        movieCard.innerHTML = `
        <div class="container_filmes">
            <div class="resumo_filme_imagem">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="titulo_genero">
                    <li>${movie.title}</li>
                </div>
            </div>
        </div>
        `;
        containerFilmes.appendChild(movieCard);
    });
});