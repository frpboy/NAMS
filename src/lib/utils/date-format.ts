const baseDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
});

export function formatDateGB(date: Date | string | number): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return baseDateFormatter.format(parsed);
}

export function formatLongDateGB(date: Date | string | number): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}
