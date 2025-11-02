import { useState } from 'react';
import { darkTheme, lightTheme, type Theme } from '../themes';

export function useTheme(initialTheme: 'light' | 'dark' | Theme = 'light'): Theme {
  const [theme] = useState<Theme>(() => {
    if (typeof initialTheme === 'string') {
      return initialTheme === 'dark' ? darkTheme : lightTheme;
    }
    return initialTheme;
  });

  return theme;
}
