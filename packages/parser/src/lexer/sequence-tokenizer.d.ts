import type { Token } from './tokens.js';
export declare class SequenceTokenizer {
  private input;
  private pos;
  private line;
  private column;
  private tokens;
  constructor(input: string);
  tokenize(): Token[];
  private scanToken;
  private tryMatchMessageArrow;
  private scanComment;
  private scanIdentifierOrKeyword;
  private getKeywordType;
  private scanNumber;
  private scanText;
  private skipWhitespace;
  private isAtNewlineOrEnd;
  private isDigit;
  private isAlpha;
  private isAlphaNumeric;
  private current;
  private peek;
  private advance;
  private addToken;
}
//# sourceMappingURL=sequence-tokenizer.d.ts.map
