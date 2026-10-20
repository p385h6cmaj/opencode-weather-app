const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

async function geocodeCity(cityName) {
  const url = new URL(GEOCODING_API);
  url.searchParams.set('name', cityName);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'es');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error en la API de geocodificación: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function getWeather(latitude, longitude, dailyParams = null) {
  const url = new URL(FORECAST_API);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current', 'temperature_2m');

  if (dailyParams) {
    url.searchParams.set('daily', dailyParams);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error en la API del clima: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function searchCity(cityName) {
  const result = await geocodeCity(cityName);

  if (!result.results || result.results.length === 0) {
    return null;
  }

  const city = result.results[0];
  return {
    name: city.name,
    country: city.country || '',
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

async function fetchWeatherForCity(cityInfo) {
  const weatherData = await getWeather(cityInfo.latitude, cityInfo.longitude);
  return weatherData;
}

module.exports = { geocodeCity, getWeather, searchCity, fetchWeatherForCity };
