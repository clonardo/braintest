/**
 * Generic tokenizer
 */
export interface ITokenizer {
  /**
   * Tokenize a string input to words/tokens
   *
   * @param input Input to tokenize
   */
  Tokenize(input: string): string[];
}
