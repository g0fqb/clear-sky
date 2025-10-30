async function getForecast() {
  const forecastDiv = document.getElementById('forecast');
  const lat = 53.1386; // Matlock latitude
  const lon = -1.5561; // Matlock longitude
  const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const now = new Date();
    const tonightHours = data.hourly.filter(hour => {
      const hourDate = new Date(hour.dt * 1000);
      return hourDate.getDate() === now.getDate() && hourDate.getHours() >= 18;
    });

    const cloudSummary = tonightHours.map(hour => {
      const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `<li>${time}: ${hour.clouds}% cloud cover</li>`;
    }).join('');

    const moonPhase = data.current.moon_phase;
    const moonDescription = getMoonPhaseDescription(moonPhase);

    forecastDiv.innerHTML = `
      <h2>Tonight's Forecast</h2>
      <ul>
        ${cloudSummary}
        <li>Moon Phase: ${moonDescription}</li>
      </ul>
    `;
  } catch (error) {
    forecastDiv.innerHTML = `<p>Error fetching forecast: ${error.message}</p>`;
  }
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