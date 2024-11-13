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

//     Chama a API para recomendação
//     fetch(`/api/recommendation?category=${topCategory}`)
//         .then(response => response.json())
//         .then(data => displayRecommendation(data))
//         .catch(error => console.error("Erro ao obter recomendação:", error));
// }

function displayRecommendation(movie) {
    const recommendationDiv = document.getElementById('recommendation');
    recommendationDiv.innerHTML = `
        <h2>Recomendação para você:</h2>
        <h3>${movie.title}</h3>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
    `;
    recommendationDiv.addEventListener('click', () => {
        window.location.href = `./filmes-detalhes.html?id=${movie.id}`;
    });
}
