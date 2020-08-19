import { IModelConfig } from '../common-types';

/**
 * Default model training config
 */
export const DefaultModelConfig: IModelConfig = {
  iterations: 3000,
  errorThresh: 0.0006,
  log: true,
  logPeriod: 10,
  learningRate: 0.3,
  momentum: 0.1,
};
