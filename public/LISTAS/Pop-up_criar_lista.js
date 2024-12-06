document.addEventListener('DOMContentLoaded', () => { 
    // Elementos do DOM
    const botaoCriarLista = document.getElementById('botao_criar_lista');
    const popupCriarLista = document.getElementById('pop-up_criar_lista');
    const fundoEscuro = document.getElementById('fundo_escuro');
    const botaoCancelar = document.getElementById('cancel_button');
    const createButton = document.getElementById('create_button');
    const listNameInput = document.getElementById('list_name');
    const selectedMoviesContainer = document.getElementById('selected-movies');
    const userListsContainer = document.querySelector('.containers_listas');
    const inputField = document.getElementById('movie_search');
    const suggestionsContainer = document.getElementById('suggestions');
    const addedTitles = []; // Lista para armazenar os títulos adicionados

    // Verificação de elementos necessários
    if (!botaoCriarLista || !popupCriarLista || !botaoCancelar || !fundoEscuro || !createButton || !listNameInput || !userListsContainer) {
        console.error('Alguns elementos necessários não foram encontrados no DOM.');
        return;
    }

    // Atualiza o estado do botão "CRIAR"
    function updateCreateButtonState() {
        const isListNameFilled = listNameInput.value.trim() !== ''; // Verifica se o nome da lista está preenchido
        const hasTitles = addedTitles.length > 0; // Verifica se há títulos adicionados

        createButton.disabled = !(isListNameFilled && hasTitles); // Desabilita o botão se o nome não estiver preenchido ou não houver filmes
    }

    // Função para salvar a lista no LocalStorage
    function saveList(listName, movies) {
        const lists = JSON.parse(localStorage.getItem('userLists') || '[]');
        lists.push({ name: listName, movies });
        localStorage.setItem('userLists', JSON.stringify(lists));
        return true; // Retorna true se os dados forem válidos
    }

    // Função para obter o URL do pôster do filme
    async function getPosterUrl(movieId, apiKey) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        const data = await response.json();
        return data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : 'https://via.placeholder.com/50x75?text=No+Image';
    }

    // Função para atualizar as listas do usuário na interface
    async function updateUserLists() {
        const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46';
        const lists = JSON.parse(localStorage.getItem('userLists') || '[]');
        userListsContainer.innerHTML = ''; // Limpar o conteúdo atual

        for (const list of lists) {
            const listCard = document.createElement('a');
            listCard.href = `./lista_dinamica.html?list=${encodeURIComponent(list.name)}&movies=${encodeURIComponent(JSON.stringify(list.movies))}`;
            
            const posterPromises = list.movies.slice(0, 5).map(async movie => {
                const posterUrl = await getPosterUrl(movie.id, apiKey);
                return `<img src="${posterUrl}" alt="${movie.title}">`;
            });

            const posters = await Promise.all(posterPromises);

            listCard.innerHTML = `
                <div class="container_filme">
                    <div class="poster_filmes" id="poster_filmes_${list.name}">
                        ${posters.join('')}
                    </div>
                    <p>${list.name}</p>
                </div>
            `;
            userListsContainer.appendChild(listCard);
        }
    }

    // Evento de busca de filmes
    inputField.addEventListener('input', async (event) => {
        const query = event.target.value.trim();
        if (query.length >= 1) {
            const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46';
            const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
            const seriesUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

            try {
                const [movieResponse, seriesResponse] = await Promise.all([fetch(movieUrl), fetch(seriesUrl)]);
                const movieData = await movieResponse.json();
                const seriesData = await seriesResponse.json();

                const results = [
                    ...(movieData.results || []).map(item => ({
                        id: item.id,
                        type: 'movie', // Adiciona o tipo 'movie'
                        title: item.title,
                        release_date: item.release_date,
                        poster_path: item.poster_path,
                    })),
                    ...(seriesData.results || []).map(item => ({
                        id: item.id,
                        type: 'tv', // Adiciona o tipo 'tv' para séries
                        title: item.name,
                        release_date: item.first_air_date,
                        poster_path: item.poster_path,
                    })),
                ];

                suggestionsContainer.innerHTML = '';
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

                    plusIcon.addEventListener('click', () => {
                        const movieId = item.id;
                        const movieTitle = `${item.title}${releaseYear}`;

                        if (!addedTitles.includes(movieTitle)) {
                            addedTitles.push(movieTitle);

                            const movieChip = document.createElement('div');
                            movieChip.className = 'movie-chip';
                            movieChip.setAttribute('data-movie-id', movieId);
                            movieChip.setAttribute('data-type', item.type);  // Define o tipo para filme ou série

                            const titleSpan = document.createElement('span');
                            titleSpan.textContent = movieTitle;

                            const removeIcon = document.createElement('div');
                            removeIcon.className = 'remove-icon';
                            removeIcon.textContent = '×';

                            removeIcon.addEventListener('click', () => {
                                addedTitles.splice(addedTitles.indexOf(movieTitle), 1);
                                movieChip.remove();
                                updateCreateButtonState();
                            });

                            movieChip.appendChild(titleSpan);
                            movieChip.appendChild(removeIcon);
                            selectedMoviesContainer.appendChild(movieChip);

                            inputField.value = '';
                            suggestionsContainer.style.display = 'none';
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

    // Criar lista
    createButton.addEventListener('click', () => {
        const listName = listNameInput.value.trim();
        const selectedMovies = Array.from(selectedMoviesContainer.querySelectorAll('.movie-chip')).map(chip => ({
            id: chip.getAttribute('data-movie-id'),
            type: chip.getAttribute('data-type'),  // Passa o tipo (filme ou série)
            title: chip.querySelector('span').textContent,
            poster: chip.querySelector('img')?.src,
        }));

        if (saveList(listName, selectedMovies)) {
            window.location.href = `./lista_dinamica.html?list=${encodeURIComponent(listName)}&movies=${encodeURIComponent(JSON.stringify(selectedMovies))}`;
        }
    });

    // Mostrar pop-up de criação de lista
    botaoCriarLista.addEventListener('click', () => {
        popupCriarLista.classList.add('show');
        fundoEscuro.classList.add('show');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    });

    // Ocultar pop-up de criação de lista
    botaoCancelar.addEventListener('click', () => {
        popupCriarLista.classList.remove('show');
        fundoEscuro.classList.remove('show');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    });

    // Ocultar sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== inputField) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Atualizar as listas do usuário ao carregar a página
    updateUserLists();

    // Atualizar estado do botão "CRIAR" ao digitar no campo de nome
    listNameInput.addEventListener('input', updateCreateButtonState);
});