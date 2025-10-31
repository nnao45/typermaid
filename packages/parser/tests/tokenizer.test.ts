import { describe, expect, it } from 'vitest';
import { Tokenizer } from '../src/lexer/tokenizer.js';

describe('Tokenizer', () => {
  describe('Keywords', () => {
    it('should tokenize flowchart keyword', () => {
      const tokenizer = new Tokenizer('flowchart LR');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(3); // FLOWCHART, LR, EOF
      expect(tokens[0]?.type).toBe('FLOWCHART');
      expect(tokens[1]?.type).toBe('LR');
    });

    it('should tokenize direction keywords', () => {
      const directions = ['TB', 'TD', 'BT', 'LR', 'RL'];

      for (const dir of directions) {
        const tokenizer = new Tokenizer(`flowchart ${dir}`);
        const tokens = tokenizer.tokenize();
        expect(tokens[1]?.type).toBe(dir);
      }
    });

    it('should tokenize subgraph and end', () => {
      const tokenizer = new Tokenizer('subgraph test\nend');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('SUBGRAPH');
      expect(tokens[1]?.type).toBe('IDENTIFIER');
      expect(tokens[2]?.type).toBe('NEWLINE');
      expect(tokens[3]?.type).toBe('END');
    });
  });

  describe('Node shapes', () => {
    it('should tokenize square brackets', () => {
      const tokenizer = new Tokenizer('[text]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('SQUARE_OPEN');
      expect(tokens[0]?.value).toBe('[');
      expect(tokens[2]?.type).toBe('SQUARE_CLOSE');
    });

    it('should tokenize double square brackets', () => {
      const tokenizer = new Tokenizer('[[text]]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('SQUARE_OPEN');
      expect(tokens[0]?.value).toBe('[[');
      expect(tokens[2]?.type).toBe('SQUARE_CLOSE');
    });

    it('should tokenize round brackets', () => {
      const tokenizer = new Tokenizer('(text)');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ROUND_OPEN');
      expect(tokens[0]?.value).toBe('(');
      expect(tokens[2]?.type).toBe('ROUND_CLOSE');
    });

    it('should tokenize double round brackets', () => {
      const tokenizer = new Tokenizer('((text))');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ROUND_OPEN');
      expect(tokens[0]?.value).toBe('((');
      expect(tokens[2]?.type).toBe('ROUND_CLOSE');
    });

    it('should tokenize triple round brackets', () => {
      const tokenizer = new Tokenizer('(((text)))');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ROUND_OPEN');
      expect(tokens[0]?.value).toBe('(((');
    });

    it('should tokenize curly brackets', () => {
      const tokenizer = new Tokenizer('{text}');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('CURLY_OPEN');
      expect(tokens[0]?.value).toBe('{');
      expect(tokens[2]?.type).toBe('CURLY_CLOSE');
    });

    it('should tokenize double curly brackets', () => {
      const tokenizer = new Tokenizer('{{text}}');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('CURLY_OPEN');
      expect(tokens[0]?.value).toBe('{{');
    });

    it('should tokenize asymmetric shape', () => {
      const tokenizer = new Tokenizer('>text]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ASYMMETRIC');
    });

    it('should tokenize stadium shape', () => {
      const tokenizer = new Tokenizer('([text])');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ROUND_OPEN');
      expect(tokens[0]?.value).toBe('([');
    });

    it('should tokenize cylindrical shape', () => {
      const tokenizer = new Tokenizer('[(text)]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('SQUARE_OPEN');
      expect(tokens[0]?.value).toBe('[(');
    });
  });

  describe('Edge types', () => {
    it('should tokenize arrow', () => {
      const tokenizer = new Tokenizer('-->');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ARROW');
      expect(tokens[0]?.value).toBe('-->');
    });

    it('should tokenize line', () => {
      const tokenizer = new Tokenizer('---');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('LINE');
      expect(tokens[0]?.value).toBe('---');
    });

    it('should tokenize dotted arrow', () => {
      const tokenizer = new Tokenizer('-.->');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('DOTTED_ARROW');
      expect(tokens[0]?.value).toBe('-.->');
    });

    it('should tokenize dotted line', () => {
      const tokenizer = new Tokenizer('-.-');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('DOTTED_LINE');
      expect(tokens[0]?.value).toBe('-.-');
    });

    it('should tokenize thick arrow', () => {
      const tokenizer = new Tokenizer('==>');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('THICK_ARROW');
      expect(tokens[0]?.value).toBe('==>');
    });

    it('should tokenize thick line', () => {
      const tokenizer = new Tokenizer('===');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('THICK_LINE');
      expect(tokens[0]?.value).toBe('===');
    });

    it('should tokenize invisible edge', () => {
      const tokenizer = new Tokenizer('~~~');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('INVISIBLE');
      expect(tokens[0]?.value).toBe('~~~');
    });

    it('should tokenize circle edge', () => {
      const tokenizer = new Tokenizer('--o');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('CIRCLE_EDGE');
      expect(tokens[0]?.value).toBe('--o');
    });

    it('should tokenize cross edge', () => {
      const tokenizer = new Tokenizer('--x');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('CROSS_EDGE');
      expect(tokens[0]?.value).toBe('--x');
    });

    it('should tokenize edge with label', () => {
      const tokenizer = new Tokenizer('-->|label|');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('ARROW');
      expect(tokens[1]?.type).toBe('PIPE');
      expect(tokens[2]?.type).toBe('IDENTIFIER');
      expect(tokens[3]?.type).toBe('PIPE');
    });
  });

  describe('Literals', () => {
    it('should tokenize identifiers', () => {
      const tokenizer = new Tokenizer('nodeA node_B node123');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('IDENTIFIER');
      expect(tokens[0]?.value).toBe('nodeA');
      expect(tokens[1]?.type).toBe('IDENTIFIER');
      expect(tokens[1]?.value).toBe('node_B');
      expect(tokens[2]?.type).toBe('IDENTIFIER');
      expect(tokens[2]?.value).toBe('node123');
    });

    it('should tokenize strings', () => {
      const tokenizer = new Tokenizer('"hello world" \'test\'');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('STRING');
      expect(tokens[0]?.value).toBe('hello world');
      expect(tokens[1]?.type).toBe('STRING');
      expect(tokens[1]?.value).toBe('test');
    });

    it('should tokenize numbers', () => {
      const tokenizer = new Tokenizer('123 45.67 0.5');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('NUMBER');
      expect(tokens[0]?.value).toBe('123');
      expect(tokens[1]?.type).toBe('NUMBER');
      expect(tokens[1]?.value).toBe('45.67');
      expect(tokens[2]?.type).toBe('NUMBER');
      expect(tokens[2]?.value).toBe('0.5');
    });
  });

  describe('Comments', () => {
    it('should tokenize comments', () => {
      const tokenizer = new Tokenizer('%% This is a comment\nA');
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('COMMENT');
      expect(tokens[1]?.type).toBe('NEWLINE');
      expect(tokens[2]?.type).toBe('IDENTIFIER');
    });
  });

  describe('Complex flowchart', () => {
    it('should tokenize complete flowchart', () => {
      const input = `flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]`;

      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      expect(tokens[0]?.type).toBe('FLOWCHART');
      expect(tokens[1]?.type).toBe('LR');
      expect(tokens[2]?.type).toBe('NEWLINE');
      expect(tokens[3]?.type).toBe('IDENTIFIER'); // A
      expect(tokens[4]?.type).toBe('SQUARE_OPEN');
      expect(tokens[5]?.type).toBe('IDENTIFIER'); // Start
      expect(tokens[6]?.type).toBe('SQUARE_CLOSE');
      expect(tokens[7]?.type).toBe('ARROW');
    });
  });

  describe('Error handling', () => {
    it('should throw on unterminated string', () => {
      const tokenizer = new Tokenizer('"unclosed');
      expect(() => tokenizer.tokenize()).toThrow('Unterminated string');
    });

    it('should throw on unexpected character', () => {
      const tokenizer = new Tokenizer('@invalid');
      expect(() => tokenizer.tokenize()).toThrow('Unexpected character');
    });
  });
});
