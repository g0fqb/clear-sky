async function getForecast() {
  const forecastDiv = document.getElementById('forecast');

  if (!navigator.geolocation) {
    forecastDiv.innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;

    try {
//      const response = await fetch(url); //
      fetch('/api/weather?location=auto:ip');
      const data = await response.json();

      console.log("Full API response:", data);

      if (!data || typeof data !== 'object') {
        forecastDiv.innerHTML = `<p>Unexpected response format. Please check your API key and endpoint.</p>`;
        return;
      }

      if (!Array.isArray(data.hourly)) {
        forecastDiv.innerHTML = `<p>Hourly forecast data is missing. This may be due to an invalid API key or unsupported location.</p>`;
        return;
      }

      const now = new Date();
      const tonightHours = data.hourly.filter(hour => {
        const hourDate = new Date(hour.dt * 1000);
        return hourDate.getDate() === now.getDate() && hourDate.getHours() >= 18;
      });

      const cloudSummary = tonightHours.map(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<li>${time}: ${hour.clouds}% cloud cover</li>`;
      }).join('');

      const moonPhase = data.daily?.[0]?.moon_phase ?? null;
      const moonDescription = moonPhase !== null ? getMoonPhaseDescription(moonPhase) : "Unavailable";

      forecastDiv.innerHTML = `
        <h2>Tonight's Forecast</h2>
        <ul>
          ${cloudSummary}
          <li>Moon Phase: ${moonDescription}</li>
        </ul>
      `;
    } catch (error) {
      console.error("Fetch error:", error);
      forecastDiv.innerHTML = `<p>Error fetching forecast: ${error.message}</p>`;
    }
  }, error => {
    forecastDiv.innerHTML = `<p>Location access denied: ${error.message}</p>`;
  });
}

function getMoonPhaseDescription(phase) {
  if (phase === 0 || phase === 1) return "New Moon";
  if (phase < 0.25) return "Waxing Crescent";
  if (phase === 0.25) return "First Quarter";
  if (phase < 0.5) return "Waxing Gibbous";
  if (phase === 0.5) return "Full Moon";
  if (phase < 0.75) return "Waning Gibbous";
  if (phase === 0.75) return "Last Quarter";
  return "Waning Crescent";
}