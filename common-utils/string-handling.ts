/**
 * From a provided array of strings, return a new, deduplicated array of strings
 *
 * @param strings input array of strings
 */
export const DeduplicateString = (strings: string[] = []): string[] => {
  return Array.from(new Set<string>(strings));
};

/**
 * Remove non-digit, non-word, and shady whitespace chars from an input string, and split it into words on whitespace
 *
 * @param str input string
 */
export const SanitizeAndSplitString = (str: string): string[] => {
  return str.replace(/[^a-zA-Z0-9\u00C0-\u00FF]+/g, ' ').split(' ');
};
