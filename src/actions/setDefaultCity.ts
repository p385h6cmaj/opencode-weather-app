import { loadData, saveData } from '../storage/citiesStorage';
import { ask } from '../presentation/input';
import { showError, showSuccess } from '../presentation/output';

export async function setDefaultCity(): Promise<void> {
  const data = await loadData();

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
