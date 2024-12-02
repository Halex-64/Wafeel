document.addEventListener('DOMContentLoaded', () => {
    const movieId = 786892; // Substitua pelo ID do filme que você quer exibir
    const apiKey = '4556dc6e1d1a01742122bf8dc0fbae46'; // Substitua pela sua chave de API do TMDb

    const movieTitleElement = document.getElementById('titulo_filme');
    const genreElement = document.getElementById('genero_filme');
    const synopsisElement = document.getElementById('sinopse_filme');
    const releaseYearElement = document.getElementById('ano_lancamento');
    const durationElement = document.getElementById('duracao');
    const ratingElement = document.getElementById('classificacao_indicativa');
    const movieImageElement = document.querySelector('.resumo_filme_imagem');

    // URL da API para buscar detalhes do filme
    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`;

    // Função para buscar as informações do filme
    async function getMovieDetails() {
        try {
            const response = await fetch(movieUrl);
            const movieData = await response.json();

            // Preencher os dados no HTML
            movieTitleElement.textContent = movieData.title || 'Título não disponível';

            // Ajustar o tamanho da fonte do título com base no comprimento
            adjustTitleFontSize(movieTitleElement);

            // Gêneros
            genreElement.innerHTML = ''; // Limpa o conteúdo antes de adicionar novos
            const genres = movieData.genres.slice(0, 2);

            genres.forEach((genre, index) => {
                const genreItem = document.createElement('li');
                genreItem.textContent = genre.name;
                genreElement.appendChild(genreItem);

                // Adiciona o ponto separador se não for o último gênero
                if (index < genres.length - 1) {
                    const separator = document.createElement('li');
                    separator.textContent = '•';
                    separator.style.margin = '0 5px'; // Espaçamento ao redor do ponto
                    genreElement.appendChild(separator);
                }
            });

            // Sinopse: Limitar o tamanho da sinopse
            const maxSynopsisLength = 125; // Defina o limite máximo de caracteres para a sinopse
            let shortSynopsis = movieData.overview || 'Sinopse não disponível';

            if (shortSynopsis.length > maxSynopsisLength) {
                shortSynopsis = shortSynopsis.slice(0, maxSynopsisLength) + '...'; // Limita e adiciona "..."
                const readMoreLink = document.createElement('a');
                readMoreLink.href = '#';
                readMoreLink.textContent = 'Leia mais';
                readMoreLink.style.color = '#8500F2'; // Cor roxa, combinando com o estilo
                readMoreLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    synopsisElement.textContent = movieData.overview; // Exibe a sinopse completa
                    readMoreLink.style.display = 'none'; // Esconde o "Leia mais" após clicar
                });
                synopsisElement.textContent = shortSynopsis;
                synopsisElement.appendChild(readMoreLink);
            } else {
                synopsisElement.textContent = shortSynopsis;
            }

            // Ano de lançamento
            const releaseYear = new Date(movieData.release_date).getFullYear();
            releaseYearElement.textContent = releaseYear || 'Ano não disponível';

            // Duração
            durationElement.textContent = `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}min` || 'Duração não disponível';

            // Classificação indicativa
            ratingElement.textContent = movieData.adult ? '18 Anos' : 'Livre';

            // Adicionando os pontos separadores entre as informações de ano, duração e classificação
            const infoListElement = document.getElementById('informacoes_filme');
            infoListElement.innerHTML = ''; // Limpa as informações anteriores

            const infoItems = [
                releaseYearElement.textContent,
                durationElement.textContent,
                ratingElement.textContent
            ];

            infoItems.forEach((info, index) => {
                const infoItem = document.createElement('li');
                infoItem.textContent = info;
                infoListElement.appendChild(infoItem);

                // Adiciona o ponto separador se não for o último item
                if (index < infoItems.length - 1) {
                    const separator = document.createElement('li');
                    separator.textContent = '•';
                    separator.style.margin = '0 5px'; // Espaçamento ao redor do ponto
                    infoListElement.appendChild(separator);
                }
            });

            // Imagem de fundo (usando backdrop_path)
            if (movieData.backdrop_path) {
                const backdropUrl = `https://image.tmdb.org/t/p/original/ljmfJ5NFejvEzZWV47J56dIVRIe.jpg`;
                movieImageElement.style.backgroundImage = `url(${backdropUrl})`;
            } else {
                console.warn('Nenhum backdrop disponível para este filme.');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do filme:', error);
        }
    }

    // Função para ajustar o tamanho da fonte do título
    function adjustTitleFontSize(titleElement) {
        const titleLength = titleElement.textContent.length;

        // Definindo o tamanho da fonte com base no comprimento do título
        if (titleLength <= 15) {
            titleElement.style.fontSize = '48px';
        } else if (titleLength <= 30) {
            titleElement.style.fontSize = '40px';
        } else if (titleLength <= 45) {
            titleElement.style.fontSize = '32px';
        } else {
            titleElement.style.fontSize = '24px';
        }
    }

    // Chama a função para buscar as informações do filme
    getMovieDetails();
});