import { readFile, exists } from 'fs';
import { promisify } from 'util';

const existsAsync = promisify(exists);
const readFileAsync = promisify(readFile);

/**
 * Asynchronously read a file into an object
 * @param filePath Relative path to file
 */
export async function readFromFile<T extends Object>(
  filePath: string
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      const exists = await existsAsync(filePath);
      if (!exists) {
        const errNotFound = `File at path ${filePath} not found`;
        console.log(errNotFound);
        reject(errNotFound);
      }
      const text = await readFileAsync(filePath, { encoding: 'utf8' });
      if (text) {
        resolve(JSON.parse(text));
      } else {
        reject('Unable to load any text');
      }
    } catch (err) {
      console.log('Error', err);
      reject(err);
    }
  });
}
