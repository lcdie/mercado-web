/* =========================================================
   Mercado inmobiliario digital en Diez de Octubre
   Web independiente · Interactividad y gráficas (Chart.js)
   ---------------------------------------------------------
   Cifras tomadas del informe final, verificadas contra
   datos/limpios/unificado_confirmados_diez_octubre.json
   y scripts/cifras_control.py del repositorio original.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     DATOS VERIFICADOS
     --------------------------------------------------------- */
  const DATOS = {
    total: 122,
    revolico: 83,
    facebook: 39,

    // Moneda
    usd: 106,
    cup: 1,
    sinPrecio: 15,
    conMoneda: 107,

    // Ventas explícitas en USD (clasificación textual del informe)
    ventasUSD: 42,
    media: 26357.14,
    mediana: 21000,
    p10: 6100,
    p90: 60000,
    min: 2500,
    max: 70000,

    // Histograma de 15 intervalos (misma lógica que el informe)
    histEdges: [2500, 7000, 11500, 16000, 20500, 25000, 29500, 34000,
      38500, 43000, 47500, 52000, 56500, 61000, 65500, 70000],
    histCounts: [5, 3, 8, 5, 4, 4, 4, 1, 0, 1, 0, 0, 3, 1, 3],

    // Oferta por zona (91 publicaciones con zona)
    zonas: [
      { nombre: 'Santos Suárez', anuncios: 26 },
      { nombre: 'Lawton', anuncios: 19 },
      { nombre: 'La Víbora', anuncios: 12 },
      { nombre: 'El Sevillano', anuncios: 12 },
      { nombre: 'Luyano', anuncios: 7 },
      { nombre: 'El Mónaco', anuncios: 6 },
      { nombre: 'Santa Catalina', anuncios: 5 },
      { nombre: 'Calzada 10 de Octubre', anuncios: 2 },
      { nombre: 'Vía Blanca', anuncios: 1 },
      { nombre: 'Vista Alegre', anuncios: 1 }
    ],

    // Media y mediana del precio en USD por zona (n >= 5)
    zonasStats: [
      { nombre: 'El Mónaco', media: 57666.67, mediana: 33000, n: 6 },
      { nombre: 'La Víbora', media: 49590.91, mediana: 26000, n: 11 },
      { nombre: 'El Sevillano', media: 39700, mediana: 36000, n: 10 },
      { nombre: 'Santa Catalina', media: 37200, mediana: 35000, n: 5 },
      { nombre: 'Santos Suárez', media: 31565.22, mediana: 22500, n: 23 },
      { nombre: 'Luyano', media: 25928.57, mediana: 25000, n: 7 },
      { nombre: 'Lawton', media: 20656.25, mediana: 20000, n: 16 }
    ],

    // Opacidad
    conPrecioYZona: 82,
    soloPrecio: 25,
    soloZona: 9,
    ninguno: 6,
    conZona: 91
  };

  const PALETA = {
    blue: '#0f5b7a',
    blueDark: '#0b3d5c',
    teal: '#0e7c86',
    amber: '#e8a33d',
    amberDark: '#c9821f',
    green: '#2e9e6b',
    coral: '#d9534f',
    gray: '#8fa3ae',
    ink: '#122530',
    muted: '#5d7280',
    grid: 'rgba(18, 37, 48, .09)'
  };

  const fmtUSD = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const fmtNum = (v, d = 0) => Number(v).toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  });
  const pct = (part, whole) => ((part / whole) * 100).toFixed(1).replace('.', ',') + '%';

  const charts = {};
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     PLUGINS PERSONALIZADOS
     --------------------------------------------------------- */

  // Líneas de media y mediana sobre el histograma
  const meanMedianPlugin = {
    id: 'meanMedianLines',
    afterDatasetsDraw(chart) {
      if (!chart.$stats) return;
      const { ctx, chartArea, scales } = chart;
      const xScale = scales.x;
      if (!xScale || !chartArea) return;

      const lo = DATOS.histEdges[0];
      const hi = DATOS.histEdges[DATOS.histEdges.length - 1];
      const bins = DATOS.histCounts.length;
      const width = (hi - lo) / bins;

      const pixelFor = (value) => {
        const raw = (value - lo) / width;
        const idx = Math.max(0, Math.min(bins - 1, Math.floor(raw)));
        const frac = raw - idx;
        const p0 = xScale.getPixelForValue(idx);
        const p1 = xScale.getPixelForValue(Math.min(idx + 1, bins - 1));
        return p0 + (p1 - p0) * frac;
      };

      const marks = [
        { v: DATOS.mediana, label: 'Mediana ' + fmtUSD(DATOS.mediana), color: PALETA.amber },
        { v: DATOS.media, label: 'Media ' + fmtUSD(DATOS.media), color: PALETA.blue }
      ];

      ctx.save();
      marks.forEach((mark, i) => {
        const x = pixelFor(mark.v);
        if (x < chartArea.left || x > chartArea.right) return;

        ctx.beginPath();
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = mark.color;
        ctx.moveTo(x, chartArea.top + 26);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = '700 11px ' + Chart.defaults.font.family;
        const text = mark.label;
        const pad = 7;
        const textWidth = ctx.measureText(text).width;
        const boxW = textWidth + pad * 2;
        const boxH = 20;
        let boxX = x - boxW / 2;
        boxX = Math.max(chartArea.left + 2, Math.min(boxX, chartArea.right - boxW - 2));
        const boxY = chartArea.top + 4 + i * 24;

        ctx.fillStyle = mark.color;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        } else {
          ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, boxX + pad, boxY + boxH / 2 + 0.5);
      });
      ctx.restore();
    }
  };

  // Texto central de las gráficas de dona
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
      const info = chart.$center;
      if (!info) return;
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = PALETA.ink;
      ctx.font = '700 30px ' + Chart.defaults.font.family;
      ctx.fillText(info.value, x, y - 9);
      ctx.fillStyle = PALETA.muted;
      ctx.font = '600 11px ' + Chart.defaults.font.family;
      ctx.fillText(info.label, x, y + 20);
      ctx.restore();
    }
  };

  /* ---------------------------------------------------------
     UTILIDADES DE GRÁFICAS
     --------------------------------------------------------- */
  function zoomConfig() {
    if (!canHover) {
      return {
        pan: { enabled: false },
        zoom: { wheel: { enabled: false }, pinch: { enabled: false } }
      };
    }
    return {
      pan: { enabled: true, mode: 'x' },
      zoom: {
        wheel: { enabled: true, speed: 0.07 },
        pinch: { enabled: false },
        mode: 'x'
      },
      limits: { x: { min: 'original', max: 'original' } }
    };
  }

  function tooltipBase(extra) {
    return Object.assign({
      backgroundColor: 'rgba(10, 40, 55, .94)',
      titleColor: '#ffffff',
      bodyColor: '#e6f2f6',
      padding: 12,
      cornerRadius: 9,
      displayColors: false,
      titleFont: { weight: '700', size: 12.5 },
      bodyFont: { size: 12.5 }
    }, extra || {});
  }

  function makeChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || !window.Chart) return null;
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
    charts[id] = new Chart(canvas.getContext('2d'), config);
    return charts[id];
  }

  function animateDuration(base) {
    return reduceMotion ? 0 : base;
  }

  /* ---------------------------------------------------------
     GRÁFICA 1 · PRECIOS DE VENTA EN USD
     --------------------------------------------------------- */
  function crearGrafica1() {
    const labels = DATOS.histEdges.slice(0, -1).map((lo, i) => {
      const hi = DATOS.histEdges[i + 1];
      return (lo / 1000) + '–' + (hi / 1000);
    });

    const ranges = DATOS.histEdges.slice(0, -1).map((lo, i) => {
      const hi = DATOS.histEdges[i + 1];
      return fmtUSD(lo) + ' – ' + fmtUSD(hi);
    });

    makeChart('chart1', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Anuncios de venta',
          data: DATOS.histCounts.slice(),
          backgroundColor: 'rgba(15, 91, 122, .82)',
          hoverBackgroundColor: PALETA.amber,
          borderColor: '#ffffff',
          borderWidth: 1,
          borderRadius: 5,
          maxBarThickness: 44
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: animateDuration(1100), easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 52, right: 8 } },
        plugins: {
          legend: { display: false },
          tooltip: tooltipBase({
            callbacks: {
              title: (items) => ranges[items[0].dataIndex],
              label: (ctx) => {
                const n = ctx.parsed.y;
                return n + (n === 1 ? ' anuncio' : ' anuncios') + ' · ' + pct(n, DATOS.ventasUSD);
              },
              afterBody: () => 'n total = ' + DATOS.ventasUSD + ' ventas en USD'
            }
          }),
          zoom: zoomConfig()
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 55,
              minRotation: 55,
              autoSkip: false,
              font: { size: 10 },
              color: PALETA.muted
            },
            title: {
              display: true,
              text: 'Precio (miles de USD)',
              color: PALETA.muted,
              font: { size: 11, weight: '600' }
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 10,
            grid: { color: PALETA.grid },
            ticks: { stepSize: 2, color: PALETA.muted },
            title: {
              display: true,
              text: 'Cantidad de anuncios',
              color: PALETA.muted,
              font: { size: 11, weight: '600' }
            }
          }
        }
      }
    });

    if (charts.chart1) {
      charts.chart1.$stats = true;
      charts.chart1.update();
    }
  }

  function modoGrafica1(mode) {
    const chart = charts.chart1;
    if (!chart) return;
    if (mode === 'p10p90') {
      chart.options.scales.x.min = undefined;
      chart.zoomScale('x', { min: 2.5, max: 13.4 }, 'none');
    } else {
      chart.resetZoom();
    }
    chart.update();
  }

  /* ---------------------------------------------------------
     GRÁFICA 2 · OFERTA POR ZONA
     --------------------------------------------------------- */
  function datosZonas(limit) {
    const sorted = DATOS.zonas.slice().sort((a, b) => a.anuncios - b.anuncios);
    return typeof limit === 'number' ? sorted.slice(-limit) : sorted;
  }

  function crearGrafica2() {
    const zonas = datosZonas();
    const total = DATOS.conZona;

    makeChart('chart2', {
      type: 'bar',
      data: {
        labels: zonas.map((z) => z.nombre),
        datasets: [{
          label: 'Anuncios',
          data: zonas.map((z) => z.anuncios),
          backgroundColor: zonas.map((z) => z.anuncios >= 12 ? PALETA.amber : 'rgba(15, 91, 122, .82)'),
          hoverBackgroundColor: PALETA.teal,
          borderColor: '#ffffff',
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 30
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: animateDuration(1000), easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: tooltipBase({
            callbacks: {
              label: (ctx) => {
                const n = ctx.parsed.x;
                return n + (n === 1 ? ' anuncio' : ' anuncios') + ' · ' + pct(n, total) + ' de las 91 con zona';
              }
            }
          }),
          zoom: zoomConfig()
        },
        scales: {
          x: {
            beginAtZero: true,
            suggestedMax: 28,
            grid: { color: PALETA.grid },
            ticks: { stepSize: 5, color: PALETA.muted },
            title: {
              display: true,
              text: 'Cantidad de anuncios',
              color: PALETA.muted,
              font: { size: 11, weight: '600' }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: PALETA.ink, font: { size: 11.5, weight: '600' } }
          }
        }
      }
    });
  }

  function modoGrafica2(mode) {
    const chart = charts.chart2;
    if (!chart) return;
    const zonas = datosZonas(mode === 'top4' ? 4 : undefined);
    chart.data.labels = zonas.map((z) => z.nombre);
    chart.data.datasets[0].data = zonas.map((z) => z.anuncios);
    chart.data.datasets[0].backgroundColor = zonas.map((z) => z.anuncios >= 12 ? PALETA.amber : 'rgba(15, 91, 122, .82)');
    chart.update();

    const note = document.querySelector('[data-g2-note]');
    if (note) {
      if (mode === 'top4') {
        note.innerHTML = 'Vista filtrada: los 4 barrios principales reúnen <strong>69 de 91</strong> publicaciones con zona (<strong>75,8%</strong>).';
      } else {
        note.innerHTML = 'Los 4 barrios principales reúnen <strong>69 de 91</strong> publicaciones con zona identificada (<strong>75,8%</strong>).';
      }
    }
  }

  /* ---------------------------------------------------------
     GRÁFICA 3 · MEDIA VS MEDIANA POR ZONA
     --------------------------------------------------------- */
  function crearGrafica3() {
    const datos = DATOS.zonasStats.slice().sort((a, b) => a.media - b.media);
    const nPorZona = {};
    datos.forEach((d) => { nPorZona[d.nombre] = d.n; });

    makeChart('chart3', {
      type: 'bar',
      data: {
        labels: datos.map((d) => d.nombre),
        datasets: [
          {
            label: 'Media',
            data: datos.map((d) => d.media),
            backgroundColor: 'rgba(15, 91, 122, .86)',
            hoverBackgroundColor: PALETA.teal,
            borderRadius: 5,
            maxBarThickness: 18
          },
          {
            label: 'Mediana',
            data: datos.map((d) => d.mediana),
            backgroundColor: 'rgba(232, 163, 61, .9)',
            hoverBackgroundColor: PALETA.amberDark,
            borderRadius: 5,
            maxBarThickness: 18
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: animateDuration(1000), easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 6 } },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              color: PALETA.ink,
              font: { size: 11.5, weight: '600' }
            }
          },
          tooltip: tooltipBase({
            callbacks: {
              label: (ctx) => ctx.dataset.label + ': ' + fmtUSD(ctx.parsed.x) + ' USD',
              afterBody: (items) => {
                const zona = items[0].label;
                return 'n = ' + (nPorZona[zona] || '—') + ' anuncios con precio USD';
              }
            }
          }),
          zoom: zoomConfig()
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: PALETA.grid },
            ticks: {
              color: PALETA.muted,
              callback: (v) => '$' + (v / 1000) + 'k'
            },
            title: {
              display: true,
              text: 'Precio (USD)',
              color: PALETA.muted,
              font: { size: 11, weight: '600' }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: PALETA.ink, font: { size: 11.5, weight: '600' } }
          }
        }
      }
    });
  }

  function modoGrafica3(mode) {
    const chart = charts.chart3;
    if (!chart) return;
    chart.data.datasets[0].hidden = mode === 'mediana';
    chart.data.datasets[1].hidden = mode === 'media';
    chart.options.plugins.legend.display = mode === 'both';
    chart.update();

    const note = document.querySelector('[data-g3-note]');
    if (note) {
      if (mode === 'media') {
        note.innerHTML = '<strong>Media</strong>: El Mónaco lidera ($57.667; n = 6), seguido de La Víbora ($49.591; n = 11). Son grupos pequeños: la media es sensible a valores extremos.';
      } else if (mode === 'mediana') {
        note.innerHTML = '<strong>Mediana</strong>: El Sevillano lidera ($36.000; n = 10), seguido de Santa Catalina ($35.000; n = 5) y El Mónaco ($33.000; n = 6). La mediana describe mejor el precio típico.';
      } else {
        note.innerHTML = '<strong>El Mónaco</strong> tiene la media más alta ($57.667; n = 6), pero <strong>El Sevillano</strong> tiene la mediana más alta ($36.000; n = 10). Son grupos pequeños: úsalos como orientación, no como ranking definitivo.';
      }
    }
  }

  /* ---------------------------------------------------------
     GRÁFICA 4 · MONEDA DECLARADA
     --------------------------------------------------------- */
  function crearGrafica4() {
    makeChart('chart4', {
      type: 'doughnut',
      data: {
        labels: ['USD', 'CUP', 'Sin precio'],
        datasets: [{
          data: [DATOS.usd, DATOS.cup, DATOS.sinPrecio],
          backgroundColor: [PALETA.blue, PALETA.amber, PALETA.gray],
          hoverBackgroundColor: ['#14708f', PALETA.amberDark, '#7b8f9b'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        animation: { duration: animateDuration(1200), easing: 'easeOutQuart', animateRotate: true },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              color: PALETA.ink,
              font: { size: 12, weight: '600' }
            }
          },
          tooltip: tooltipBase({
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                return ctx.label + ': ' + ctx.parsed + ' (' + pct(ctx.parsed, total) + ')';
              }
            }
          })
        }
      }
    });

    if (charts.chart4) {
      charts.chart4.$center = { value: '86,9%', label: 'en USD' };
    }
  }

  function modoGrafica4(mode) {
    const chart = charts.chart4;
    if (!chart) return;
    if (mode === 'currency') {
      chart.data.labels = ['USD', 'CUP'];
      chart.data.datasets[0].data = [DATOS.usd, DATOS.cup];
      chart.data.datasets[0].backgroundColor = [PALETA.blue, PALETA.amber];
      chart.$center = { value: '99,1%', label: 'con moneda: USD' };
    } else {
      chart.data.labels = ['USD', 'CUP', 'Sin precio'];
      chart.data.datasets[0].data = [DATOS.usd, DATOS.cup, DATOS.sinPrecio];
      chart.data.datasets[0].backgroundColor = [PALETA.blue, PALETA.amber, PALETA.gray];
      chart.$center = { value: '86,9%', label: 'en USD' };
    }
    chart.update();

    const note = document.querySelector('[data-g4-note]');
    if (note) {
      if (mode === 'currency') {
        note.innerHTML = 'Entre las <strong>107</strong> publicaciones que declaran moneda, <strong>106 son USD (99,1%)</strong> y <strong>1 es CUP (0,9%)</strong>. El único precio en CUP es un alquiler.';
      } else {
        note.innerHTML = 'En todo el universo, <strong>106 de 122</strong> publicaciones están en USD (<strong>86,9%</strong>); 15 no declaran precio y 1 está en CUP.';
      }
    }
  }

  /* ---------------------------------------------------------
     GRÁFICA 5 · OPACIDAD DE INFORMACIÓN
     --------------------------------------------------------- */
  const OPACIDAD = {
    labels: ['Precio + zona', 'Solo precio', 'Solo zona', 'Ninguno'],
    data: [DATOS.conPrecioYZona, DATOS.soloPrecio, DATOS.soloZona, DATOS.ninguno],
    colors: [PALETA.green, PALETA.blue, PALETA.amber, PALETA.coral]
  };

  function crearGrafica5d() {
    makeChart('chart5d', {
      type: 'doughnut',
      data: {
        labels: OPACIDAD.labels.slice(),
        datasets: [{
          data: OPACIDAD.data.slice(),
          backgroundColor: OPACIDAD.colors.slice(),
          hoverBackgroundColor: ['#37b47d', '#14708f', PALETA.amberDark, '#e26864'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        animation: { duration: animateDuration(1200), easing: 'easeOutQuart', animateRotate: true },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              color: PALETA.ink,
              font: { size: 12, weight: '600' }
            }
          },
          tooltip: tooltipBase({
            callbacks: {
              label: (ctx) => ctx.label + ': ' + ctx.parsed + ' (' + pct(ctx.parsed, DATOS.total) + ')'
            }
          })
        }
      }
    });
    if (charts.chart5d) {
      charts.chart5d.$center = { value: '67,2%', label: 'precio + zona' };
    }
  }

  function crearGrafica5b() {
    makeChart('chart5b', {
      type: 'bar',
      data: {
        labels: OPACIDAD.labels.slice(),
        datasets: [{
          label: 'Anuncios',
          data: OPACIDAD.data.slice(),
          backgroundColor: OPACIDAD.colors.slice(),
          hoverBackgroundColor: OPACIDAD.colors.slice(),
          borderRadius: 6,
          maxBarThickness: 64
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: animateDuration(900), easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: tooltipBase({
            callbacks: {
              label: (ctx) => ctx.parsed.y + ' anuncios (' + pct(ctx.parsed.y, DATOS.total) + ' del total)'
            }
          })
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: PALETA.ink, font: { size: 11.5, weight: '600' } }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 90,
            grid: { color: PALETA.grid },
            ticks: { stepSize: 20, color: PALETA.muted },
            title: {
              display: true,
              text: 'Cantidad de anuncios',
              color: PALETA.muted,
              font: { size: 11, weight: '600' }
            }
          }
        }
      }
    });
  }

  function modoGrafica5(mode) {
    const donut = document.querySelector('[data-g5-view="donut"]');
    const bar = document.querySelector('[data-g5-view="bar"]');
    if (!donut || !bar) return;

    if (mode === 'bar') {
      donut.hidden = true;
      bar.hidden = false;
      if (!charts.chart5b) crearGrafica5b();
      else requestAnimationFrame(() => charts.chart5b.resize());
    } else {
      bar.hidden = true;
      donut.hidden = false;
      if (!charts.chart5d) crearGrafica5d();
      else requestAnimationFrame(() => charts.chart5d.resize());
    }

    const note = document.querySelector('[data-g5-note]');
    if (note) {
      note.innerHTML = '<strong>82 de 122 (67,2%)</strong> permiten cruzar precio y zona. <strong>6 (4,9%)</strong> no tienen ninguno de los dos datos. La opacidad no es un detalle: limita la capacidad de comparar.';
    }
  }

  /* ---------------------------------------------------------
     PESTAÑAS INTERACTIVA / ORIGINAL
     --------------------------------------------------------- */
  const chartsPorPanel = {
    'panel-g1-int': 'chart1',
    'panel-g2-int': 'chart2',
    'panel-g3-int': 'chart3',
    'panel-g4-int': 'chart4',
    'panel-g5-int': null
  };

  function initTabs() {
    document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        const card = btn.closest('.graph-card');
        if (!card) return;

        card.querySelectorAll('.tab-btn[data-tab]').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        card.querySelectorAll('.tab-panel[data-panel]').forEach((panel) => {
          const active = panel.dataset.panel === tab;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });

        // Evento GA: cambio de pestaña Interactiva / Original
        const tipo = tab.endsWith('-int') ? 'interactiva' : 'original';
        const num = tab.replace(/^panel-g|-int|-orig$/g, '');
        gaEvent('cambiar_pestana', 'Gráfica ' + num, tipo);

        if (tab.endsWith('-int')) {
          const chartId = chartsPorPanel['panel-' + tab] || null;
          requestAnimationFrame(() => {
            if (chartId && charts[chartId]) charts[chartId].resize();
            if (tab === 'g5-int') {
              const visible = card.querySelector('.chart-wrap:not([hidden]) canvas');
              if (visible && charts[visible.id]) charts[visible.id].resize();
            }
          });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     CONTROLES DE LAS GRÁFICAS
     --------------------------------------------------------- */
  // Eventos de Google Analytics para medir interacciones
  function gaEvent(action, category, label, value) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value || undefined
      });
    }
  }

  function initControls() {
    // Grupos de botones (chips)
    document.querySelectorAll('.control-group').forEach((group) => {
      const chips = Array.from(group.querySelectorAll('.chip-btn'));
      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          chips.forEach((c) => {
            c.classList.toggle('is-active', c === chip);
            c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
          });

          if (chip.dataset.g1Mode) {
            modoGrafica1(chip.dataset.g1Mode);
            gaEvent('filtro_grafica', 'Gráfica 1', chip.dataset.g1Mode);
          }
          if (chip.dataset.g2Mode) {
            modoGrafica2(chip.dataset.g2Mode);
            gaEvent('filtro_grafica', 'Gráfica 2', chip.dataset.g2Mode);
          }
          if (chip.dataset.g3Mode) {
            modoGrafica3(chip.dataset.g3Mode);
            gaEvent('filtro_grafica', 'Gráfica 3', chip.dataset.g3Mode);
          }
          if (chip.dataset.g4Mode) {
            modoGrafica4(chip.dataset.g4Mode);
            gaEvent('filtro_grafica', 'Gráfica 4', chip.dataset.g4Mode);
          }
          if (chip.dataset.g5Mode) {
            modoGrafica5(chip.dataset.g5Mode);
            gaEvent('filtro_grafica', 'Gráfica 5', chip.dataset.g5Mode);
          }
        });
      });
    });

    // Botones de restablecer zoom
    document.querySelectorAll('[data-reset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chart = charts[btn.dataset.reset];
        if (chart && typeof chart.resetZoom === 'function') {
          chart.resetZoom();
          chart.update();
          toast('Zoom restablecido');
          gaEvent('restablecer_zoom', 'Gráfica', btn.dataset.reset);
        }
      });
    });

    // Doble clic para restablecer zoom
    ['chart1', 'chart2', 'chart3'].forEach((id) => {
      const canvas = document.getElementById(id);
      if (canvas) {
        canvas.addEventListener('dblclick', () => {
          if (charts[id] && charts[id].resetZoom) charts[id].resetZoom();
        });
      }
    });
  }

  /* ---------------------------------------------------------
     CONTADORES ANIMADOS
     --------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    if (!Number.isFinite(target)) return;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = reduceMotion ? 0 : 1300;
    const start = performance.now();

    const render = (v) => prefix + fmtNum(v, decimals) + suffix;

    if (duration === 0) {
      el.textContent = render(target);
      return;
    }

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = render(target * eased);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = render(target);
      }
    };
    requestAnimationFrame(frame);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counters.forEach((c) => io.observe(c));
  }

  /* ---------------------------------------------------------
     REVELADO AL HACER SCROLL
     --------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    items.forEach((el) => {
      if (el.dataset.delay) el.style.setProperty('--delay', el.dataset.delay);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     MENÚ MÓVIL
     --------------------------------------------------------- */
  function initMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------------------------------------------------------
     PROGRESO DE LECTURA Y NAVEGACIÓN ACTIVA
     --------------------------------------------------------- */
  function initReadingProgress() {
    const bar = document.getElementById('readingProgress');
    if (!bar) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = (progress * 100).toFixed(2) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map();
    links.forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) map.set(section, link);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-active'));
        const link = map.get(entry.target);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    map.forEach((_link, section) => io.observe(section));
  }

  /* ---------------------------------------------------------
     COMPARTIR
     --------------------------------------------------------- */
  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  function initShare() {
    const buttons = [document.getElementById('shareTop'), document.getElementById('shareBottom')].filter(Boolean);
    if (!buttons.length) return;

    const url = window.location.href;
    const title = 'Mercado inmobiliario digital en Diez de Octubre';
    const text = '122 anuncios verificados, 86,9% en USD y mediana de $21.000. Mira las 5 gráficas interactivas:';

    const share = async () => {
      gaEvent('compartir', 'Web', url);
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        toast('Enlace copiado al portapapeles');
      } catch (err) {
        window.prompt('Copia este enlace para compartir:', url);
      }
    };

    buttons.forEach((btn) => btn.addEventListener('click', share));
  }

  /* ---------------------------------------------------------
     VOLVER ARRIBA
     --------------------------------------------------------- */
  function initBackTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     LIGHTBOX DE IMÁGENES
     --------------------------------------------------------- */
  function initLightbox() {
    const box = document.getElementById('lightbox');
    if (!box) return;

    const stage = document.getElementById('lightboxStage');
    const img = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const captionEl = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');

    const images = Array.from(document.querySelectorAll('img.zoomable'));
    if (!images.length) return;

    let index = 0;
    let scale = 1;
    let tx = 0;
    let ty = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let lastFocus = null;

    const applyTransform = () => {
      img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      img.style.cursor = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default';
    };

    const resetTransform = () => {
      scale = 1;
      tx = 0;
      ty = 0;
      applyTransform();
    };

    const open = (i) => {
      gaEvent('abrir_lightbox', 'Gráfica original', source.dataset.title || 'Gráfica original');
      index = (i + images.length) % images.length;
      const source = images[index];
      const figure = source.closest('figure');
      const caption = figure ? figure.querySelector('figcaption') : null;

      img.src = source.currentSrc || source.src;
      img.alt = source.alt || 'Gráfica ampliada';
      titleEl.textContent = source.dataset.title || (caption ? caption.textContent.trim().slice(0, 90) : 'Gráfica original');
      captionEl.textContent = source.dataset.caption || (caption ? caption.textContent.trim() : '');
      box.hidden = false;
      document.body.classList.add('modal-open');
      resetTransform();
      lastFocus = document.activeElement;
      closeBtn.focus({ preventScroll: true });
    };

    const close = () => {
      box.hidden = true;
      document.body.classList.remove('modal-open');
      resetTransform();
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({ preventScroll: true });
      }
    };

    const step = (delta) => {
      scale = Math.min(4, Math.max(1, +(scale + delta).toFixed(2)));
      if (scale === 1) { tx = 0; ty = 0; }
      applyTransform();
    };

    images.forEach((source, i) => {
      source.addEventListener('click', () => open(i));
      source.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(i);
        }
      });
      if (!source.hasAttribute('tabindex')) source.setAttribute('tabindex', '0');
    });

    closeBtn.addEventListener('click', close);
    zoomIn.addEventListener('click', () => step(0.35));
    zoomOut.addEventListener('click', () => step(-0.35));
    zoomReset.addEventListener('click', resetTransform);
    prevBtn.addEventListener('click', () => open(index - 1));
    nextBtn.addEventListener('click', () => open(index + 1));

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      step(e.deltaY < 0 ? 0.2 : -0.2);
    }, { passive: false });

    stage.addEventListener('pointerdown', (e) => {
      if (scale <= 1) return;
      dragging = true;
      startX = e.clientX - tx;
      startY = e.clientY - ty;
      stage.classList.add('is-dragging');
      stage.setPointerCapture(e.pointerId);
      applyTransform();
    });

    stage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      applyTransform();
    });

    const stopDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      if (e && e.pointerId !== undefined && stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }
      applyTransform();
    };
    stage.addEventListener('pointerup', stopDrag);
    stage.addEventListener('pointercancel', stopDrag);

    box.addEventListener('click', (e) => {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); open(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); open(index + 1); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); step(0.35); }
      else if (e.key === '-') { e.preventDefault(); step(-0.35); }
      else if (e.key === '0') { e.preventDefault(); resetTransform(); }
    });
  }

  /* ---------------------------------------------------------
     INICIALIZACIÓN
     --------------------------------------------------------- */
  function initCharts() {
    if (!window.Chart) {
      const note = document.createElement('p');
      note.className = 'live-note';
      note.textContent = 'No se pudo cargar el motor de gráficas. Puedes ver las imágenes originales en el anexo visual.';
      const section = document.getElementById('graficas');
      if (section) section.prepend(note);
      return;
    }

    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily ||
      'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = PALETA.muted;
    Chart.defaults.borderColor = PALETA.grid;

    Chart.register(meanMedianPlugin, centerTextPlugin);

    crearGrafica1();
    crearGrafica2();
    crearGrafica3();
    crearGrafica4();
    crearGrafica5d();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initTabs();
    initControls();
    initCounters();
    initReveal();
    initMenu();
    initReadingProgress();
    initActiveNav();
    initShare();
    initBackTop();
    initLightbox();

    // Ajuste tras rotar el móvil o cambiar de orientación
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        Object.keys(charts).forEach((id) => {
          const chart = charts[id];
          if (!chart) return;
          const canvas = chart.canvas;
          if (canvas && canvas.offsetParent !== null) chart.resize();
        });
      }, 180);
    });
  });
})();
