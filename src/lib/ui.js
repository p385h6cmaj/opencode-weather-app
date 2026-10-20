const readline = require('readline');
const { cyan, yellow, green, red, bold } = require('./colors');

// ─── Lectura de entrada ──────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// ─── Helpers de visualización ────────────────────────────────────

const SEPARATOR = cyan('══════════════════════════════════════');

function showWeather(cityName, temperature, country = '') {
  console.clear();
  console.log(SEPARATOR);
  console.log(cyan(`  🌤️  Clima en ${cityName}${country ? ', ' + country : ''}`));
  console.log(SEPARATOR);
  if (temperature !== null && temperature !== undefined) {
    console.log(`  Temperatura: ${yellow(`${temperature}°C`)}`);
  } else {
    console.log(red('  No se pudo obtener la temperatura.'));
  }
  console.log(SEPARATOR);
  console.log('Presiona Enter para continuar...');
}

function showSuccess(message) {
  console.clear();
  console.log(SEPARATOR);
  console.log(green(`  ${message}`));
  console.log(SEPARATOR);
  console.log('Presiona Enter para continuar...');
}

function showError(message) {
  console.clear();
  console.log(SEPARATOR);
  console.log(red(`  ❌ ${message}`));
  console.log(SEPARATOR);
  console.log('Presiona Enter para continuar...');
}

function showLoading() {
  console.clear();
  console.log(SEPARATOR);
  console.log(yellow('  ⏳ Consultando el clima...'));
  console.log(SEPARATOR);
}

function printForecastTable(forecast, cityName) {
  const { daily, daily_units } = forecast;
  if (!daily || !daily.time) return;

  for (let i = 0; i < daily.time.length; i++) {
    const dateStr = daily.time[i];
    const minTemp = daily.temperature_2m_min?.[i] != null ? `${daily.temperature_2m_min[i]}°` : '—';
    const maxTemp = daily.temperature_2m_max?.[i] != null ? `${daily.temperature_2m_max[i]}°` : '—';
    const precip = daily.precipitation_probability_max?.[i] != null ? `${daily.precipitation_probability_max[i]}%` : '—';
    const wind = daily.wind_speed_10m_max?.[i] != null ? `${daily.wind_speed_10m_max[i]} km/h` : '—';

    // Formatear nombre del día
    const dateObj = new Date(dateStr + 'T00:00:00');
    const diaSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dateObj.getDay()];
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
    const diaMes = String(dateObj.getDate()).padStart(2, '0');

    console.log(`  ${bold(`${cityName}`)}        | ${bold(`${diaSemana} ${mes}/${diaMes}`)}   | ${minTemp.padStart(4)} | ${maxTemp.padStart(4)} | ${precip.padStart(8)} | ${wind}`);
  }

  console.log(SEPARATOR);
  console.log('');
}

module.exports = { ask, showWeather, showSuccess, showError, showLoading, printForecastTable, rl, SEPARATOR };
