import type { Theme } from './types.js';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
    border: '#dee2e6',
    node: {
      fill: '#ffffff',
      stroke: '#0066cc',
      text: '#212529',
    },
    edge: {
      stroke: '#0066cc',
      text: '#6c757d',
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
