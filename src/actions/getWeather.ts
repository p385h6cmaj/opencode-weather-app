import { searchCity } from '../api/geocoding';
import { fetchWeatherForCity } from '../api/weather';
import { loadData } from '../storage/citiesStorage';
import { showError, showLoading } from '../presentation/output';
import { showWeather } from '../presentation/output';

export async function getWeather(): Promise<void> {
  const data = await loadData();

  if (!data.defaultCity) {
    showError('No hay ciudad default configurada.');
    return;
  }

  showLoading();

  try {
    const city = await searchCity(data.defaultCity);
    if (!city) {
      showError(`No se encontró la ciudad: ${data.defaultCity}`);
      return;
    }

    const weather = await fetchWeatherForCity(city);
    const temperature = weather.current?.temperature_2m ?? null;

    showWeather(city.name, temperature, city.country);
  } catch (err) {
    showError(`Error: ${(err as Error).message}`);
  }
}
