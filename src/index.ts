#!/usr/bin/env node

import { getWeather } from './actions/getWeather';
import { listCities } from './actions/listCities';
import { addCity } from './actions/addCity';
import { removeCity } from './actions/removeCity';
import { setDefaultCity } from './actions/setDefaultCity';
import { forecast } from './actions/forecast';
import { rl, ask } from './presentation/input';
import { updateCityCountMenu } from './presentation/menu';
import { loadData } from './storage/citiesStorage';
import { cyan, bold } from './utils/colors';

// ─── Bucle principal ─────────────────────────────────────────────

async function main(): Promise<void> {
  while (true) {
    const data = await loadData();
    updateCityCountMenu(data.cities);
    const option = await ask('Selecciona una opción: ');

    switch (option) {
      case '1':
        await getWeather();
        break;
      case '2':
        await listCities();
        break;
      case '3':
        await addCity();
        break;
      case '4':
        await removeCity();
        break;
      case '5':
        await setDefaultCity();
        break;
      case '6':
        await forecast();
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
  if (err.message.includes('readline was closed')) return;
  console.error('\nError fatal:', err.message);
  process.exit(1);
});
