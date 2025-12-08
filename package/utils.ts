export function capitalizeFirst(str: string): string {
  if (!str) {
    console.error("Error: capitalizeFirst input not a string");
    return str;
  }
  return str.replace(str.charAt(0), str.charAt(0).toUpperCase());
}
