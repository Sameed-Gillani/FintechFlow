// Reusable PKR formatter — used across ALL components
// Uses Intl.NumberFormat as required by the spec
const pkrFormatter = new Intl.NumberFormat('ur-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 2
});

export function formatPKR(amount) {
  return pkrFormatter.format(amount);
}
