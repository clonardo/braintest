import {
  GenericDictionary,
  IModelConfig,
  StemmerInputs,
  ITextWithLabel,
  TrainingState,
  ITrainingData,
  IRunResult,
} from '../common-types';
import * as brain from 'brain.js';
import { DefaultModelConfig } from './default-config';
import { BagOfWordsTokenizer } from '../classifiers/bow/bag-of-words-tokenizer';
import { BowFreqVector, Maxarg } from '../classifiers/bow';
import {
  MakeVectorResult,
  BuildClassesAndDict,
  shuffle,
} from '../common-utils';

/**
 * Brain.js text classifier/processor
 */
export class BrainText {
  private _dict: GenericDictionary & { words?: Array<number> } = {};
  private _net: brain.NeuralNetwork = new brain.NeuralNetwork();
  private tokenizer: BagOfWordsTokenizer;
  private _traindata: Array<ITextWithLabel> = [];
  private _status = TrainingState.EMPTY;
  /**
   * An array of texts used to train the network
   */
  private _texts: string[] = [];
  private _configuration: IModelConfig = DefaultModelConfig;
  /**
   * _classes are all the classes from input data text formatted to feed the ANN
   */
  private _classes: GenericDictionary<number> = {};
  constructor(private readonly stemmerInputs: StemmerInputs) {
    this.tokenizer = new BagOfWordsTokenizer(stemmerInputs);
  }

  /**
   * Merge a partial config object into the default config
   *
   * @param config Partial config
   */
  public setConfiguration = (config: Partial<IModelConfig>): void => {
    this._configuration = { ...this._configuration, ...config };
  };

  /**
   * Get config instance
   */
  public getConfiguration = (): IModelConfig => {
    return this._configuration;
  };

  /**
   * Prepare training data to be feed in brain.js Artificial Neural Network
   *
   * @param {*} traindata  is an array of objects like this
   *  [
   *     {label: "encender_lampara", text: "enciende la luz"},
   *     ...
   *     {label: "apagar_lampara", text: "apaga la lámpara"}
   *   ]
   *
   * returns an object with traindata prepared to be feed in a neural network,
   * the classes as an object wich maps the class name to a number, like this:
   * {apagar_ventilador: 0, encender_ventilador: 1, encender_lampara: 2, apagar_lampara: 3}
   * and the dictionary for BOW.
   */
  public PrepareTrainingData = (
    traindata: ITextWithLabel[] = []
  ): ITrainingData[] => {
    // build training data to feed ANN
    const traindata_for_ann: ITrainingData[] = traindata.map((data) => {
      return {
        // input: this.tokenizer.Tokenize(data.text),
        input: BowFreqVector(data.text, this._dict, this.tokenizer),

        // output: this.tokenizer.vec_result(
        output: MakeVectorResult(
          this._classes[data.label],
          Object.keys(this._classes).length
        ),
      };
    });

    return traindata_for_ann;
  };

  public SetUpdateInfrastructure = () => {
    let { classes, texts, dict } = BuildClassesAndDict(
      this._traindata,
      this.tokenizer
    );
    this._classes = classes;
    this._texts = texts;
    // #CLTODO- check this type
    this._dict = dict as any;
  };

  /**
 * Build an array of objects from the input data string
 * each object is like this:
 * {label: "encender_lampara", text:  "enciende la luz"}
 * 
 * The traindata array is cleared when the function start, so 
 * each time this function is called the traindata array is 
 * loaded from scratch.
 * 
 * @param {*} inputDataString is an JSON string like this
 * {
        "encender_lampara": [
            "enciende la luz",
            "esto está muy oscuro"
        ],
        "apagar_lampara": [
            "apaga la luz",
            "apaga la lámpara"
        ]
   }
 */
  public LoadTrainDataFromInputDataString = (inputDataString: string) => {
    // reset traindata vector
    this._traindata = [];
    let inputDataObj = JSON.parse(inputDataString);
    for (const key in inputDataObj) {
      for (const text of inputDataObj[key]) {
        this._traindata.push({ label: key, text: text });
      }
    }
    // now we shuffle traindata
    this._traindata = shuffle(this._traindata);
    this.SetUpdateInfrastructure();
  };

  /**
   * Add new training data. This operation leaves the network outdated.
   * It must to be trained again to take into account these new data.
   * @param {*} traindata array of training inputs
   */
  public AddData = (traindata: Array<ITextWithLabel>) => {
    let traindataProcessed = [];
    traindata.forEach((data) => {
      let dataProcessed = { label: data.label, text: data.text };
      traindataProcessed.push(dataProcessed);
      this._traindata.forEach((_data) => {
        if (dataProcessed.text == _data.text) {
          console.log('data repeated!');
          return false;
        }
      });
    });

    this._traindata = this._traindata.concat(traindataProcessed);
    this.SetUpdateInfrastructure();

    this._status = TrainingState.UNTRAINED;
    return true;
  };

