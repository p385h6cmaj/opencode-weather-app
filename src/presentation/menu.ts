import { cyan, bold } from '../utils/colors.js';
import { SEPARATOR } from '../utils/constants.js';

export function printMenu(): void {
  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(cyan('          WEATHER CLI'));
  console.log(cyan(SEPARATOR));
  console.log('  1. Clima de ciudad default');
  console.log('  2. Clima de todas las ciudades (0)');
  console.log('  3. Buscar y agregar ciudad');
  console.log('  4. Eliminar ciudad');
  console.log('  5. Establecer ciudad default');
  console.log('  6. Pronóstico 7 días');
  console.log('  8. Ajustes (°C)');
  console.log('  9. Salir');
  console.log(cyan(SEPARATOR));
}

export function updateCityCountMenu(cities: string[]): void {
  const count = cities.length;
  console.clear();
  console.log(cyan(SEPARATOR));
  console.log(cyan('          WEATHER CLI'));
  console.log(cyan(SEPARATOR));
  console.log('  1. Clima de ciudad default');
  console.log(`  2. Clima de todas las ciudades (${count})`);
  console.log('  3. Buscar y agregar ciudad');
  console.log('  4. Eliminar ciudad');
  console.log('  5. Establecer ciudad default');
  console.log('  6. Pronóstico 7 días');
  console.log('  8. Ajustes (°C)');
  console.log('  9. Salir');
  console.log(cyan(SEPARATOR));
}
