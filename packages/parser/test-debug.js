import { Tokenizer } from './src/lexer/tokenizer.js';

const tokenizer = new Tokenizer('>text]');
const tokens = tokenizer.tokenize();

console.log('First token:', tokens[0]);
console.log('Token type:', tokens[0]?.type);
console.log(
  'All tokens:',
  tokens.map((t) => ({ type: t.type, value: t.value }))
);
