const { searchCity, fetchWeatherForCity, getWeather } = require('./api');
const { saveData } = require('./data');
const { showWeather, showSuccess, showError, showLoading, printForecastTable, SEPARATOR } = require('./ui');
const { cyan, yellow, bold } = require('./colors');

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
  const cityName = await require('./ui').ask('Ingresa el nombre de la ciudad: ');

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

  const choice = await require('./ui').ask('\nNúmero de la ciudad a eliminar: ');
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

  const choice = await require('./ui').ask('\nNúmero de la ciudad default: ');
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= data.cities.length) {
    showError('Opción inválida.');
    return;
  }

  data.defaultCity = data.cities[index];
  await saveData(data);
  showSuccess(`"${data.defaultCity}" es ahora la ciudad default.`);
}

async function actionShowForecast(data) {
  if (!data.defaultCity && data.cities.length === 0) {
    showError('No hay ciudades configuradas. Agrega al menos una ciudad primero.');
    return;
  }

  // Determinar qué ciudades consultar
  const citiesToQuery = data.cities.length > 0 ? data.cities : [data.defaultCity];

  console.clear();
  console.log(SEPARATOR);
  console.log(cyan('          PRONÓSTICO 7 DÍAS'));
  console.log(SEPARATOR);
  console.log(bold(`  ${yellow('Ciudad')}           | ${yellow('Día')}            | ${yellow('Mín')}  | ${yellow('Máx')}  | ${yellow('Precip.')}  | ${yellow('Viento')}`));
  console.log(cyan('  ───────────────┼───────────────┼──────┼──────┼──────────┼────────'));

  try {
    for (const cityName of citiesToQuery) {
      const city = await searchCity(cityName);
      if (!city) {
        console.log(`\n  ⚠️  No se encontró la ciudad: ${cityName}\n`);
        continue;
      }

      const dailyParams = 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max';
      const forecast = await getWeather(city.latitude, city.longitude, dailyParams);
      printForecastTable(forecast, city.name);
    }

    console.log('Presiona Enter para continuar...');
  } catch (err) {
    showError(`Error: ${err.message}`);
  }
}

module.exports = {
  actionShowDefaultCity,
  actionShowAllCities,
  actionAddCity,
  actionDeleteCity,
  actionSetDefaultCity,
  actionShowForecast,
};
