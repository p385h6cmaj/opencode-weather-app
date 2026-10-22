import { searchCity } from '../api/geocoding';
import { fetchWeatherForCity } from '../api/weather';
import { loadData, saveData } from '../storage/citiesStorage';
import { ask } from '../presentation/input';
import { showWeather, showError, showLoading } from '../presentation/output';

export async function addCity(): Promise<void> {
  const cityName = await ask('Ingresa el nombre de la ciudad: ');

  if (!cityName) {
    showError('El nombre de la ciudad no puede estar vacío.');
    return;
  }

  showLoading();

  try {
    const city = await searchCity(cityName);
    if (!city) {
      showError(`No se encontró la ciudad: ${cityName}`);
      return;
    }

    const data = await loadData();

    // Verificar si ya existe
    const exists = data.cities.some((c) => c.toLowerCase() === city.name.toLowerCase());
    if (exists) {
      showError(`La ciudad "${city.name}" ya está registrada.`);
      return;
    }

    data.cities.push(city.name);
    await saveData(data);

    // Consultar el clima de la nueva ciudad
    const weather = await fetchWeatherForCity(city);
    const temperature = weather.current?.temperature_2m ?? null;

    showWeather(city.name, temperature, city.country);
  } catch (err) {
    showError(`Error: ${(err as Error).message}`);
  }
}
