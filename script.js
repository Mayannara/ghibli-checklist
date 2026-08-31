const TMDB_API_KEY = '9e4006f6bc5a77b7fbb0aabf42118718';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w200';

// IDs dos filmes na TMDB (mapeados por título)
const movieIds = {
  "Nausicaä do Vale do Vento": 81,
  "O Castelo no Céu": 10515,
  "Meu Amigo Totoro": 8392,
  "Túmulo dos Vagalumes": 12477,
  "O Serviço de Entregas da Kiki": 16859,
  "Memórias de Ontem": 15080,
  "Porco Rosso": 11621,
  "Eu Posso Ouvir o Oceano": 21057,
  "PomPoko": 15283,
  "Sussurros do Coração": 37797,
  "Princesa Mononoke": 128,
  "Meus Vizinhos, os Yamadas": 16198,
  "A Viagem de Chihiro": 129,
  "O Reino dos Gatos": 15370,
  "O Castelo Animado": 4935,
  "Contos de Terramar": 37933,
  "Ponyo: Uma Amizade que Veio do Mar": 12429,
  "O Mundo Secreto de Arrietty": 51739,
  "Da Colina Kokuriko": 83389,
  "Vidas ao Vento": 149870,
  "O Conto da Princesa Kaguya": 149871,
  "As Memórias de Marnie": 242828,
  "A Tartaruga Vermelha": 337703,
  "O Menino e a Garça": 508883,
};

function toggleCheck(movieItem) {
  const checkbox = movieItem.querySelector('.checkbox');
  checkbox.classList.toggle('checked');
  updateStats();
}

function updateStats() {
  const totalMovies = 22;
  const checkedBoxes = document.querySelectorAll('.checkbox.checked').length;
  const percentage = Math.round((checkedBoxes / totalMovies) * 100);

  document.getElementById('watched-count').textContent = checkedBoxes;
  document.getElementById('completion-percent').textContent = percentage + '%';
  document.getElementById('progress-fill').style.width = percentage + '%';

  const checkedItems = Array.from(document.querySelectorAll('.checkbox.checked')).map((cb) => {
    return cb.closest('.movie-item').querySelector('.movie-title').textContent;
  });
  localStorage.setItem('ghibliProgress', JSON.stringify(checkedItems));
}

async function loadPosters() {
  const movieItems = document.querySelectorAll('.movie-item');
  for (const item of movieItems) {
    const title = item.querySelector('.movie-title').textContent;
    const tmdbId = movieIds[title];
    if (!tmdbId) continue;

    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=pt-BR`);
      const data = await res.json();
      if (data.poster_path) {
        const img = document.createElement('img');
        img.src = TMDB_IMG_BASE + data.poster_path;
        img.alt = title;
        img.className = 'movie-poster';
        item.insertBefore(img, item.querySelector('.checkbox'));
      }
    } catch (err) {
      console.error(`Erro ao buscar pôster de ${title}:`, err);
    }
  }
}

function restoreProgress() {
  const savedProgress = localStorage.getItem('ghibliProgress');
  if (savedProgress) {
    const checkedMovies = JSON.parse(savedProgress);
    checkedMovies.forEach((movieTitle) => {
      const movieItems = document.querySelectorAll('.movie-item');
      movieItems.forEach((item) => {
        if (item.querySelector('.movie-title').textContent === movieTitle) {
          item.querySelector('.checkbox').classList.add('checked');
        }
      });
    });
    updateStats();
  }
}

window.addEventListener('load', () => {
  loadPosters();
  restoreProgress();
});