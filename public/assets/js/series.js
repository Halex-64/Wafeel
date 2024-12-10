// Lista de IDs dos provedores específicos
const selectedProviderIds = [337, 8, 119, 1899, 307, 283]; // Disney+, Netflix, Prime Video, Max, Globoplay, Crunchyroll

// Função para configurar eventos nos logos
function setupSeriesClickEvents() {
    const logos = document.querySelectorAll('.provider-logo');
    logos.forEach(logo => {
        logo.addEventListener('click', (event) => {
            const providerId = event.target.getAttribute('data-provider-id');
            filterSeriesByProvider(providerId);
        });
    });
}

// Função para filtrar séries por provedor
function filterSeriesByProvider(providerId) {
    // Filtrar séries populares
    fetch(`/api/tv?provider=${providerId}&type=popular`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.results)) {
                renderSeries(data.results, 'series-container'); // Renderiza no container de séries populares
            } else {
                console.error('Estrutura de dados inesperada para séries populares:', data);
            }
        })
        .catch(error => console.error('Erro ao filtrar séries populares:', error));

    // Filtrar séries recentes
    fetch(`/api/tv?provider=${providerId}&type=recent`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.results)) {
                renderSeries(data.results, 'series-recentes'); // Renderiza no container de séries recentes
            } else {
                console.error('Estrutura de dados inesperada para séries recentes:', data);
            }
        })
        .catch(error => console.error('Erro ao filtrar séries recentes:', error));

    // Filtrar séries com melhores avaliações
    fetch(`/api/tv?provider=${providerId}&type=top-rated`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.results)) {
                renderSeries(data.results, 'series-top-rated'); // Renderiza no container de melhores avaliações
            } else {
                console.error('Estrutura de dados inesperada para séries com melhores avaliações:', data);
            }
        })
        .catch(error => console.error('Erro ao filtrar séries com melhores avaliações:', error));

}

function renderSeries(series, containerId) {
    const seriesContainer = document.getElementById(containerId);
    if (!seriesContainer) {
        console.error(`Elemento '${containerId}' não encontrado no DOM.`);
        return;
    }
    seriesContainer.innerHTML = ''; // Limpa as séries atuais
    series.forEach(serie => {
        const serieElement = document.createElement('div');
        serieElement.classList.add('serie-item');
        serieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" alt="${serie.name}">
        `;
        serieElement.addEventListener('click', () => {
            window.location.href = `./series-detalhes.html?id=${serie.id}`;
        });
        seriesContainer.appendChild(serieElement);
    });
}

// Carregamento inicial das séries populares e recentes
function loadInitialSeries() {
    const defaultProvider = '8'; // Netflix como padrão
    fetch(`/series-populares?plataforma=${defaultProvider}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(series => {
            if (Array.isArray(series)) {
                renderSeries(series, 'series-container');
            } else {
                console.error('Estrutura inesperada para séries populares:', series);
            }
        })
        .catch(error => console.error('Erro ao carregar séries populares:', error));

    fetch('/series-recentes')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(series => {
            if (Array.isArray(series)) {
                const seriesDiv = document.getElementById('series-recentes');
                seriesDiv.innerHTML = ''; // Limpa o conteúdo anterior
                series.forEach(serie => {
                    const serieElement = document.createElement('div');
                    serieElement.classList.add('serie-item');
                    serieElement.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" alt="${serie.name}" />
                    `;
                    serieElement.addEventListener('click', () => {
                        window.location.href = `./series-detalhes.html?id=${serie.id}`;
                    });
                    seriesDiv.appendChild(serieElement);
                });
            } else {
                console.error('Estrutura inesperada para séries recentes:', series);
            }
        })
        .catch(error => console.error('Erro ao carregar séries recentes:', error));

    loadTopRatedSeries();
}

function loadSeriesProviders() {
    fetch('/api/providers') // Endpoint para carregar provedores
        .then(response => {
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            return response.json();
        })
        .then(providers => {

            const filteredProviders = providers.filter(provider =>
                selectedProviderIds.includes(provider.provider_id)
            );

            const sidebar = document.getElementById('sidebar');
            sidebar.innerHTML = '';

            filteredProviders.forEach(provider => {
                const logoElement = document.createElement('img');
                logoElement.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
                logoElement.alt = provider.provider_name;
                logoElement.classList.add('provider-logo');
                logoElement.setAttribute('data-provider-id', provider.provider_id);
                sidebar.appendChild(logoElement);
            });

            setupSeriesClickEvents();
        })
        .catch(error => console.error('Erro ao carregar provedores:', error));
}

function loadTopRatedSeries() {
    fetch('/series-melhores-avaliacoes')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na resposta: ${response.status}`);
            }
            return response.json();
        })
        .then(series => {
            if (Array.isArray(series)) {
                renderSeries(series, 'series-top-rated'); // Renderiza no container de melhores avaliações
            } else {
                console.error('Estrutura inesperada para séries com melhores avaliações:', series);
            }
        })
        .catch(error => console.error('Erro ao carregar séries com melhores avaliações:', error));
}

loadSeriesProviders();
loadInitialSeries();