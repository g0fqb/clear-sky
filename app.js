document.getElementById('forecastBtn').addEventListener('click', getForecast);

// Astronomy helpers
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        callback(lat, lng);
      },
      () => {
        callback(53.15, -1.20); // fallback: Sherwood Observatory
      }
    );
  } else {
    callback(53.15, -1.20);
  }
}

// Declare chart variable in a scope accessible to your forecast function
let cloudChart = null;

function renderCloudChart(forecastData, moonIllumination) {
  const ctx = document.getElementById('cloudChart').getContext('2d');

  // Destroy previous chart if it exists
  if (cloudChart) {
    cloudChart.destroy();
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
          label: `Moon Illumination (${moonIllumination}%)`,
          data: Array(forecastData.labels.length).fill(moonIllumination),
          type: 'line',
          borderColor: 'yellow',
          borderWidth: 2,
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Tonight's Cloud Cover Forecast",
          color: 'white'
        }
      },
      scales: {
        x: { ticks: { color: 'white' } },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: 'white' }
        }
      }
    }
  });
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
  const lp = 2551443; // lunar period in seconds
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

// Show astronomy info immediately
getUserLocation(async (lat, lng) => {
  const sunTimes = await getSunTimes(lat, lng);
  const moonPhase = getMoonPhase();
  document.getElementById("astro-info").innerHTML = `
    <p>🌅 Sunrise: ${sunTimes.sunrise.toLocaleTimeString()}</p>
    <p>🌇 Sunset: ${sunTimes.sunset.toLocaleTimeString()}</p>
    <p>🌙 Moon Phase: ${moonPhase}</p>
  `;
});

// Button to refresh astronomy info
document.getElementById('astroBtn').addEventListener('click', () => {
  getUserLocation(async (lat, lng) => {
    const sunTimes = await getSunTimes(lat, lng);
    const moonPhase = getMoonPhase();
    document.getElementById("astro-info").innerHTML = `
      <p>🌅 Sunrise: ${sunTimes.sunrise.toLocaleTimeString()}</p>
      <p>🌇 Sunset: ${sunTimes.sunset.toLocaleTimeString()}</p>
      <p>🌙 Moon Phase: ${moonPhase}</p>
    `;
  });
});

// Forecast + chart
async function getForecast() {
  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = "<p>Loading forecast...</p>";

  if (!navigator.geolocation) {
    forecastDiv.innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = '2413a7da0cb67ef8937d4eabb6a1d76e';

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

      // Moon illumination
      const moonIllumination = getMoonIllumination();

      // Prepare forecast data object
      const forecastData = {
        labels,
        values: cloudData,
        barColors
      };

      // Render chart
      forecastDiv.innerHTML = "<canvas id='cloudChart'></canvas>";
      renderCloudChart(forecastData, moonIllumination);

    } catch (err) {
      forecastDiv.innerHTML = `<p>Error fetching forecast: ${err.message}</p>`;
    }
  });
}


let cloudChartInstance; // global or scoped variable
// latest code
function renderCloudChart(data) {
  // If a chart already exists, destroy it
  if (cloudChartInstance) {
    cloudChartInstance.destroy();
  }

  const ctx = document.getElementById('cloudChart').getContext('2d');
  cloudChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Cloud Cover',
        data: data.values,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
