export function formatDayName(dateStr: string): string {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return diasSemana[dateObj.getDay()];
}

export function formatDayDate(dateStr: string): string {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dateObj.getDate()).padStart(2, '0');
  return `${mes}/${dia}`;
}
