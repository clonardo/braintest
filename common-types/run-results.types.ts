import { TRAINING_STATE } from './training-states';

/**
 * Once the model has run, this object represents any matches + confidence of the match
 */
export interface IRunResult {
  /**
   * Echoed input text
   */
  text: string;
  /**
   * Top match
   */
  label: string;
  /**
   * Confidence of top match
   */
  confidence: number;
  /**
   * Object with all possible matches, and confidence values
   */
  prediction: {
    [key: string]: number;
  };
  /**
   * Displays the model status
   */
  status: TRAINING_STATE;
}
