export interface ThemePreset {
  id: string;
  name: string;
  nameAr?: string;
  preview: string; // CSS gradient for preview swatch
  sidebar: {
    style: 'gradient' | 'solid' | 'image' | 'wood' | 'dark';
    color1: string;
    color2: string;
    image?: string;
    opacity?: number;
  };
  content: {
    bg: string;
    cardBg: string;
  };
  accent: {
    color: string;
    hover: string;
  };
  darkMode: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Bois Classique',
    preview: 'linear-gradient(135deg, #5C2E00, #8B4513)',
    sidebar: { style: 'gradient', color1: '#5C2E00', color2: '#8B4513' },
    content: { bg: '#F9FAFB', cardBg: '#FFFFFF' },
    accent: { color: '#D97706', hover: '#B45309' },
    darkMode: false,
  },
  {
    id: 'dark-wood',
    name: 'Bois Foncé',
    preview: 'linear-gradient(135deg, #1a0a00, #3D1F00)',
    sidebar: { style: 'gradient', color1: '#1a0a00', color2: '#3D1F00' },
    content: { bg: '#111111', cardBg: '#1E1E1E' },
    accent: { color: '#F59E0B', hover: '#D97706' },
    darkMode: true,
  },
  {
    id: 'mahogany',
    name: 'Acajou',
    preview: 'linear-gradient(135deg, #4A0E0E, #8B2500)',
    sidebar: { style: 'gradient', color1: '#4A0E0E', color2: '#8B2500' },
    content: { bg: '#FFF5F5', cardBg: '#FFFFFF' },
    accent: { color: '#DC2626', hover: '#B91C1C' },
    darkMode: false,
  },
  {
    id: 'olive-wood',
    name: "Bois d'Olivier",
    preview: 'linear-gradient(135deg, #2D3319, #4A5D23)',
    sidebar: { style: 'gradient', color1: '#2D3319', color2: '#4A5D23' },
    content: { bg: '#FAFDF5', cardBg: '#FFFFFF' },
    accent: { color: '#65A30D', hover: '#4D7C0F' },
    darkMode: false,
  },
  {
    id: 'walnut',
    name: 'Noyer',
    preview: 'linear-gradient(135deg, #2C1810, #5C3A28)',
    sidebar: { style: 'gradient', color1: '#2C1810', color2: '#5C3A28' },
    content: { bg: '#F8F6F4', cardBg: '#FFFFFF' },
    accent: { color: '#92400E', hover: '#78350F' },
    darkMode: false,
  },
  {
    id: 'ocean-blue',
    name: 'Bleu Océan',
    preview: 'linear-gradient(135deg, #0C2340, #1E3A5F)',
    sidebar: { style: 'gradient', color1: '#0C2340', color2: '#1E3A5F' },
    content: { bg: '#F0F7FF', cardBg: '#FFFFFF' },
    accent: { color: '#2563EB', hover: '#1D4ED8' },
    darkMode: false,
  },
  {
    id: 'midnight',
    name: 'Minuit',
    preview: 'linear-gradient(135deg, #0F172A, #1E293B)',
    sidebar: { style: 'gradient', color1: '#0F172A', color2: '#1E293B' },
    content: { bg: '#0F172A', cardBg: '#1E293B' },
    accent: { color: '#6366F1', hover: '#4F46E5' },
    darkMode: true,
  },
  {
    id: 'emerald',
    name: 'Émeraude',
    preview: 'linear-gradient(135deg, #064E3B, #065F46)',
    sidebar: { style: 'gradient', color1: '#064E3B', color2: '#065F46' },
    content: { bg: '#F0FDF4', cardBg: '#FFFFFF' },
    accent: { color: '#059669', hover: '#047857' },
    darkMode: false,
  },
  {
    id: 'royal-purple',
    name: 'Violet Royal',
    preview: 'linear-gradient(135deg, #2E1065, #4C1D95)',
    sidebar: { style: 'gradient', color1: '#2E1065', color2: '#4C1D95' },
    content: { bg: '#FAF5FF', cardBg: '#FFFFFF' },
    accent: { color: '#7C3AED', hover: '#6D28D9' },
    darkMode: false,
  },
  {
    id: 'moroccan-zellige',
    name: 'Zellige Marocain',
    preview: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
    sidebar: {
      style: 'gradient',
      color1: '#1B4332',
      color2: '#2D6A4F',
    },
    content: { bg: '#FFF8F0', cardBg: '#FFFFFF' },
    accent: { color: '#C4973B', hover: '#8B6914' },
    darkMode: false,
  },
];
