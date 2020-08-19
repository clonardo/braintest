/**
 * Describe model training state
 */
export const enum TRAINING_STATE {
  EMPTY = 'EMPTY',
  UNTRAINED = 'UNTRAINED',
  TRAINED = 'TRAINED',
  TRAINING = 'TRAINING',
}

export const TrainingState = {
  EMPTY: TRAINING_STATE.EMPTY as string,
  UNTRAINED: TRAINING_STATE.UNTRAINED as string,
  TRAINED: TRAINING_STATE.TRAINED as string,
  TRAINING: TRAINING_STATE.TRAINING as string,
};
