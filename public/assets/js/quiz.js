// Mapeamento de gêneros e pontuação
const genreMap = {
    Comédia: 35,
    Suspense: 53,
    Drama: 18,
    Ação: 28,
    Romance: 10749,
    Ficção_Científica: 878,
};

const scores = {
    Comédia: 0,
    Suspense: 0,
    Drama: 0,
    Ação: 0,
    Romance: 0,
    Ficção_Científica: 0,
};

// Função para calcular os pontos e buscar recomendações
async function submitQuiz(isList = false) {
    const form = document.getElementById('quiz-form');
    const formData = new FormData(form);

    // Resetar os pontos
    Object.keys(scores).forEach((key) => (scores[key] = 0));

    // Processar as respostas
    for (const [question, answer] of formData.entries()) {
        scores[answer]++;
    }

    // Categoria com maior pontuação
    const topCategory = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
    const genreId = genreMap[topCategory];

    try {
        const limit = isList ? 5 : 1; // Define a quantidade de resultados
        const response = await fetch(`/api/recommendation?category=${genreId}&limit=${limit}`);
        if (!response.ok) throw new Error('Erro ao buscar recomendações.');

        const recommendations = await response.json();

        if (isList) {
            displayRecommendations(recommendations); // Exibir lista
        } else {
            displayRecommendation(recommendations[0]); // Exibir único filme/série
        }
    } catch (error) {
        console.error('Erro ao buscar recomendações:', error.message);
    }
}

// Função para exibir uma única recomendação
function displayRecommendation(media) {
    const recommendationDiv = document.getElementById('recommendation');
    const type = media.media_type || 'movie';
    recommendationDiv.innerHTML = `
        <h2>Recomendação para você:</h2>
        <h2>${media.title || media.name}</h2>
        <img src="https://image.tmdb.org/t/p/w500${media.poster_path}" alt="${media.title || media.name}">
    `;
    recommendationDiv.addEventListener('click', () => {
        window.location.href = `./filmes-detalhes.html?id=${media.id}&type=${type}`;
    });
}

// Função para exibir uma lista de recomendações
function displayRecommendations(recommendations) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = `
    <h2 class = "titulo-lista-recomendacoes">Lista de Recomendações:</h2>
    `; // Limpa a lista anterior

    recommendations.forEach((media) => {
        const type = media.media_type || 'movie';

        const item = document.createElement('div');
        item.classList.add('recommendation-item'); 
        item.innerHTML = `
            <h3>${media.title || media.name}</h3>
            <img src="https://image.tmdb.org/t/p/w500${media.poster_path}" alt="${media.title || media.name}">
        `;
        item.addEventListener('click', () => {
            window.location.href = `./filmes-detalhes.html?id=${media.id}&type=${type}`;
        });

        recommendationList.appendChild(item);
    });
}

// Event listener para o envio do formulário
document.getElementById('quiz-form').addEventListener('submit', (event) => {
    event.preventDefault();
    submitQuiz(false); // Exibir apenas uma recomendação
});

// Event listener para o botão de gerar lista
document.getElementById('generate-list').addEventListener('click', () => {
    submitQuiz(true); // Exibir lista de recomendações
});
