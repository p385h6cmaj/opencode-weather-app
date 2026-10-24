import { loadData, saveData } from '../storage/citiesStorage.js';
import { ask } from '../presentation/input.js';
import { showError, showSuccess } from '../presentation/output.js';

interface Dependencies {
  ask?: typeof import('../presentation/input.js').ask;
  loadData?: typeof import('../storage/citiesStorage.js').loadData;
  saveData?: typeof import('../storage/citiesStorage.js').saveData;
  showError?: typeof import('../presentation/output.js').showError;
  showSuccess?: typeof import('../presentation/output.js').showSuccess;
}

export async function removeCity(deps?: Dependencies): Promise<void> {
  const _ask = deps?.ask ?? ask;
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage.js')).loadData;
  const _saveData = deps?.saveData ?? saveData;
  const _showError = deps?.showError ?? showError;
  const _showSuccess = deps?.showSuccess ?? showSuccess;

  const data = await _loadData();

  if (data.cities.length === 0) {
    _showError('No hay ciudades registradas.');
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

  const choice = await _ask('\nNúmero de la ciudad a eliminar: ');
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= data.cities.length) {
    _showError('Opción inválida.');
    return;
  }

  const removedCity = data.cities[index];
  data.cities.splice(index, 1);

  // Si era la ciudad default, limpiarla
  if (data.defaultCity === removedCity) {
    data.defaultCity = null;
  }

  await _saveData(data);
  _showSuccess(`"${removedCity}" fue eliminada.`);
}
