import { searchCity } from '../api/geocoding';
import { fetchWeatherForCity } from '../api/weather';
import { loadData } from '../storage/citiesStorage';
import { showError, showLoading } from '../presentation/output';
import { showWeather } from '../presentation/output';

interface Dependencies {
  loadData?: typeof import('../storage/citiesStorage').loadData;
  searchCity?: typeof import('../api/geocoding').searchCity;
  fetchWeatherForCity?: typeof import('../api/weather').fetchWeatherForCity;
  showError?: typeof import('../presentation/output').showError;
  showLoading?: typeof import('../presentation/output').showLoading;
  showWeather?: typeof import('../presentation/output').showWeather;
}

export async function getWeather(deps?: Dependencies): Promise<void> {
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage')).loadData;
  const _searchCity = deps?.searchCity ?? searchCity;
  const _fetchWeatherForCity = deps?.fetchWeatherForCity ?? fetchWeatherForCity;
  const _showError = deps?.showError ?? showError;
  const _showLoading = deps?.showLoading ?? showLoading;
  const _showWeather = deps?.showWeather ?? showWeather;

  const data = await _loadData();

  if (!data.defaultCity) {
    _showError('No hay ciudad default configurada.');
    return;
  }

  _showLoading();

  try {
    const city = await _searchCity(data.defaultCity);
    if (!city) {
      _showError(`No se encontró la ciudad: ${data.defaultCity}`);
      return;
    }

    const weather = await _fetchWeatherForCity(city);
    const temperature = weather.current?.temperature_2m ?? null;

    _showWeather(city.name, temperature, city.country);
  } catch (err) {
    _showError(`Error: ${(err as Error).message}`);
  }
}
