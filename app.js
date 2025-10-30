async function getForecast() {
  const forecastDiv = document.getElementById('forecast');

  if (!navigator.geolocation) {
    forecastDiv.innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = '9de285199f14e6e87b3105318bf7f669'; // Replace with your OpenWeatherMap key

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;
    console.log(url;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
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
  }, error => {
    forecastDiv.innerHTML = `<p>Location access denied: ${error.message}</p>`;
  });
}