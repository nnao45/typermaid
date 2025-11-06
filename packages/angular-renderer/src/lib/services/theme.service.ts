import { computed, Injectable, signal } from '@angular/core';
import { z } from 'zod';

export const ThemeSchema = z.object({
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
    border: z.string(),
    node: z.object({
      fill: z.string(),
      stroke: z.string(),
      strokeWidth: z.number(),
    }),
    edge: z.object({
      stroke: z.string(),
      strokeWidth: z.number(),
    }),
    grid: z.string(),
  }),
  fonts: z.object({
    primary: z.string(),
    monospace: z.string(),
  }),
  spacing: z.object({
    padding: z.number(),
    margin: z.number(),
  }),
});

export type Theme = z.infer<typeof ThemeSchema>;

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#000000',
    border: '#e5e7eb',
    node: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
    },
    edge: {
      stroke: '#000000',
      strokeWidth: 2,
    },
    grid: '#e0e0e0',
  },
  fonts: {
    primary: 'Arial, sans-serif',
    monospace: 'Courier New, monospace',
  },
  spacing: {
    padding: 10,
    margin: 20,
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    background: '#1e1e1e',
    text: '#ffffff',
    border: '#374151',
    node: {
      fill: '#2d2d2d',
      stroke: '#ffffff',
      strokeWidth: 2,
    },
    edge: {
      stroke: '#ffffff',
      strokeWidth: 2,
    },
    grid: '#444444',
  },
  fonts: {
    primary: 'Arial, sans-serif',
    monospace: 'Courier New, monospace',
  },
  spacing: {
    padding: 10,
    margin: 20,
  },
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentThemeName = signal<'light' | 'dark'>('light');

  theme = computed(() => (this.currentThemeName() === 'light' ? lightTheme : darkTheme));

  setTheme(name: 'light' | 'dark'): void {
    this.currentThemeName.set(name);
  }

  toggleTheme(): void {
    this.setTheme(this.currentThemeName() === 'light' ? 'dark' : 'light');
  }
}
