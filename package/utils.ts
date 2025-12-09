export function capitalizeFirst(str: string): string {
  if (typeof str !== "string") {
    return "";
  }
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
