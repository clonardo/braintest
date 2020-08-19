import {
  GenericDictionary,
  ExceptionsDictionary,
  StemmerInputs,
} from '../common-types';
import { readFromFile } from './file-loader';
import { dictHasData } from './validation';

// implemented stemmer from algorithm at http://snowball.tartarus.org/algorithms/english/stemmer.html

/**
 * Read Exceptions dictionary from provided path
 *
 * @param filePath full path to file
 */
export async function readExceptionsFromFile(
  filePath: string
): Promise<ExceptionsDictionary> {
  // console.log(`readExceptionsFromFile: read from ${filePath}`);
  return await readFromFile<ExceptionsDictionary>(filePath);
}

/**
 * Read Extensions dictionary from provided path
 *
 * @param filePath full path to file
 */
export async function readExtensionsFromFile(
  filePath: string
): Promise<GenericDictionary> {
  // console.log(`readExtensionsFromFile: read from ${filePath}`);
  return await readFromFile<GenericDictionary>(filePath);
}

/**
 * Read Extensions dictionary from provided path
 *
 * @param exceptionsFilePath full path to Exceptions file
 * @param extensionsFilePath full path to Extensions file
 */
export async function BuildStemmerInputs(
  exceptionsFilePath: string,
  extensionsFilePath: string
): Promise<StemmerInputs> {
  return new Promise<StemmerInputs>(async (resolve, reject) => {
    try {
      const exceptions = await readExceptionsFromFile(exceptionsFilePath);
      const extensions = await readExtensionsFromFile(extensionsFilePath);
      if (dictHasData(exceptions) && dictHasData(extensions)) {
        resolve({ exceptions, extensions });
      } else {
        reject('Valid data was not loaded');
      }
    } catch (e) {
      console.warn('BuildStemmerInputs failed: ', e);
      reject(e);
    }
  });
}
