// server.js
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = "8539e0be0f9f4fec91c134528251911";

app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
  const location = req.query.location || 'auto:ip';
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));