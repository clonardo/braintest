import { StemmerInputs, ITokenizer } from '../../common-types';
import { DeduplicateString, SanitizeAndSplitString } from '../../common-utils';

export class BagOfWordsTokenizer implements ITokenizer {
  constructor(private readonly stemmerInputs: StemmerInputs) {}

  /**
   * Tokenize some text input
   *
   * @param inputText String to tokenize
   */
  public Tokenize = (inputText: string): string[] => {
    const words = SanitizeAndSplitString(inputText);
    const stemmedWords = words.map((x) => {
      return this.processWord(x);
    });
    return DeduplicateString(stemmedWords);
  };

  private processWord = (inputText: string): string => {
    if (inputText.length < 3) {
      return inputText;
    }
    if (
      this.stemmerInputs.exceptions['step-1'] &&
      this.stemmerInputs.exceptions['step-1'][inputText]
    ) {
      return this.stemmerInputs.exceptions['step-1'][inputText];
    }

    let eRx = ['', ''];
    let word = inputText
      .toLowerCase()
      .replace(/^'/, '')
      .replace(/[^a-z']/g, '')
      .replace(/^y|([aeiouy])y/g, '$1Y');
    let R1;
    let res;

    if ((res = /^(gener|commun|arsen)/.exec(word))) {
      R1 = res[0].length;
    } else {
      R1 =
        (((/[aeiouy][^aeiouy]/.exec(' ' + word) || eRx) as any).index || 1000) +
        1;
    }

    var R2 =
      (((/[aeiouy][^aeiouy]/.exec(' ' + word.substr(R1)) || eRx) as any)
        .index || 1000) +
      R1 +
      1;

    // step 0
    word = word.replace(/('s'?|')$/, '');

    // step 1a
    let rx = /(?:(ss)es|(..i)(?:ed|es)|(us)|(ss)|(.ie)(?:d|s))$/;
    if (rx.test(word)) {
      word = word.replace(rx, '$1$2$3$4$5');
    } else {
      word = word.replace(/([aeiouy].+)s$/, '$1');
    }

    if (
      this.stemmerInputs.exceptions['step-1a'] &&
      this.stemmerInputs.exceptions['step-1a'][word]
    ) {
      return this.stemmerInputs.exceptions['step-1a'][word];
    }

    // step 1b
    var s1 = (/(eedly|eed)$/.exec(word) || eRx)[1],
      s2 = (/(?:[aeiouy].*)(ingly|edly|ing|ed)$/.exec(word) || eRx)[1];

    if (s1.length > s2.length) {
      if (word.indexOf(s1, R1) >= 0) {
        word = word.substr(0, word.length - s1.length) + 'ee';
      }
    } else if (s2.length > s1.length) {
      word = word.substr(0, word.length - s2.length);
      if (/(at|bl|iz)$/.test(word)) {
        word += 'e';
      } else if (/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/.test(word)) {
        word = word.substr(0, word.length - 1);
      } else if (
        !word.substr(R1) &&
        /([^aeiouy][aeiouy][^aeiouywxY]|^[aeiouy][^aeiouy]|^[aeiouy])$/.test(
          word
        )
      ) {
        word += 'e';
      }
    }

    // step 1c
    word = word.replace(/(.[^aeiouy])[yY]$/, '$1i');

    // step 2
    let sfx: any = /(ization|fulness|iveness|ational|ousness|tional|biliti|lessli|entli|ation|alism|aliti|ousli|iviti|fulli|enci|anci|abli|izer|ator|alli|bli|l(ogi)|[cdeghkmnrt](li))$/.exec(
      word
    );
    if (sfx) {
      sfx = sfx[3] || sfx[2] || sfx[1];
      if (word.indexOf(sfx, R1) >= 0) {
        word =
          word.substr(0, word.length - sfx.length) +
          this.stemmerInputs.extensions[sfx];
      }
    }

    // step 3
    sfx = (/(ational|tional|alize|icate|iciti|ative|ical|ness|ful)$/.exec(
      word
    ) || eRx)[1];
    if (sfx && word.indexOf(sfx, R1) >= 0) {
      word =
        word.substr(0, word.length - sfx.length) +
        {
          ational: 'ate',
          tional: 'tion',
          alize: 'al',
          icate: 'ic',
          iciti: 'ic',
          ative: word.indexOf('ative', R2) >= 0 ? '' : 'ative',
          ical: 'ic',
          ness: '',
          ful: '',
        }[sfx];
    }

    // step 4
    sfx = /(ement|ance|ence|able|ible|ment|ant|ent|ism|ate|iti|ous|ive|ize|[st](ion)|al|er|ic)$/.exec(
      word
    );
    if (sfx) {
      sfx = sfx[2] || sfx[1];
      if (word.indexOf(sfx, R2) >= 0) {
        word = word.substr(0, word.length - sfx.length);
      }
    }

    // step 5
    if (word.substr(-1) == 'e') {
      if (
        word.substr(R2) ||
        (word.substr(R1) &&
          !/([^aeiouy][aeiouy][^aeiouywxY]|^[aeiouy][^aeiouy])e$/.test(word))
      ) {
        word = word.substr(0, word.length - 1);
      }
    } else if (word.substr(-2) == 'll' && word.indexOf('l', R2) >= 0) {
      word = word.substr(0, word.length - 1);
    }

    return word.toLowerCase();
  };
}
