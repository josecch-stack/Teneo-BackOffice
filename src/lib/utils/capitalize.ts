/** Capitalizes the first letter of each word, lowercasing the rest. */
export function capitalizeWords(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length === 0
        ? word
        : word.charAt(0).toLocaleUpperCase("es-CL") +
          word.slice(1).toLocaleLowerCase("es-CL"),
    )
    .join(" ");
}
