/*JS UTILIZADO NA TELA:
    lista_usuario.html
*/

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('movie_search');
    const listNameField = document.getElementById('list_name'); // Campo de nome da lista
    const suggestionsContainer = document.getElementById('suggestions');
    const createButton = document.getElementById('create_button');
    const selectedMoviesContainer = document.getElementById('selected-movies'); // Contêiner para os chips
    const addedTitles = []; // Lista para armazenar os títulos adicionados

    inputField.addEventListener('input', async (event) => {
        const query = event.target.value.trim(); // Remove espaços à esquerda/direita

        if (query.length >= 1) {
        const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46';

        // Extrair o ano da consulta (assumindo que o ano está no final)
        const possibleYear = query.split(/\s+/).pop(); // Dividir por espaços e pegar o último elemento
        const year = parseInt(possibleYear, 10); // Tentar converter para inteiro

        // Construir as URLs de pesquisa para filmes e séries com filtro opcional de ano
        const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&${year ? `primary_release_year=${year}` : ''}`;
        const seriesUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&${year ? `first_air_date_year=${year}` : ''}`;

        try {
            // Buscando filmes e séries simultaneamente
            const [movieResponse, seriesResponse] = await Promise.all([
            fetch(movieUrl),
            fetch(seriesUrl),
            ]);

            const movieData = await movieResponse.json();
            const seriesData = await seriesResponse.json();

            // Combine resultados de filmes e séries com informações de tipo
            const results = [
            ...(movieData.results || []).map(item => ({
                type: 'movie',
                title: item.title,
                release_date: item.release_date,
                poster_path: item.poster_path,
            })),
            ...(seriesData.results || []).map(item => ({
                type: 'tv',
                title: item.name, // Usar "name" para títulos de séries
                release_date: item.first_air_date,
                poster_path: item.poster_path,
            })),
            ];

            suggestionsContainer.innerHTML = ''; // Limpa sugestões antigas
            suggestionsContainer.style.display = 'block';

            results.slice(0, 10).forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';

            const leftContainer = document.createElement('div');
            leftContainer.className = 'left-container';

            const img = document.createElement('img');
            img.src = item.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                : 'https://via.placeholder.com/50x75?text=No+Image';
            img.alt = item.title;
            img.className = 'movie-poster';

            const title = document.createElement('span');
            const releaseYear = item.release_date ? ` (${new Date(item.release_date).getFullYear()})` : '';
            title.textContent = `[${item.type === 'movie' ? 'Filme' : 'Série'}] ${item.title}${releaseYear}`;
            title.className = 'movie-title';

            leftContainer.appendChild(img);
            leftContainer.appendChild(title);

            const plusIcon = document.createElement('span');
            plusIcon.textContent = '+';
            plusIcon.className = 'plus-icon';

            // Evento de clique no ícone "+"
            plusIcon.addEventListener('click', () => {
                const movieTitle = `${item.title}${releaseYear}`;

                if (!addedTitles.includes(movieTitle)) {
                addedTitles.push(movieTitle);

                // Cria o chip estilizado
                const movieChip = document.createElement('div');
                movieChip.className = 'movie-chip';

                const titleSpan = document.createElement('span');
                titleSpan.textContent = movieTitle;

                const removeIcon = document.createElement('div');
                removeIcon.className = 'remove-icon';
                removeIcon.textContent = '×';

                // Evento para remover o chip
                removeIcon.addEventListener('click', () => {
                    addedTitles.splice(addedTitles.indexOf(movieTitle), 1);
                    movieChip.remove();
                    updateCreateButtonState();
                });

                movieChip.appendChild(titleSpan);
                movieChip.appendChild(removeIcon);
                selectedMoviesContainer.appendChild(movieChip);

                // Limpa o campo de entrada e oculta as sugestões
                inputField.value = '';
                suggestionsContainer.style.display = 'none';

                // Foca novamente no campo de entrada
                inputField.focus();

                updateCreateButtonState();
                }
            });

            suggestion.appendChild(leftContainer);
            suggestion.appendChild(plusIcon);
            suggestionsContainer.appendChild(suggestion);
            });
        } catch (error) {
            console.error('Erro ao buscar filmes e séries:', error);
        }
        } else {
        suggestionsContainer.style.display = 'none';
        }
    });

    // Adiciona evento no campo de nome da lista
    listNameField.addEventListener('input', updateCreateButtonState);

    // Atualizar o estado do botão "CRIAR"
    function updateCreateButtonState() {
        const isListNameFilled = listNameField.value.trim() !== ''; // Verifica se o nome está preenchido
        const hasTitles = addedTitles.length > 0; // Verifica se há títulos adicionados

        createButton.disabled = !(isListNameFilled && hasTitles);
    }

    // Ocultar sugestões se clicar fora
    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== inputField) {
        suggestionsContainer.style.display = 'none';
        }
    });
});