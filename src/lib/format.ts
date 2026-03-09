/** Format integer cents as a currency display string (e.g. 123456 → "$1,234.56"). */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
