#!/usr/bin/env node

const { actionShowDefaultCity, actionShowAllCities, actionAddCity, actionDeleteCity, actionSetDefaultCity, actionShowForecast } = require('./lib/actions');
const { loadData } = require('./lib/data');
const { ask, rl } = require('./lib/ui');
const { cyan, yellow, bold } = require('./lib/colors');

// ─── Menú ────────────────────────────────────────────────────────

function printMenu() {
  console.clear();
  console.log(cyan('══════════════════════════════════════'));
  console.log(cyan('          WEATHER CLI'));
  console.log(cyan('══════════════════════════════════════'));
  console.log('  1. Clima de ciudad default');
  console.log('  2. Clima de todas las ciudades (0)');
  console.log('  3. Buscar y agregar ciudad');
  console.log('  4. Eliminar ciudad');
  console.log('  5. Establecer ciudad default');
  console.log('  6. Pronóstico 7 días');
  console.log('  8. Ajustes (°C)');
  console.log('  9. Salir');
  console.log(cyan('══════════════════════════════════════'));
}

function updateCityCountMenu(cities) {
  const count = cities.length;
  console.clear();
  console.log(cyan('══════════════════════════════════════'));
  console.log(cyan('          WEATHER CLI'));
  console.log(cyan('══════════════════════════════════════'));
  console.log('  1. Clima de ciudad default');
  console.log(`  2. Clima de todas las ciudades (${count})`);
  console.log('  3. Buscar y agregar ciudad');
  console.log('  4. Eliminar ciudad');
  console.log('  5. Establecer ciudad default');
  console.log('  6. Pronóstico 7 días');
  console.log('  8. Ajustes (°C)');
  console.log('  9. Salir');
  console.log(cyan('══════════════════════════════════════'));
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
      case '6':
        await actionShowForecast(data);
        break;
      case '8':
        console.clear();
        console.log(cyan('══════════════════════════════════════'));
        console.log(`  ${bold('Ajustes')}: Temperatura en °C (por defecto)`);
        console.log(cyan('══════════════════════════════════════'));
        console.log('Presiona Enter para continuar...');
        await ask('');
        break;
      case '9':
        console.log('\n¡Hasta luego! 👋\n');
        rl.close();
        process.exit(0);
      default:
        console.clear();
        console.log(cyan('══════════════════════════════════════'));
        console.log(`  ❌ Opción "${option}" no válida. Intenta de nuevo.`);
        console.log(cyan('══════════════════════════════════════'));
        console.log('Presiona Enter para continuar...');
        await ask('');
    }

    // Esperar Enter para continuar
    await ask('');
  }
}

// ─── Iniciar ─────────────────────────────────────────────────────

main().catch((err) => {
  console.error('\nError fatal:', err.message);
  process.exit(1);
});
