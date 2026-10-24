import { searchCity } from '../api/geocoding.js';
import { fetchWeatherForCity } from '../api/weather.js';
import { loadData } from '../storage/citiesStorage.js';
import { showError, showLoading } from '../presentation/output.js';
import { showWeather } from '../presentation/output.js';

interface Dependencies {
  loadData?: typeof import('../storage/citiesStorage.js').loadData;
  searchCity?: typeof import('../api/geocoding.js').searchCity;
  fetchWeatherForCity?: typeof import('../api/weather.js').fetchWeatherForCity;
  showError?: typeof import('../presentation/output.js').showError;
  showLoading?: typeof import('../presentation/output.js').showLoading;
  showWeather?: typeof import('../presentation/output.js').showWeather;
}

export async function getWeather(deps?: Dependencies): Promise<void> {
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage.js')).loadData;
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
