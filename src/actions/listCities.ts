import { searchCity } from '../api/geocoding';
import { fetchWeatherForCity } from '../api/weather';
import { loadData } from '../storage/citiesStorage';
import { showError } from '../presentation/output';

export async function listCities(): Promise<void> {
  const data = await loadData();

  if (data.cities.length === 0) {
    showError('No hay ciudades registradas.');
    return;
  }

  console.clear();
  console.log('══════════════════════════════════════');
  console.log('          TODAS LAS CIUDADES');
  console.log('══════════════════════════════════════');

  for (const cityName of data.cities) {
    try {
      const city = await searchCity(cityName);
      if (!city) continue;

      const weather = await fetchWeatherForCity(city);
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
