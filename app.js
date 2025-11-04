document.getElementById('forecastBtn').addEventListener('click', getForecast);

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

      const now = new Date();
      const tonightHours = data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getDate() === now.getDate() && itemDate.getHours() >= 18;
      });

      if (tonightHours.length === 0) {
        forecastDiv.innerHTML = `<p>No forecast data available for tonight.</p>`;
        return;
      }

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
