#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

// ─── Configuración ───────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data', 'cities.json');
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

// ─── Manejo de datos ─────────────────────────────────────────────

async function loadData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { defaultCity: null, cities: [] };
  }
}

async function saveData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ─── Llamadas a la API ───────────────────────────────────────────

async function geocodeCity(cityName) {
  const url = new URL(GEOCODING_API);
  url.searchParams.set('name', cityName);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'es');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error en la API de geocodificación: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function getWeather(latitude, longitude) {
  const url = new URL(FORECAST_API);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current', 'temperature_2m');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error en la API del clima: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function searchCity(cityName) {
  const result = await geocodeCity(cityName);

  if (!result.results || result.results.length === 0) {
    return null;
  }

  const city = result.results[0];
  return {
    name: city.name,
    country: city.country || '',
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

async function fetchWeatherForCity(cityInfo) {
  const weatherData = await getWeather(cityInfo.latitude, cityInfo.longitude);
  return weatherData;
}

// ─── Interfaz de usuario ─────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function printMenu() {
  console.clear();
  console.log('══════════════════════════════════════');
  console.log('          WEATHER CLI');
  console.log('══════════════════════════════════════');
  console.log('  1. Clima de ciudad default');
  console.log('  2. Clima de todas las ciudades (0)');
  console.log('  3. Buscar y agregar ciudad');
  console.log('  4. Eliminar ciudad');
  console.log('  5. Establecer ciudad default');
  console.log('  8. Ajustes (°C)');
  console.log('  9. Salir');
  console.log('══════════════════════════════════════');
}

function updateCityCountMenu(cities) {
  const count = cities.length;
  console.clear();
  console.log('══════════════════════════════════════');
  console.log('          WEATHER CLI');
  console.log('══════════════════════════════════════');
  console.log('  1. Clima de ciudad default');
  console.log(`  2. Clima de todas las ciudades (${count})`);
  console.log('  3. Buscar y agregar ciudad');
  console.log('  4. Eliminar ciudad');
  console.log('  5. Establecer ciudad default');
  console.log('  8. Ajustes (°C)');
  console.log('  9. Salir');
  console.log('══════════════════════════════════════');
}

function showWeather(cityName, temperature, country = '') {
  console.clear();
  console.log('══════════════════════════════════════');
  console.log(`  🌤️  Clima en ${cityName}${country ? ', ' + country : ''}`);
  console.log('══════════════════════════════════════');
  if (temperature !== null && temperature !== undefined) {
    console.log(`  Temperatura: ${temperature}°C`);
  } else {
    console.log('  No se pudo obtener la temperatura.');
  }
  console.log('══════════════════════════════════════');
  console.log('Presiona Enter para continuar...');
}

function showSuccess(message) {
  console.clear();
  console.log('══════════════════════════════════════');
  console.log(`  ${message}`);
  console.log('══════════════════════════════════════');
  console.log('Presiona Enter para continuar...');
}

function showError(message) {
  console.clear();
  console.log('══════════════════════════════════════');
  console.log(`  ❌ ${message}`);
  console.log('══════════════════════════════════════');
  console.log('Presiona Enter para continuar...');
}

function showLoading() {
  console.clear();
  console.log('══════════════════════════════════════');
  console.log('  ⏳ Consultando el clima...');
  console.log('══════════════════════════════════════');
}

// ─── Acciones del menú ───────────────────────────────────────────

async function actionShowDefaultCity(data) {
  if (!data.defaultCity) {
    showError('No hay ciudad default configurada.');
    return;
  }

  showLoading();

  try {
    const city = await searchCity(data.defaultCity);
    if (!city) {
      showError(`No se encontró la ciudad: ${data.defaultCity}`);
      return;
    }

    const weather = await fetchWeatherForCity(city);
    const temperature = weather.current?.temperature_2m ?? null;

    showWeather(city.name, temperature, city.country);
  } catch (err) {
    showError(`Error: ${err.message}`);
  }
}

async function actionShowAllCities(data) {
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

async function actionAddCity(data) {
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
    showError(`Error: ${err.message}`);
  }
}

async function actionDeleteCity(data) {
  if (data.cities.length === 0) {
    showError('No hay ciudades registradas.');
    return;
  }

  console.clear();
  console.log('══════════════════════════════════════');
  console.log('         ELIMINAR CIUDAD');
  console.log('══════════════════════════════════════');
  console.log('Ciudades registradas:');

  data.cities.forEach((city, index) => {
    const defaultMarker = city === data.defaultCity ? ' (default)' : '';
    console.log(`  ${index + 1}. ${city}${defaultMarker}`);
  });

  const choice = await ask('\nNúmero de la ciudad a eliminar: ');
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= data.cities.length) {
    showError('Opción inválida.');
    return;
  }

  const removedCity = data.cities[index];
  data.cities.splice(index, 1);

  // Si era la ciudad default, limpiarla
  if (data.defaultCity === removedCity) {
    data.defaultCity = null;
  }

  await saveData(data);
  showSuccess(`"${removedCity}" fue eliminada.`);
}

async function actionSetDefaultCity(data) {
  if (data.cities.length === 0) {
    showError('No hay ciudades registradas.');
    return;
  }

  console.clear();
  console.log('══════════════════════════════════════');
  console.log('     ESTABLECER CIUDAD DEFAULT');
  console.log('══════════════════════════════════════');
  console.log('Ciudades registradas:');

  data.cities.forEach((city, index) => {
    const defaultMarker = city === data.defaultCity ? ' (actual)' : '';
    console.log(`  ${index + 1}. ${city}${defaultMarker}`);
  });

  const choice = await ask('\nNúmero de la ciudad default: ');
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= data.cities.length) {
    showError('Opción inválida.');
    return;
  }

  data.defaultCity = data.cities[index];
  await saveData(data);
  showSuccess(`"${data.defaultCity}" es ahora la ciudad default.`);
}

// ─── Bucle principal ─────────────────────────────────────────────

async function main() {
  let data = await loadData();

  while (true) {
    updateCityCountMenu(data.cities);
    const option = await ask('Selecciona una opción: ');

    switch (option) {
      case '1':
        await actionShowDefaultCity(data);
        break;
      case '2':
        await actionShowAllCities(data);
        break;
      case '3':
        await actionAddCity(data);
        break;
      case '4':
        await actionDeleteCity(data);
        break;
      case '5':
        await actionSetDefaultCity(data);
        break;
      case '8':
        showSuccess('Ajustes: Temperatura en °C (por defecto)');
        break;
      case '9':
        console.log('\n¡Hasta luego! 👋\n');
        rl.close();
        process.exit(0);
      default:
        showError(`Opción "${option}" no válida. Intenta de nuevo.`);
    }

    // Esperar Enter para continuar
    await ask('');
  }
}

// ─── Iniciar ─────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
