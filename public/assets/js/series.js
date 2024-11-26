// Função para buscar séries populares
async function fetchSeriesPopulares() {
    try {
        const response = await fetch('/tv-populares'); // Endpoint para séries populares
        const series = await response.json();

        const seriesDiv = document.getElementById('series-populares');
        series.forEach(serie => {
            const serieElement = document.createElement('div');
            serieElement.classList.add('serie-card');

            serieElement.innerHTML = `
                <h2 class="titulo">${serie.name}</h2>
                <img src="https://image.tmdb.org/t/p/w500${serie.poster_path || '/path/to/default/image.jpg'}" alt="${serie.name}" />
                <p>${serie.overview || 'Sem descrição disponível.'}</p>
                <p><strong>Popularidade:</strong> ${serie.popularity || 'N/A'}</p>
            `;

            // Adiciona evento para ir para a página de detalhes da série
            serieElement.addEventListener('click', () => {
                window.location.href = `/series-detalhes.html?id=${serie.id}`;
            });

            seriesDiv.appendChild(serieElement);
        });
    } catch (error) {
        console.error('Erro ao carregar séries populares:', error);
    }
}
fetchSeriesPopulares();

async function fetchSeriesDetalhes() {
    try {
        const serieId = new URLSearchParams(window.location.search).get('id');
        if (!serieId) {
            document.getElementById('serie-detalhes').innerHTML = `<p>Série não encontrada.</p>`;
            return;
        }

        // Busca detalhes da série
        const response = await fetch(`/api/tv/${serieId}`);
        const serie = await response.json();

        // Busca provedores de streaming
        const providersResponse = await fetch(`/api/tv/${serieId}/providers`);
        const providers = await providersResponse.json();

        const genres = serie.genres.map(genre => genre.name).join(', ');
        const detailsDiv = document.getElementById('serie-detalhes');

        document.title = `Detalhes de ${serie.name}`

        // Gera o HTML dos provedores
        const providersHTML = providers.flatrate?.map(provider => `
            <a href="${provider.link || '#'}" target="_blank" rel="noopener noreferrer">
                <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" 
                     alt="${provider.provider_name}" 
                     title="${provider.provider_name}" 
                     class="provider-logo">
            </a>
        `).join('') || '<p>Sem plataformas disponíveis no momento.</p>';

        detailsDiv.innerHTML = `
            <h1>${serie.name}</h1>
            <img src="https://image.tmdb.org/t/p/w500${serie.poster_path || '/path/to/default/image.jpg'}" alt="${serie.name}" />
            <p>${serie.overview || 'Sem descrição disponível.'}</p>
            <p><strong>Data de Lançamento:</strong> ${serie.first_air_date || 'N/A'}</p>
            <p><strong>Gêneros:</strong> ${genres}</p>
            <p><strong>Avaliação:</strong> ${serie.vote_average || 'N/A'}</p>
            <p><strong>Popularidade:</strong> ${serie.popularity || 'N/A'}</p>
            <div class="providers">
                <h3>Disponível em:</h3>
                ${providersHTML}
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar detalhes da série:', error);
        document.getElementById('serie-detalhes').innerHTML = `<p>Erro ao carregar os detalhes da série.</p>`;
    }
}
fetchSeriesDetalhes();