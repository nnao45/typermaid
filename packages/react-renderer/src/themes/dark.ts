import type { Theme } from './types.js';

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#4da6ff',
    secondary: '#adb5bd',
    background: '#1a1a1a',
    text: '#f8f9fa',
    border: '#495057',
    node: {
      fill: '#2d2d2d',
      stroke: '#4da6ff',
      text: '#f8f9fa',
    },
    edge: {
      stroke: '#4da6ff',
      text: '#adb5bd',
    },
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    size: {
      small: 12,
      medium: 14,
      large: 16,
    },
  },
  spacing: {
    node: 50,
    edge: 30,
    padding: 20,
  },
};