  /**
   * Add one new training data point. This operation leaves the network outdated.
   * It must to be trained again to take into account new data.
   * @param {*} data training data point
   */
  public AddDataPoint = (data: ITextWithLabel) => {
    let dataProcessed = { label: data.label, text: data.text };
    this._traindata.forEach((_data) => {
      if (dataProcessed.text == _data.text) {
        console.log('data repeated!');
        return false;
      }
    });

    this._traindata = this._traindata.concat([dataProcessed]);
    this.SetUpdateInfrastructure();
    this._status = TrainingState.UNTRAINED;
    return true;
  };

  /**
   * Remove a data point from the training dataset
   *
   * @param entry data point to remove
   */
  public RemoveDataPoint = (entry: ITextWithLabel) => {
    let entryProcessed = { label: entry.label, text: entry.text };
    this._traindata.splice(
      this._traindata.findIndex(
        (v) =>
          v.label === entryProcessed.label && v.text === entryProcessed.text
      ),
      1
    );

    this.SetUpdateInfrastructure();
    this._status = TrainingState.UNTRAINED;
    console.log('RemoveData: ', this._traindata);
    return true;
  };

  /**
   * Get training data
   */
  public GetTrainingData = () => {
    return this._traindata;
  };

  /**
   * Get current state
   */
  public GetState = () => {
    return this._status;
  };

  /**
   * Get current dictionary
   */
  public GetDict = () => {
    return this._dict;
  };

  public TrainModel = (): Promise<brain.INeuralNetworkState> => {
    const traindata_for_ann = this.PrepareTrainingData(this._traindata);
    // console.log('-- TrainModel: ', traindata_for_ann);
    this._status = TrainingState.TRAINING;
    // a new network is created in order to start training from scratch
    // I have perceived that when new data is added to a trained network,
    // sometimes the train error can't reach a minimun (high) value and training process
    // can't lower it. It seems like a local minimun is reached and the process
    // is trapped. I've found too, that beginning from a new net solves the problem
    this._net = new brain.NeuralNetwork();
    return this._net.trainAsync(traindata_for_ann, this._configuration).then(
      (result) => {
        this._status = TrainingState.TRAINED;
        return result;
      },
      (error) => {
        throw error;
      }
    );
  };

  /**
   * Run the model, once trained, against data to evaluate
   *
   * @param text Text to processF
   */
  RunModel = (text: string): IRunResult => {
    if (this._status == TrainingState.UNTRAINED) {
      throw "Network UNTRAINED, can't make any prediction!";
    }
    // vectorize as a Bag Of Words
    let term = BowFreqVector(text, this._dict, this.tokenizer);
    // console.log('-- in RunModel, term: ', term);
    let predict = this._net.run(term);
    let i = Maxarg(predict);

    let flippedClasses = {};
    for (let key in this._classes) {
      flippedClasses[this._classes[key]] = key;
    }

    let prediction = {};
    for (let i = 0; i < predict.length; i++) {
      prediction[flippedClasses[i]] = predict[i];
    }

    let result = {
      text: text,
      label: flippedClasses[i],
      confidence: predict[i],
      prediction: prediction,
      status: this._status as any,
    };

    return result;
  };
  /**
   * Return the model trained as a JSON object
   */
  public toJSON = () => {
    let model = {
      net: this._net.toJSON(),
      dict: this._dict,
      classes: this._classes,
      texts: this._texts,
      traindata: this._traindata,
    };

    return model;
  };

  /**
   *
   * Load a model from a net represented as JSON object (same object obtained
   * with toJSON())
   *
   * @param {*} net is the json object representing the net
   * @param {*} dict is the dictionary built when the net was trained
   * @param {*} classes an object like this {apagar_ventilador: 0, encender_ventilador: 1, encender_lampara: 2, apagar_lampara: 3}
   * @param {String} texts string[]
   * @param {*} traindata [{label: 'encender_lampara', text: 'dale a la lamparita'}, {...}]
   */
  public fromJSON = (json_model: {
    net: brain.INeuralNetworkJSON;
    dict: GenericDictionary & { words?: Array<number> };
    classes: GenericDictionary<number>;
    texts: string[];
    traindata: Array<ITextWithLabel>;
  }) => {
    this._status = TrainingState.TRAINED;
    this._dict = json_model.dict;
    this._classes = json_model.classes;
    this._texts = json_model.texts;
    this._traindata = json_model.traindata;
    this._net.fromJSON(json_model.net);
  };
}
