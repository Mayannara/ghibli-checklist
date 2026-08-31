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

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const totalMovies = 22;
  const checkedBoxes = document.querySelectorAll('.checkbox.checked').length;
  const percentage = Math.round((checkedBoxes / totalMovies) * 100);

  let y = 0;

  function drawHeader() {
    // Faixa de fundo do cabeçalho
    doc.setFillColor(45, 90, 135);
    doc.rect(0, 0, pageWidth, 38, 'F');

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Studio Ghibli — Checklist de Filmes', pageWidth / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 230, 240);
    doc.text('1984 – 2023', pageWidth / 2, 23, { align: 'center' });

    // Barra de progresso
    const barX = marginX;
    const barY = 29;
    const barWidth = pageWidth - marginX * 2;
    const barHeight = 4;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

    doc.setFillColor(129, 199, 132);
    const filledWidth = (barWidth * percentage) / 100;
    if (filledWidth > 0) {
      doc.roundedRect(barX, barY, filledWidth, barHeight, 2, 2, 'F');
    }

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${checkedBoxes} de ${totalMovies} filmes assistidos (${percentage}%)`, pageWidth / 2, 36, { align: 'center' });

    y = 48;
  }

  function drawFooter(pageNum, totalPages) {
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('Gerado pelo Ghibli Checklist', marginX, pageHeight - 8);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
  }

  function checkPageBreak(heightNeeded) {
    if (y + heightNeeded > pageHeight - 15) {
      doc.addPage();
      drawHeader();
    }
  }

  drawHeader();

  const yearSections = document.querySelectorAll('.year-section');

  yearSections.forEach((section) => {
    const year = section.querySelector('.year-header').textContent;
    const movies = section.querySelectorAll('.movie-item');

    checkPageBreak(16);

    // Pílula do ano
    doc.setFillColor(102, 126, 234);
    doc.roundedRect(marginX, y, 24, 8, 4, 4, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(year, marginX + 12, y + 5.5, { align: 'center' });

    y += 14;

    movies.forEach((movie) => {
      const title = movie.querySelector('.movie-title').textContent;
      const director = movie.querySelector('.director').textContent;
      const noteEl = movie.querySelector('.note');
      const note = noteEl ? noteEl.textContent.trim() : null;
      const isChecked = movie.querySelector('.checkbox').classList.contains('checked');

      const cardHeight = note ? 22 : 16;
      checkPageBreak(cardHeight + 4);

      // Card de fundo
      doc.setFillColor(isChecked ? 240 : 248, isChecked ? 245 : 249, 255);
      doc.roundedRect(marginX, y, pageWidth - marginX * 2, cardHeight, 3, 3, 'F');

      // Checkbox
      const boxSize = 6;
      const boxX = marginX + 5;
      const boxY = y + 5;

      doc.setDrawColor(102, 126, 234);
      doc.setLineWidth(0.5);
      doc.roundedRect(boxX, boxY, boxSize, boxSize, 1.5, 1.5, isChecked ? 'FD' : 'D');

      if (isChecked) {
        doc.setFillColor(102, 126, 234);
        doc.roundedRect(boxX, boxY, boxSize, boxSize, 1.5, 1.5, 'F');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.line(boxX + 1.3, boxY + 3.2, boxX + 2.5, boxY + 4.6);
        doc.line(boxX + 2.5, boxY + 4.6, boxX + 4.8, boxY + 1.4);
      }

      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text(title, boxX + boxSize + 5, y + 7);

      // Diretor
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 126, 234);
      doc.text(`Diretor: ${director}`, boxX + boxSize + 5, y + 12.5);

      // Nota (se existir)
      if (note) {
        doc.setFontSize(7.5);
        doc.setTextColor(150, 130, 60);
        doc.text(note, boxX + boxSize + 5, y + 17.5, { maxWidth: pageWidth - marginX * 2 - boxSize - 10 });
      }

      y += cardHeight + 3;
    });

    y += 5;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  doc.save('checklist-studio-ghibli.pdf');
}

window.addEventListener('load', () => {
  loadPosters();
  restoreProgress();
});
