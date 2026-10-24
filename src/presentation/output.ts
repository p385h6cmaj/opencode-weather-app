import { cyan, yellow, green, red, bold } from '../utils/colors.js';
import { SEPARATOR } from '../utils/constants.js';
import { formatDayName, formatDayDate } from '../utils/format.js';
import { WeatherResponse } from '../types/Weather.js';

export function showWeather(cityName: string, temperature: number | null, country: string = ''): void {
  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(cyan(`  🌤️  Clima en ${cityName}${country ? ', ' + country : ''}`));
  console.log(cyan(SEPARATOR));
  if (temperature !== null && temperature !== undefined) {
    console.log(`  Temperatura: ${yellow(`${temperature}°C`)}`);
  } else {
    console.log(red('  No se pudo obtener la temperatura.'));
  }
  console.log(cyan(SEPARATOR));
  console.log('Presiona Enter para continuar...');
}

export function showSuccess(message: string): void {
  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(green(`  ${message}`));
  console.log(cyan(SEPARATOR));
  console.log('Presiona Enter para continuar...');
}

export function showError(message: string): void {
  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(red(`  ❌ ${message}`));
  console.log(cyan(SEPARATOR));
  console.log('Presiona Enter para continuar...');
}

export function showLoading(): void {
  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(yellow('  ⏳ Consultando el clima...'));
  console.log(cyan(SEPARATOR));
}

export function printForecastTable(forecast: WeatherResponse, cityName: string): void {
  const daily = forecast.daily;
  if (!daily || !daily.time) return;

  for (let i = 0; i < daily.time.length; i++) {
    const minTemp = daily.temperature_2m_min?.[i] != null ? `${daily.temperature_2m_min[i]}°` : '—';
    const maxTemp = daily.temperature_2m_max?.[i] != null ? `${daily.temperature_2m_max[i]}°` : '—';
    const precip = daily.precipitation_probability_max?.[i] != null ? `${daily.precipitation_probability_max[i]}%` : '—';
    const wind = daily.wind_speed_10m_max?.[i] != null ? `${daily.wind_speed_10m_max[i]} km/h` : '—';

    const diaSemana = formatDayName(daily.time[i]);
    const mesDia = formatDayDate(daily.time[i]);

    console.log(`  ${bold(cityName)}        | ${bold(`${diaSemana} ${mesDia}`)}   | ${minTemp.padStart(4)} | ${maxTemp.padStart(4)} | ${precip.padStart(8)} | ${wind}`);
  }

  console.log(cyan(SEPARATOR));
  console.log('');
}
