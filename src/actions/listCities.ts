import { searchCity } from '../api/geocoding.js';
import { fetchWeatherForCity } from '../api/weather.js';
import { loadData } from '../storage/citiesStorage.js';
import { showError } from '../presentation/output.js';

interface Dependencies {
  searchCity?: typeof import('../api/geocoding.js').searchCity;
  fetchWeatherForCity?: typeof import('../api/weather.js').fetchWeatherForCity;
  loadData?: typeof import('../storage/citiesStorage.js').loadData;
  showError?: typeof import('../presentation/output.js').showError;
}

export async function listCities(deps?: Dependencies): Promise<void> {
  const _searchCity = deps?.searchCity ?? searchCity;
  const _fetchWeatherForCity = deps?.fetchWeatherForCity ?? fetchWeatherForCity;
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage.js')).loadData;
  const _showError = deps?.showError ?? showError;

  const data = await _loadData();

  if (data.cities.length === 0) {
    _showError('No hay ciudades registradas.');
    return;
  }

  console.clear();
  console.log('══════════════════════════════════════');
  console.log('          TODAS LAS CIUDADES');
  console.log('══════════════════════════════════════');

  for (const cityName of data.cities) {
    try {
      const city = await _searchCity(cityName);
      if (!city) continue;

      const weather = await _fetchWeatherForCity(city);
      const temperature = weather.current?.temperature_2m ?? null;

      if (temperature !== null && temperature !== undefined) {
        console.log(`  🌤️  ${city.name}${city.country ? ', ' + city.country : ''}: ${temperature}°C`);
      } else {
        console.log(`  ❌ ${city.name}: No se pudo obtener la temperatura`);
      }
    } catch {
      console.log(`  ❌ ${cityName}: Error al consultar`);
    }
  }

  console.log('══════════════════════════════════════');
  console.log('Presiona Enter para continuar...');
}
