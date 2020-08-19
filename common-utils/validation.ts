import { GenericDictionary } from '../common-types';

/**
 * Validate that a provided dictionary exists and has data
 *
 * @param dict Dictionary object
 */
export const dictHasData = (dict: GenericDictionary<any>): boolean => {
  return dict && Object.keys(dict) && Object.keys(dict).length > 0;
};
