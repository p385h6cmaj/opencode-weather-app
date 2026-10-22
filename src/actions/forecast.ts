import { searchCity } from '../api/geocoding';
import { getWeather } from '../api/weather';
import { loadData } from '../storage/citiesStorage';
import { printForecastTable, showError } from '../presentation/output';
import { cyan, yellow, bold } from '../utils/colors';
import { SEPARATOR } from '../utils/constants';

interface Dependencies {
  searchCity?: typeof import('../api/geocoding').searchCity;
  getWeather?: typeof import('../api/weather').getWeather;
  loadData?: typeof import('../storage/citiesStorage').loadData;
  showError?: typeof import('../presentation/output').showError;
}

export async function forecast(deps?: Dependencies): Promise<void> {
  const _searchCity = deps?.searchCity ?? searchCity;
  const _getWeather = deps?.getWeather ?? getWeather;
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage')).loadData;
  const _showError = deps?.showError ?? showError;

  const data = await _loadData();

  if (!data.defaultCity && data.cities.length === 0) {
    _showError('No hay ciudades configuradas. Agrega al menos una ciudad primero.');
    return;
  }

  // Determinar qué ciudades consultar
  const citiesToQuery = data.cities.length > 0 ? data.cities : [data.defaultCity];

  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(cyan('          PRONÓSTICO 7 DÍAS'));
  console.log(cyan(SEPARATOR));
  console.log(bold(`  ${yellow('Ciudad')}           | ${yellow('Día')}            | ${yellow('Mín')}  | ${yellow('Máx')}  | ${yellow('Precip.')}  | ${yellow('Viento')}`));
  console.log(cyan('  ───────────────┼───────────────┼──────┼──────┼──────────┼────────'));

  try {
    for (const cityName of citiesToQuery) {
      const city = await _searchCity(cityName);
      if (!city) {
        console.log(`\n  ⚠️  No se encontró la ciudad: ${cityName}\n`);
        continue;
      }

      const dailyParams = 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max';
      const forecastData = await _getWeather(city.latitude, city.longitude, dailyParams);
      printForecastTable(forecastData, city.name);
    }

    console.log('Presiona Enter para continuar...');
  } catch (err) {
    _showError(`Error: ${(err as Error).message}`);
  }
}
