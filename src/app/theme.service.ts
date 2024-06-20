import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeKey = 'color-theme';

  constructor() {
    this.loadTheme();
  }

  private loadTheme() {
    const isDarkMode = localStorage.getItem(this.darkModeKey) === 'dark' || 
      (!localStorage.getItem(this.darkModeKey) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem(this.darkModeKey, isDarkMode ? 'dark' : 'light');
  }
}
