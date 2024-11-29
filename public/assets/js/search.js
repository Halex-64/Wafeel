let API_KEY;

async function fetchApiKey() {
    try {
        const response = await fetch('/api/key');
        const data = await response.json();
        API_KEY = data.apiKey;
    } catch (error) {
        console.error('Erro ao obter API_KEY:', error);
    }
}

// Chame esta função assim que a página carregar
fetchApiKey();

async function searchContentByName(name, type) {
    const query = encodeURIComponent(name); // Codifica o nome corretamente para a URL
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${API_KEY}&query=${query}&language=pt-BR`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const content = data.results[0]; // Pega o primeiro resultado
            console.log(`ID: ${content.id}, Título: ${content.title || content.name}`);
            return content;
        } else {
            console.log(`Nenhum ${type === 'movie' ? 'filme' : 'série'} encontrado com esse nome.`);
            return null;
        }
    } catch (error) {
        console.error(`Erro ao buscar ${type === 'movie' ? 'filme' : 'série'} por nome:`, error);
    }
}

document.getElementById('search-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('movie-name').value;
    const type = document.querySelector('input[name="content-type"]:checked').value; // movie ou tv
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<p>Buscando...</p>'; // Mensagem de carregamento

    try {
        const content = await searchContentByName(name, type);

        if (!content) {
            throw new Error(`${type === 'movie' ? 'Filme' : 'Série'} não encontrado.`);
        }

        resultDiv.innerHTML = `
            <div class="movie-card">
                <h2>${content.title || content.name}</h2>
                <h2>ID: ${content.id}</h2>
                <img src="https://image.tmdb.org/t/p/w500${content.poster_path}" alt="${content.title || content.name}">
                <p><strong>Data de Lançamento:</strong> ${content.release_date || content.first_air_date || 'N/A'}</p>
                <p><strong>Resumo:</strong> ${content.overview || 'Nenhuma descrição disponível.'}</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
});



// Exemplo de chamada
document.getElementById('search-button').addEventListener('click', () => {
    const name = document.getElementById('search-input').value;
    const type = document.querySelector('input[name="content-type"]:checked').value;
    searchContent(name, type);
});
