import { searchCity } from '../api/geocoding';
import { fetchWeatherForCity } from '../api/weather';
import { loadData, saveData } from '../storage/citiesStorage';
import { ask } from '../presentation/input';
import { showWeather, showError, showLoading } from '../presentation/output';

interface Dependencies {
  ask?: typeof import('../presentation/input').ask;
  searchCity?: typeof import('../api/geocoding').searchCity;
  fetchWeatherForCity?: typeof import('../api/weather').fetchWeatherForCity;
  loadData?: typeof import('../storage/citiesStorage').loadData;
  saveData?: typeof import('../storage/citiesStorage').saveData;
  showError?: typeof import('../presentation/output').showError;
  showLoading?: typeof import('../presentation/output').showLoading;
  showWeather?: typeof import('../presentation/output').showWeather;
}

export async function addCity(deps?: Dependencies): Promise<void> {
  const _ask = deps?.ask ?? ask;
  const _searchCity = deps?.searchCity ?? searchCity;
  const _fetchWeatherForCity = deps?.fetchWeatherForCity ?? fetchWeatherForCity;
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage')).loadData;
  const _saveData = deps?.saveData ?? saveData;
  const _showError = deps?.showError ?? showError;
  const _showLoading = deps?.showLoading ?? showLoading;
  const _showWeather = deps?.showWeather ?? showWeather;

  const cityName = await _ask('Ingresa el nombre de la ciudad: ');

  if (!cityName) {
    _showError('El nombre de la ciudad no puede estar vacío.');
    return;
  }

  _showLoading();

  try {
    const city = await _searchCity(cityName);
    if (!city) {
      _showError(`No se encontró la ciudad: ${cityName}`);
      return;
    }

    const data = await _loadData();

    // Verificar si ya existe
    const exists = data.cities.some((c) => c.toLowerCase() === city.name.toLowerCase());
    if (exists) {
      _showError(`La ciudad "${city.name}" ya está registrada.`);
      return;
    }

    data.cities.push(city.name);
    await _saveData(data);

    // Consultar el clima de la nueva ciudad
    const weather = await _fetchWeatherForCity(city);
    const temperature = weather.current?.temperature_2m ?? null;

    _showWeather(city.name, temperature, city.country);
  } catch (err) {
    _showError(`Error: ${(err as Error).message}`);
  }
}
