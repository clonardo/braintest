import { ITokenizer } from '../common-types/tokenizer.types';
import { DictAndKeys, ClassesAndDict } from '../common-types/dictionary.types';
import { ITextWithLabel } from '../common-types';

/**
 * Extract a dictionary from input text
 *
 * @param inputs Input text as single string, or array
 */
export const ExtractDictionary = (
  inputs: string[] | string,
  tokenizer: ITokenizer
): DictAndKeys => {
  const textArray = Array.isArray(inputs) ? inputs : [inputs];
  const dictSet = {
    dict: new Map<string, number>(),
    keys: new Set<string>(),
  };
  const populatedDict = textArray.reduce((acc, iter) => {
    const words = tokenizer.Tokenize(iter);
    if (words && words.length) {
      words.forEach((word) => {
        const lc = word.toLowerCase();
        const prevDictVal = acc.dict.get(lc);
        if (!prevDictVal && lc !== '') {
          return {
            dict: acc.dict.set(lc, 1),
            keys: acc.keys.add(lc),
          };
        } else {
          return {
            dict: acc.dict.set(lc, prevDictVal + 1),
            keys: acc.keys.add(lc),
          };
        }
      });
      return acc;
    } else {
      return acc;
    }
  }, dictSet);

  // unwrap map
  let dictObj = {};
  for (let [k, v] of populatedDict.dict.entries()) {
    dictObj = { ...dictObj, ...{ [k]: v } };
  }
  return {
    dict: dictObj,
    words: Array.from(populatedDict.keys),
  };
};

/**
 * Build an object which maps classes names to number and the dictionary
 * which will be used to vectorize words.
 * @param {*} traindata array of training data
 * @param {*} tokenizer tokenizer instance
 */
export const BuildClassesAndDict = (
  traindata: Array<ITextWithLabel>,
  tokenizer: ITokenizer
): ClassesAndDict => {
  let texts: string[] = [];
  let classes = {};
  // extract all the classe (which are the labels) without
  // repetition from traindata and map to number in order to
  // feed the ANN
  let i = 0;
  for (let data of traindata) {
    texts.push(data.text);
    if (classes[data.label] == undefined) {
      classes[data.label] = i;
      i++;
    }
  }

  let dict = ExtractDictionary(texts, tokenizer);

  return { classes: classes, texts: texts, dict: dict };
};

/**
 * Create a numeric vector of results
 *
 * @param res number
 * @param num_classes number
 */
export const MakeVectorResult = (
  res: number,
  num_classes: number
): number[] => {
  let vec: number[] = [];
  for (let i = 0; i < num_classes; i += 1) {
    vec.push(0);
  }
  vec[res] = 1;
  return vec;
};
