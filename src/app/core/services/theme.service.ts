import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type VisualStyle = 'default' | 'glass' | 'neumorphism';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  themeMode = signal<ThemeMode>(this.getStoredThemeMode());
  visualStyle = signal<VisualStyle>(this.getStoredVisualStyle());

  constructor() {
    effect(() => {
      this.applyTheme(this.themeMode(), this.visualStyle());
    });
  }

  private getStoredThemeMode(): ThemeMode {
    const stored = localStorage.getItem('themeMode') as ThemeMode;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getStoredVisualStyle(): VisualStyle {
    const stored = localStorage.getItem('visualStyle') as VisualStyle;
    if (stored === 'default' || stored === 'glass' || stored === 'neumorphism') return stored;
    return 'default';
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode.set(mode);
    localStorage.setItem('themeMode', mode);
  }

  setVisualStyle(style: VisualStyle) {
    this.visualStyle.set(style);
    localStorage.setItem('visualStyle', style);
  }

  toggleThemeMode() {
    const newMode = this.themeMode() === 'light' ? 'dark' : 'light';
    this.setThemeMode(newMode);
  }

  private applyTheme(mode: ThemeMode, style: VisualStyle) {
    const root = document.documentElement;
    
    // Reset
    root.classList.remove('dark', 'theme-glass', 'theme-neumorphism');

    // Apply Mode
    if (mode === 'dark') {
      root.classList.add('dark');
    }

    // Apply Style
    if (style === 'glass') {
      root.classList.add('theme-glass');
    } else if (style === 'neumorphism') {
      root.classList.add('theme-neumorphism');
    }
  }
}
