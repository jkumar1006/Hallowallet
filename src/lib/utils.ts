export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}
