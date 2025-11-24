// -------------------- DOM Ready --------------------
document.addEventListener('DOMContentLoaded', () => {
  const forecastBtn = document.getElementById('forecastBtn');
  const astroBtn = document.getElementById('astroBtn');

  if (forecastBtn) forecastBtn.addEventListener('click', getForecast);
  if (astroBtn) astroBtn.addEventListener('click', refreshAstronomyInfo);

  // Show astronomy info immediately on load
  getUserLocation(async (lat, lng) => {
    const sunTimes = await getSunTimes(lat, lng);
    const moonPhase = getMoonPhase();

    document.getElementById("astro-info").innerHTML = `
      <p>🌅 Sunrise: ${sunTimes.sunrise.toLocaleTimeString()}</p>
      <p>🌇 Sunset: ${sunTimes.sunset.toLocaleTimeString()}</p>
      <p>🌙 Moon Phase: ${moonPhase}</p>
    `;
    renderMoonTimeline();
  });
});

// -------------------- Astronomy Helpers --------------------
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => callback(pos.coords.latitude, pos.coords.longitude),
      () => callback(53.15, -1.20) // fallback: Sherwood Observatory
    );
  } else {
    callback(53.15, -1.20);
  }
}

async function getSunTimes(lat, lng) {
  const res = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
  );
  const data = await res.json();
  return {
    sunrise: new Date(data.results.sunrise),
    sunset: new Date(data.results.sunset)
  };
}

function getMoonPhase(date = new Date()) {
  const lp = 2551443;
  const newMoon = new Date(1970, 0, 7, 20, 35, 0);
  const phase = ((date.getTime() - newMoon.getTime()) / 1000) % lp;
  const phaseIndex = Math.floor((phase / lp) * 8);
  const phases = [
    "New Moon","Waxing Crescent","First Quarter","Waxing Gibbous",
    "Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"
  ];
  return phases[phaseIndex];
}

function getMoonIllumination(date = new Date()) {
  const lp = 2551443;
  const newMoon = new Date(1970, 0, 7, 20, 35, 0);
  const phase = ((date.getTime() - newMoon.getTime()) / 1000) % lp;
  const illumination = (1 - Math.cos((2 * Math.PI * phase) / lp)) / 2;
  return Math.round(illumination * 100);
}
// -------------------- Moon Timeline Chart --------------------
function renderMoonTimeline() {
  const container = document.getElementById("moon-timeline");
  if (!container) return;

  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "moonTimelineChart";
  container.appendChild(canvas);

  const days = [...Array(7).keys()].map(i => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const labels = days.map(d => d.toLocaleDateString([], { weekday: "short" }));
  const values = days.map(d => getMoonIllumination(d));

  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Moon Illumination (%)",
        data: values,
        borderColor: "yellow",
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Moon Illumination Over Next 7 Days",
          color: "white"
        }
      },
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: "white" } },
        x: { ticks: { color: "white" } }
      }
    }
  });
}
// -------------------- Forecast Chart Logic --------------------
let cloudChart = null;

function renderCloudChart(forecastData, moonIllumination) {
  const canvas = document.getElementById('cloudChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (cloudChart) {
    cloudChart.destroy();
    cloudChart = null;
  }

  cloudChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: forecastData.labels,
      datasets: [
        {
          label: 'Cloud Cover (%)',
          data: forecastData.values,
          backgroundColor: forecastData.barColors,
          borderColor: 'skyblue',
          borderWidth: 1
        },
        {
          label: 'Moon Illumination',
          data: Array(forecastData.labels.length).fill(moonIllumination),
          type: 'line',
          borderColor: 'yellow',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          datalabels: {
            display: true,
            align: 'top',
            color: 'yellow',
            formatter: () => `${moonIllumination}%`
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Tonight's Cloud Cover Forecast",
          color: 'white'
        },
        datalabels: { display: true },
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { ticks: { color: 'white' } },
        y: { beginAtZero: true, max: 100, ticks: { color: 'white' } }
      }
    },
    plugins: [ChartDataLabels]
  });
}
// -------------------- Astronomy Info --------------------
function refreshAstronomyInfo() {
  getUserLocation(async (lat, lng) => {
    const sunTimes = await getSunTimes(lat, lng);
    const moonPhase = getMoonPhase();

    const astroInfo = document.getElementById("astro-info");
    if (astroInfo) {
      astroInfo.innerHTML = `
        <p>🌅 Sunrise: ${sunTimes.sunrise.toLocaleTimeString()}</p>
        <p>🌇 Sunset: ${sunTimes.sunset.toLocaleTimeString()}</p>
        <p>🌙 Moon Phase: ${moonPhase}</p>
      `;
    }

    renderMoonTimeline(); // re-draw timeline when refreshed
  });
}
// -------------------- Forecast + Chart --------------------
async function getForecast() {
  const forecastDiv = document.getElementById('forecast');
  if (!forecastDiv) return;

  forecastDiv.innerHTML = "<p>Loading forecast...</p>";

  if (!navigator.geolocation) {
    forecastDiv.innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = 'YOUR_OPENWEATHERMAP_KEY';

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.list || !Array.isArray(data.list)) {
        forecastDiv.innerHTML = `<p>Forecast data is missing or malformed.</p>`;
        return;
      }

      const now = new Date();
      const localDate = now.getDate();

      // Forecast window: 18:00 tonight → 02:00 tomorrow
      const forecastWindow = data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        const itemLocalDate = itemDate.getDate();
        const itemHour = itemDate.getHours();
        return (
          (itemLocalDate === localDate && itemHour >= 18) ||
          (itemLocalDate === localDate + 1 && itemHour <= 2)
        );
      });

      if (forecastWindow.length === 0) {
        forecastDiv.innerHTML = `<p>No forecast data available for tonight.</p>`;
        return;
      }

      const labels = forecastWindow.map(item =>
        new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      const cloudData = forecastWindow.map(item =>
        typeof item.clouds === 'number' ? item.clouds : item.clouds?.all ?? 0
      );

      // Highlight clearest hour
      const minCloudIndex = cloudData.indexOf(Math.min(...cloudData));
      const barColors = cloudData.map((val, idx) =>
        idx === minCloudIndex ? 'rgba(50,205,50,0.8)' : 'rgba(135,206,235,0.6)'
      );

      const moonIllumination = getMoonIllumination();
      const forecastData = { labels, values: cloudData, barColors };

      // Use persistent canvas
      forecastDiv.innerHTML = "";
      const canvas = document.createElement("canvas");
      canvas.id = "cloudChart";
      forecastDiv.appendChild(canvas);

      renderCloudChart(forecastData, moonIllumination);

    } catch (err) {
      forecastDiv.innerHTML = `<p>Error fetching forecast: ${err.message}</p>`;
    }
  }, (error) => {
    forecastDiv.innerHTML = `<p>Geolocation error: ${error.message}</p>`;
  });
}
// -------------------- Service Worker --------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
