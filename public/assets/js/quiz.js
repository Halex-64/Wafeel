// Mapeamento de gêneros e pontuação
const genreMap = {
    Comédia: 35,
    Suspense: 53,
    Drama: 18,
    Ação: 28,
    Romance: 10749,
    Ficção_Científica: 878
};

const scores = {
    Comédia: 0,
    Suspense: 0,
    Drama: 0,
    Ação: 0,
    Romance: 0,
    Ficção_Científica: 0
};

// Funções para lidar com o quiz
function addScore(category) {
    scores[category]++;
}

function submitQuiz() {
    const form = document.getElementById('quiz-form');
    const formData = new FormData(form);

    // Resetar os pontos a cada nova submissão
    Object.keys(scores).forEach(key => scores[key] = 0);

    // Processa cada resposta e acumula pontos
    for (const [question, answer] of formData.entries()) {
        addScore(answer);
    }

    // Encontra a categoria com a pontuação mais alta
    const topCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    const genreId = genreMap[topCategory];

    fetch(`/api/recommendation?category=${genreId}`)
        .then(response => response.json())
        .then(data => displayRecommendation(data))
        .catch(error => console.error("Erro ao obter recomendação:", error));
}

// Função para exibir a recomendação
function displayRecommendation(media) {
    const recommendationDiv = document.getElementById('recommendation');
    const type = media.media_type || 'movie'; // Certifique-se de pegar o tipo da mídia

    recommendationDiv.innerHTML = `
        <h2>Recomendação para você:</h2>
        <h3>${media.title || media.name}</h3>
        <img src="https://image.tmdb.org/t/p/w500${media.poster_path}" alt="${media.title || media.name}">
    `;
    recommendationDiv.addEventListener('click', () => {
        // Redireciona para a página de detalhes com o tipo e o ID
        window.location.href = `./filmes-detalhes.html?id=${media.id}&type=${type}`;
    });
}

// Event listener no formulário
const quizForm = document.getElementById('quiz-form');
quizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitQuiz();
});