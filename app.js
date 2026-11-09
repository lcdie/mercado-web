// ========================================
// Mercado Inmobiliario Digital — Diez de Octubre
// JavaScript con gráficas interactivas (Chart.js)
// Datos basados en el informe final del repositorio
// ========================================

// ---------- DATOS DEL PROYECTO (del informe final) ----------
const DATOS = {
  total: 122,
  revolico: 83,
  facebook: 39,
  descartes: 55,

  usdDeclarada: 106,
  conMoneda: 107,
  cup: 1,
  sinPrecio: 15,

  ventasUSD: 42,
  precioMedia: 26357.14,
  precioMediana: 21000,
  p10: 6100,
  p90: 60000,
  precioMin: 2500,
  precioMax: 70000,

  zonas: [
    { nombre: 'Santos Suárez', anuncios: 26 },
    { nombre: 'Lawton', anuncios: 19 },
    { nombre: 'La Víbora', anuncios: 12 },
    { nombre: 'El Sevillano', anuncios: 12 },
    { nombre: 'Luyano', anuncios: 7 },
    { nombre: 'El Mónaco', anuncios: 6 },
    { nombre: 'Santa Catalina', anuncios: 5 },
    { nombre: 'Otros', anuncios: 4 }
  ],

  zonasStats: [
    { nombre: 'El Mónaco', media: 57666.67, mediana: 33000, n: 6 },
    { nombre: 'La Víbora', media: 49590.91, mediana: 26000, n: 11 },
    { nombre: 'El Sevillano', media: 39700, mediana: 36000, n: 10 },
    { nombre: 'Santa Catalina', media: 37200, mediana: 35000, n: 5 },
    { nombre: 'Santos Suárez', media: 31565.22, mediana: 22500, n: 23 },
    { nombre: 'Luyano', media: 25928.57, mediana: 25000, n: 7 },
    { nombre: 'Lawton', media: 20656.25, mediana: 20000, n: 16 }
  ],

  monedaUSD: 106,
  monedaCUP: 1,

  conPrecioYZona: 82,
  soloPrecio: 23,
  soloZona: 9,
  ninguno: 6
};

// ---------- GESTIÓN DE GRÁFICAS ----------
let charts = {};

function destruirGrafica(id) {
  if (charts[id]) {
    charts[id].destroy();
    charts[id] = null;
  }
}

// Gráfica 1: Precios de venta USD
function crearGrafica1() {
  destruirGrafica(1);
  const ctx = document.getElementById('graf1').getContext('2d');
  charts[1] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['$2,500 - $6,100', '$6,100 - $15,000', '$15,000 - $21,000', '$21,000 - $33,000', '$33,000 - $60,000', '$60,000 - $70,000'],
      datasets: [{
        label: 'Anuncios de venta (USD)',
        data: [4, 10, 12, 8, 6, 2],
        backgroundColor: '#1e6f9e',
        borderColor: '#0f4c81',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,76,129,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ctx.parsed.y + ' anuncios' }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Cantidad de anuncios' }, ticks: { stepSize: 2 } },
        x: { title: { display: true, text: 'Rango de precio (USD)' } }
      }
    }
  });
}

// Gráfica 2: Oferta por zona
function crearGrafica2() {
  destruirGrafica(2);
  const ctx = document.getElementById('graf2').getContext('2d');
  charts[2] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATOS.zonas.map(z => z.nombre),
      datasets: [{
        label: 'Anuncios',
        data: DATOS.zonas.map(z => z.anuncios),
        backgroundColor: DATOS.zonas.map((z,i) => i < 4 ? '#e8a33d' : '#1e6f9e'),
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,76,129,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ctx.parsed.x + ' anuncios' }
        }
      },
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Cantidad de anuncios' }, ticks: { stepSize: 5 } }
      }
    }
  });
}

