/**
 * Basic dictionary of some type, keyed by string
 */
export interface GenericDictionary<TValue = string> {
  [idx: string]: TValue;
}

/**
 * Exceptions dict, nested by step (top-level key)
 */
export type ExceptionsDictionary = GenericDictionary<GenericDictionary<string>>;

/**
 * Combined stemmer inputs
 */
export interface StemmerInputs {
  /**
   * Dictionary of exceptions (keyed first by step ID)
   */
  exceptions: ExceptionsDictionary;
  /**
   * Flat dictionary of Extensions
   */
  extensions: GenericDictionary;
}

export type DictAndKeys = {
  dict: GenericDictionary<number>;
  words: string[];
};
export type ClassesAndDict = {
  texts: string[];
  classes: GenericDictionary<number>;
  dict: DictAndKeys;
};
