'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEME_PRESETS } from '@/lib/admin-theme-presets';

interface ThemeSettings {
  sidebarStyle: string;
  sidebarColor1: string;
  sidebarColor2: string;
  sidebarImage?: string;
  sidebarOpacity: number;
  contentBg: string;
  contentCardBg: string;
  accentColor: string;
  accentHover: string;
  darkMode: boolean;
  presetName: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (updates: Partial<ThemeSettings>) => void;
  applyPreset: (presetId: string) => void;
  saveTheme: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

const defaultTheme: ThemeSettings = {
  sidebarStyle: 'gradient',
  sidebarColor1: '#5C2E00',
  sidebarColor2: '#8B4513',
  sidebarOpacity: 1.0,
  contentBg: '#F9FAFB',
  contentCardBg: '#FFFFFF',
  accentColor: '#D97706',
  accentHover: '#B45309',
  darkMode: false,
  presetName: 'default',
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetch('/api/admin/theme');
        if (res.ok) {
          const data = await res.json();
          if (data) setThemeState({ ...defaultTheme, ...data });
        }
      } catch (err) {
        console.error('Failed to load theme:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-color1', theme.sidebarColor1);
    root.style.setProperty('--sidebar-color2', theme.sidebarColor2);
    root.style.setProperty('--sidebar-opacity', String(theme.sidebarOpacity));
    root.style.setProperty('--content-bg', theme.contentBg);
    root.style.setProperty('--content-card-bg', theme.contentCardBg);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--accent-hover', theme.accentHover);

    if (theme.darkMode) {
      root.classList.add('admin-dark');
    } else {
      root.classList.remove('admin-dark');
    }
  }, [theme]);

  const setTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setThemeState((prev) => ({ ...prev, ...updates }));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setThemeState({
      sidebarStyle: preset.sidebar.style,
      sidebarColor1: preset.sidebar.color1,
      sidebarColor2: preset.sidebar.color2,
      sidebarImage: preset.sidebar.image,
      sidebarOpacity: preset.sidebar.opacity || 1.0,
      contentBg: preset.content.bg,
      contentCardBg: preset.content.cardBg,
      accentColor: preset.accent.color,
      accentHover: preset.accent.hover,
      darkMode: preset.darkMode,
      presetName: presetId,
    });
  }, []);

  const saveTheme = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
    } catch (err) {
      console.error('Failed to save theme:', err);
    } finally {
      setIsSaving(false);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyPreset, saveTheme, isLoading, isSaving }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used inside AdminThemeProvider');
  return ctx;
}
