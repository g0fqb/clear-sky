document.getElementById('forecastBtn').addEventListener('click', getForecast);

//import { getSunTimes, getMoonPhase } from './astro.js';


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

getUserLocation(async (lat, lng) => {
  const sunTimes = await getSunTimes(lat, lng);
  const moonPhase = getMoonPhase();

  document.getElementById("astro-info").innerHTML = `
    <p>🌅 Sunrise: ${sunTimes.sunrise.toLocaleTimeString()}</p>
    <p>🌇 Sunset: ${sunTimes.sunset.toLocaleTimeString()}</p>
    <p>🌙 Moon Phase: ${moonPhase}</p>
  `;
});

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
  const newMoon = new Date(1970, 0, 7, 20, 35, 0); // known new moon
  const phase = ((date.getTime() - newMoon.getTime()) / 1000) % lp;
  const phaseIndex = Math.floor((phase / lp) * 8); // 0–7 phases

  const phases = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent"
  ];

  return phases[phaseIndex];
}


getUserLocation(async (lat, lng) => {
  const sunTimes = await getSunTimes(lat, lng);
  const moonPhase = getMoonPhase();

  document.getElementById("astro-info").innerHTML = `
    <p>🌅 Sunrise: ${sunTimes.sunrise.toLocaleTimeString()}</p>
    <p>🌇 Sunset: ${sunTimes.sunset.toLocaleTimeString()}</p>
    <p>🌙 Moon Phase: ${moonPhase}</p>
  `;
});


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
    const apiKey = '2413a7da0cb67ef8937d4eabb6a1d76e'; // Your working key

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.list || !Array.isArray(data.list)) {
        forecastDiv.innerHTML = `<p>Forecast data is missing or malformed.</p>`;
        return;
      }

      const tonightHours = data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getDate() === now.getDate() && itemDate.getHours() >= 18 && itemDate.getHours() <= 23;
      });

      if (tonightHours.length === 0) {
        forecastDiv.innerHTML = `<p>No forecast data available for tonight.</p>`;
        return;
      }

const labels = tonightHours.map(item =>
  new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
);

const cloudData = tonightHours.map(item =>
  typeof item.clouds === 'number' ? item.clouds : item.clouds?.all ?? 0
);

const ctx = document.getElementById('cloudChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Cloud Cover (%)',
      data: cloudData,
      borderColor: 'skyblue',
      backgroundColor: 'rgba(135,206,235,0.2)',
      fill: true,
      tension: 0.3
    }]
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


const cloudSummary = tonightHours.map(item => {
const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const cloudCover = typeof item.clouds === 'number' ? item.clouds : item.clouds?.all ?? 'N/A';
return `<li>${time}: ${cloudCover}% cloud cover</li>`;       
}).join('');

      forecastDiv.innerHTML = `
        <h2>Tonight's Forecast</h2>
        <ul>${cloudSummary}</ul>
      `;
    } catch (error) {
      console.error("Fetch error:", error);
      forecastDiv.innerHTML = `<p>Error fetching forecast: ${error.message}</p>`;
    }
  }, error => {
    forecastDiv.innerHTML = `<p>Location access denied: ${error.message}</p>`;
  });
}


// Optional: Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
