/**
 * Single data point like { input: [ 1, 1, 1, 0, 0, 0, 0, 0, 0, 0 ], output: [ 1, 0 ] }
 */
export interface ITrainingData {
  input: number[];
  output: number[];
}
