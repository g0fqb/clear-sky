// astro.js

export async function getSunTimes(lat, lng) {
  const res = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
  );
  const data = await res.json();
  return {
    sunrise: new Date(data.results.sunrise),
    sunset: new Date(data.results.sunset)
  };
}

export function getMoonPhase(date = new Date()) {
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
