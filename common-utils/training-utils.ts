import { GenericDictionary } from '../common-types';

/**
 * Take a flat array and transform to an Object of the type required to train the neural network
 *
 * @param inputs Array of inputs
 * @param outerKey Key of inputs to roll up to (must be distinct)
 * @param valueKey Key to use for values
 * @param delimiter Delimitr defining how to split the valueKey (e.g., '||')
 */
export const ToTrainingSet = <T>(
  inputs: Array<T>,
  outerKey: keyof T,
  valueKey: keyof T,
  delimiter: string = ''
): GenericDictionary<string[]> => {
  const reduced = inputs.reduce((acc, iter) => {
    const cleanKey = (iter[outerKey] as any) as string;
    const cleanVal = ((iter[valueKey] as any) as string)
      .split(delimiter)
      .map((val: string) => {
        return val.trim();
      });
    // just in case the outer key is not unique..
    const lastVal: string[] = acc.get(cleanKey);
    if (lastVal) {
      return acc.set(cleanKey, [...lastVal, ...cleanVal]);
    } else {
      return acc.set(cleanKey, cleanVal);
    }
  }, new Map<string, string[]>());
  let dictObj = {};
  for (let [k, v] of reduced.entries()) {
    dictObj = { ...dictObj, ...{ [k]: v } };
  }
  return dictObj;
};

/**
 * If the input value has clean values and dirty keys, invert them
 *
 * @param inputs Input map
 */
export const FlipKeys = (inputs: GenericDictionary<string[]>) => {
  const reduced = Object.keys(inputs).reduce((acc, iter) => {
    // values for the key on which we are currently iterating
    const theseVals = inputs[iter];
    if (theseVals && theseVals.length) {
      theseVals.forEach((v) => {
        if (acc.has(v)) {
          // if the value already exists on the output map, assign into it (assuming that it's not a dupe)
          const lastVals = acc.get(v) || [];
          // check whether the key that we're assigning is already set
          const valExists = lastVals.indexOf(iter) > -1;
          if (valExists) {
            // no need to assign into the accumulator if it's already in the output
            return;
          } else {
            // concat, if the value is new
            const newVals = [...lastVals, ...[iter]];
            acc = acc.set(v, newVals);
          }
        } else {
          acc = acc.set(v, [iter]);
        }
        return acc;
      });
      return acc;
    } else {
      return acc;
    }
  }, new Map<string, string[]>());
  let dictObj = {};
  for (let [k, v] of reduced.entries()) {
    dictObj = { ...dictObj, ...{ [k]: v } };
  }
  return dictObj;
};
