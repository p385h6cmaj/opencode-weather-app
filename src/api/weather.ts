import { FORECAST_API } from '../utils/constants';
import { WeatherResponse } from '../types/Weather';
import { City } from '../types/City';

export async function getWeather(
  latitude: number,
  longitude: number,
  dailyParams: string | null = null,
): Promise<WeatherResponse> {
  const url = new URL(FORECAST_API);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('current', 'temperature_2m');

  if (dailyParams) {
    url.searchParams.set('daily', dailyParams);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error en la API del clima: ${response.status}`);
  }

  return response.json();
}

export async function fetchWeatherForCity(city: City): Promise<WeatherResponse> {
  return getWeather(city.latitude, city.longitude);
}
