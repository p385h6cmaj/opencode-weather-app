import { loadData, saveData } from '../storage/citiesStorage';
import { ask } from '../presentation/input';
import { showError, showSuccess } from '../presentation/output';

export async function removeCity(): Promise<void> {
  const data = await loadData();

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
