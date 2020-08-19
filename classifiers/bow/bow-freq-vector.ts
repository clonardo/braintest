import { GenericDictionary } from '../../common-types/dictionary.types';
import { ExtractDictionary } from '../../common-utils/dictionary-utils';
import { ITokenizer } from '../../common-types/tokenizer.types';

/**
 * Get a frequency vector using the Bag of Words approach.
 * Ported from .bow()
 *
 * @param text input string
 * @param vocabulary dictionary with frequency of words
 */
export const BowFreqVector = (
  text: string,
  vocabulary: GenericDictionary & { words?: Array<number> },
  tokenizer: ITokenizer
): number[] => {
  let dict = ExtractDictionary([text], tokenizer).dict;
  let vector: number[] = [];

  vocabulary.words.forEach((word) => {
    vector.push(dict[word] || 0);
  });
  return vector;
};

export const Maxarg = (array) => {
  let a: number[] = [];
  if (!Array.isArray(array)) {
    for (let i in array) {
      a.push(array[i]);
    }
  }
  array = Array.isArray(array) ? array : a;

  return array.indexOf(Math.max.apply(Math, array));
};
