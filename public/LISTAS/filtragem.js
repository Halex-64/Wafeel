// Lista para armazenar todos os filmes carregados
export let loadedMovies = [];

// Função para filtrar filmes por gênero
export function filterMoviesByGenre(selectedGenre) {
    loadedMovies.forEach(movie => {
        const movieElement = document.getElementById(movie.containerId);
        if (movie.genres.includes(selectedGenre)) {
            movieElement.style.display = 'block';
        } else {
            movieElement.style.display = 'none';
        }
    });
}

// Função para inicializar eventos de filtragem
export function initializeGenreFilter() {
    const genreOptions = document.querySelectorAll('#dropdown-genero .option');
    genreOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedGenre = option.textContent;
            filterMoviesByGenre(selectedGenre);
        });
    });
}
