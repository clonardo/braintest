import { join, normalize } from 'path';
import { BrainText } from './processing';
import { BuildStemmerInputs, readFromFile } from './common-utils';
import { StemmerInputs } from './common-types';
import { ToTrainingSet, FlipKeys } from './common-utils/training-utils';

/**
 * Join the base directory name with a relative path to get a full, normalized path
 *
 * @param relativePath Path within repo
 */
const makeFullPath = (relativePath: string): string => {
  const basePath = __dirname;
  return normalize(join(basePath, relativePath));
};

/**
 * Relative path to "Exceptions" file
 */
const STEMMER_INPUT_EXCEPTION_PATH =
  'classifiers/bow/english-data/exceptions.json';
/**
 * Relative path to "Extensions" file
 */
const STEMMER_INPUT_EXTENSIONS_PATH =
  'classifiers/bow/english-data/extensions.json';

console.log('-- app started');

let _classifier: BrainText;

async function GetStemmerInputs(): Promise<StemmerInputs> {
  return await BuildStemmerInputs(
    STEMMER_INPUT_EXCEPTION_PATH,
    STEMMER_INPUT_EXTENSIONS_PATH
  );
}

/**
 * Initialize and train the classifier
 *
 * @param trainingJsonData Stringified training data. should be a stringified object with the form {[key:string]: [string[]]}
 */
async function InitModel(trainingJsonData: string) {
  if (!_classifier) {
    try {
      const stemmerInputs = await GetStemmerInputs();
      if (stemmerInputs) {
        // console.log('Built stemmer inputs: ', stemmerInputs);
        _classifier = new BrainText(stemmerInputs);
      } else {
        console.error('Error building stemmer inputs');
      }
    } catch (e) {
      console.error('Error initializing BrainText model: ', e);
    } finally {
      if (_classifier) {
        let initialized = false;
        try {
          _classifier.LoadTrainDataFromInputDataString(trainingJsonData);
          console.log('Training data loaded.');
          const modelState = await _classifier.TrainModel();
          console.log('Trained model: ', modelState);
          initialized = true;
        } catch (ex) {
          console.error('Error loading training data: ', ex);
          initialized = false;
        } finally {
          if (initialized) {
            return _classifier;
          } else {
            throw Error('Unable to train classifier');
          }
        }
      } else {
        throw Error('Unable to initialize classifier');
      }
    }
  } else {
    return _classifier;
  }
}

/**
 * Sample training data as stringified JSON
 */
const sampleTrainingData =
  '{"encender_lampara": ["enciende la luz","esto está muy oscuro"],"apagar_lampara": ["apaga la luz","apaga la lámpara"]}';

async function EvalText(
  textToEval: string,
  inputTrainingText: string = sampleTrainingData
) {
  let _instance: BrainText;
  try {
    _instance = await InitModel(inputTrainingText);
    if (_instance) {
      const result = _instance.RunModel(textToEval);
      console.log('EvalText got result: ', result);
    }
  } catch (e) {
    console.warn('Error in EvalText: ', e);
  }
}

/**
 * JSON representation of input Title => Normalized Title mapping
 */
type RawTitleMapping = {
  /**
   * Title (as input) to map to
   */
  Title: string;
  /**
   * Normalized titles, separated by "||"
   */
  'Normalized Title': string;
};
/**
 * Import and normalize titles data, then train the model
 */
async function TrainAndRun() {
  const rawTitles = await readFromFile<Array<RawTitleMapping>>(
    './raw-titles.json'
  );
  console.log(`got ${rawTitles.length} raw titles `);

  const tmpTrainingSet = FlipKeys(
    ToTrainingSet(rawTitles, 'Title', 'Normalized Title', '||')
  );
  console.log(
    `Mapped titles, got ${Object.keys(tmpTrainingSet).length} normalized titles`
  );
  const stringified = JSON.stringify(tmpTrainingSet, null, 2);
  // console.log('-- stringified titles: ', stringified);

  // run logic here
  let _instance: BrainText;
  try {
    console.time('model');
    console.log('---> starting training');
    _instance = await InitModel(stringified);
    console.log('---> completed training!');
    console.timeEnd('model');
    if (_instance) {
      console.time('eval');
      console.log('---> evaluating input string');
      const result = _instance.RunModel('VP Marketing');
      console.log('EvalText got result: ', result);
      console.timeEnd('eval');
      console.log('=========== Model State: ===========');
      // serialize current model state
      console.log(_instance.toJSON());
    }
  } catch (e) {
    console.warn('Error in EvalText: ', e);
  }
}

TrainAndRun();
// EvalText('enciende la luz');
