export interface IModelConfig {
  /**
   * the maximum number of times to iterate the training data
   */
  iterations: number;
  /**
   * the acceptable error percentage from training data
   */
  errorThresh: number;
  /**
   * true to use console.log, when a function is supplied it is used
   */
  log: boolean;
  /**
   * iterations between logging
   */
  logPeriod: number;
  /**
   * Multiplies against the input and the delta then adds to momentum
   */
  learningRate: number;

  /**
   * Multiplies against the specified "change" then adds to learning rate for change
   */
  momentum: number;
}