// Gráfica 3: Media vs Mediana por zona
function crearGrafica3(metrica = 'media') {
  destruirGrafica(3);
  const ctx = document.getElementById('graf3').getContext('2d');
  const datos = DATOS.zonasStats.slice().reverse();
  charts[3] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.map(d => d.nombre),
      datasets: [{
        label: metrica === 'media' ? 'Precio medio (USD)' : 'Precio mediana (USD)',
        data: metrica === 'media' ? datos.map(d => d.media) : datos.map(d => d.mediana),
        backgroundColor: '#e8a33d',
        borderColor: '#c9862b',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(232,163,61,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => '$' + ctx.parsed.y.toLocaleString() + ' USD' }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'USD' }, ticks: { callback: v => '$' + v.toLocaleString() } }
      }
    }
  });
}

// Gráfica 4: Moneda declarada (donut)
function crearGrafica4() {
  destruirGrafica(4);
  const ctx = document.getElementById('graf4').getContext('2d');
  charts[4] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['USD', 'CUP', 'Sin precio'],
      datasets: [{
        data: [DATOS.monedaUSD, DATOS.monedaCUP, DATOS.sinPrecio],
        backgroundColor: ['#1e6f9e', '#c9862b', '#9ca3af'],
        borderColor: '#ffffff',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      animation: { duration: 1500, easing: 'easeOutQuart', animateRotate: true },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 14 }, padding: 20 } },
        tooltip: {
          backgroundColor: 'rgba(31,41,55,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => {
              const total = DATOS.monedaUSD + DATOS.monedaCUP + DATOS.sinPrecio;
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ctx.label + ': ' + ctx.parsed + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });
}

// Gráfica 5: Opacidad (donut)
function crearGrafica5() {
  destruirGrafica(5);
  const ctx = document.getElementById('graf5').getContext('2d');
  charts[5] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Precio + Zona', 'Solo precio', 'Solo zona', 'Ninguno'],
      datasets: [{
        data: [DATOS.conPrecioYZona, DATOS.soloPrecio, DATOS.soloZona, DATOS.ninguno],
        backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
        borderColor: '#ffffff',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      animation: { duration: 1500, easing: 'easeOutQuart', animateRotate: true },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 14 }, padding: 20 } },
        tooltip: {
          backgroundColor: 'rgba(31,41,55,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => {
              const total = DATOS.total;
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ctx.label + ': ' + ctx.parsed + ' anuncios (' + pct + '%)';
            }
          }
        }
      }
    }
  });
}

// ---------- CONTROLES INTERACTIVOS ----------
function filtrarGrafica(id, tipo) {
  document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
  const btn = document.querySelector(`.btn-filtro[data-target="g${id}"][data-${tipo === 'todos' ? 'filtro' : 'metrica'}="${tipo}"]`);
  if (btn) btn.classList.add('activo');

  if (id === 1) {
    charts[1].options.animation.duration = 800;
    charts[1].update();
  } else if (id === 2) {
    charts[2].update({ duration: 1000 });
  }
}

function cambiarMetrica(id, metrica) {
  document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
  const btn = document.querySelector(`.btn-filtro[data-target="g${id}"][data-metrica="${metrica}"]`);
  if (btn) btn.classList.add('activo');
  if (id === 3) crearGrafica3(metrica);
}

// ---------- COMPARTIR EN WHATSAPP ----------
function initShare() {
  const btn = document.getElementById('btn-share');
  const url = window.location.href;
  const texto = '🏠 Mercado Inmobiliario Digital en Diez de Octubre: 122 publicaciones verificadas, 86.9% en dólares, mediana $21,000 USD. Mirá las gráficas interactivas: ' + url;

  if (navigator.share) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.share({ title: 'Mercado Inmobiliario Digital — Diez de Octubre', text: texto, url: url });
      } catch (err) {
        // Usuario canceló o error
      }
    });
  } else {
    // Fallback: copiar enlace al portapapeles
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = '¡Enlace copiado!';
        setTimeout(() => { btn.textContent = 'Compartir enlace'; }, 2000);
      });
    });
  }
}

// ---------- BOTÓN VOLVER ARRIBA ----------
function initBtnTop() {
  const btn = document.getElementById('btn-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener('DOMContentLoaded', () => {
  crearGrafica1();
  crearGrafica2();
  crearGrafica3('media');
  crearGrafica4();
  crearGrafica5();
  initShare();
  initBtnTop();
});

window.addEventListener('resize', () => {
  Object.values(charts).forEach(c => { if (c) c.resize(); });
});