import { searchCity } from '../api/geocoding';
import { fetchWeatherForCity } from '../api/weather';
import { loadData } from '../storage/citiesStorage';
import { showError } from '../presentation/output';

interface Dependencies {
  searchCity?: typeof import('../api/geocoding').searchCity;
  fetchWeatherForCity?: typeof import('../api/weather').fetchWeatherForCity;
  loadData?: typeof import('../storage/citiesStorage').loadData;
  showError?: typeof import('../presentation/output').showError;
}

export async function listCities(deps?: Dependencies): Promise<void> {
  const _searchCity = deps?.searchCity ?? searchCity;
  const _fetchWeatherForCity = deps?.fetchWeatherForCity ?? fetchWeatherForCity;
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage')).loadData;
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
