// Função para buscar os filmes populares da API e carregar no carrossel
console.log('Arquivo carregado!!') 
async function fetchFilmes() {
    const response = await fetch('/filmes-populares'); // Aqui você busca seus filmes da API
    const filmes = await response.json();

    const carouselTrack = document.getElementById('carouselTrack');

    filmes.forEach(filme => {
        const filmeElement = document.createElement('div');
        filmeElement.classList.add('carousel-item');
        
        // Adiciona a imagem e o link para a página de detalhes do filme
        filmeElement.innerHTML = `
            <a href="detalhes.html?id=${filme.id}">
                <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}">
                <p>${filme.title}</p>
            </a>
        `;

        carouselTrack.appendChild(filmeElement);
    });
}

// Função para configurar o carrossel
function setupCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const carouselItems = document.querySelectorAll('.carousel-item');

    let currentIndex = 0;
    const itemsVisible = 6; // Número de itens visíveis
    const itemWidth = carouselItems[0]?.offsetWidth + 30 || 0; // Largura do item + margem direita aumentada
    const maxIndex = Math.ceil(carouselItems.length / itemsVisible) - 1; // Máximo índice baseado em 6 itens por vez

    nextButton.addEventListener('click', () => {
        currentIndex++;
        if (currentIndex > maxIndex) {
            currentIndex = 0; // Volta ao início quando chegar ao fim
        }
        carouselTrack.style.transform = `translateX(-${currentIndex * itemWidth * itemsVisible}px)`;
    });

    prevButton.addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = maxIndex; // Vai para o último conjunto de itens
        }
        carouselTrack.style.transform = `translateX(-${currentIndex * itemWidth * itemsVisible}px)`;
    });
}

// Chama as funções quando a página carrega
window.onload = async function() {
    await fetchFilmes();
    setupCarousel();
};
