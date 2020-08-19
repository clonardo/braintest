import { ITextWithLabel } from '../common-types';

/**
 * Shuffle an array of objects
 * @param {*} a is an array of objects:
 *  [
 *      {label: "encender_lampara", text: "enciende la luz"},
 *      ...
 *      {label: "apagar_lampara", text: "apaga la lámpara"}
 *  ]
 *
 */
export const shuffle = (a: Array<ITextWithLabel>) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
