'use client';

import React, { useState } from 'react';
import { Paintbrush, X, Check, Palette, Monitor, Sun, Moon, RotateCcw } from 'lucide-react';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { THEME_PRESETS } from '@/lib/admin-theme-presets';
import { AdminButton } from '@/components/ui/admin-button';

export function ThemeCustomizer() {
  const { theme, setTheme, applyPreset, saveTheme, isSaving } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FLOATING BUTTON — always visible in bottom-right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-110 transition-all flex items-center justify-center"
        title="Personnaliser le thème"
      >
        <Paintbrush className="w-5 h-5" />
      </button>

      {/* BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* DRAWER — slides from right */}
      <div
        className={`fixed top-0 right-0 z-[201] h-full w-[380px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Palette className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thème Admin</h2>
              <p className="text-xs text-gray-400">Personnalisez votre espace</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-[calc(100vh-160px)] px-6 py-5 space-y-6">
          {/* SECTION 1: Preset Themes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-amber-600" />
              Thèmes prédéfinis
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    theme.presetName === preset.id
                      ? 'border-amber-500 shadow-md shadow-amber-500/20 ring-2 ring-amber-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {/* Preview swatch */}
                  <div className="h-16 w-full" style={{ background: preset.preview }}>
                    {/* Mini preview layout */}
                    <div className="flex h-full">
                      <div
                        className="w-1/3 h-full opacity-80"
                        style={{ background: preset.preview }}
                      />
                      <div className="w-2/3 h-full p-1.5">
                        <div
                          className="w-full h-full rounded"
                          style={{ backgroundColor: preset.content.bg }}
                        >
                          <div className="p-1">
                            <div
                              className="h-1.5 w-3/4 rounded"
                              style={{ backgroundColor: preset.accent.color, opacity: 0.6 }}
                            />
                            <div className="h-1 w-1/2 rounded mt-1 bg-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1.5 bg-white dark:bg-gray-800">
                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300 text-center truncate">
                      {preset.name}
                    </p>
                  </div>
                  {/* Selected check */}
                  {theme.presetName === preset.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Sidebar Colors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Couleurs de la barre latérale
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 w-20">Couleur 1</label>
                <input
                  type="color"
                  value={theme.sidebarColor1}
                  onChange={(e) =>
                    setTheme({ sidebarColor1: e.target.value, presetName: 'custom' })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={theme.sidebarColor1}
                  onChange={(e) =>
                    setTheme({ sidebarColor1: e.target.value, presetName: 'custom' })
                  }
                  className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-xs font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 w-20">Couleur 2</label>
                <input
                  type="color"
                  value={theme.sidebarColor2}
                  onChange={(e) =>
                    setTheme({ sidebarColor2: e.target.value, presetName: 'custom' })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={theme.sidebarColor2}
                  onChange={(e) =>
                    setTheme({ sidebarColor2: e.target.value, presetName: 'custom' })
                  }
                  className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-xs font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              {/* Live preview */}
              <div
                className="h-12 rounded-xl border dark:border-gray-700"
                style={{
                  background: `linear-gradient(135deg, ${theme.sidebarColor1}, ${theme.sidebarColor2})`,
                }}
              />
            </div>
          </div>

          {/* SECTION 3: Content Area */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Zone de contenu
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 w-20">Fond</label>
                <input
                  type="color"
                  value={theme.contentBg}
                  onChange={(e) => setTheme({ contentBg: e.target.value, presetName: 'custom' })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={theme.contentBg}
                  onChange={(e) => setTheme({ contentBg: e.target.value, presetName: 'custom' })}
                  className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-xs font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 w-20">Cartes</label>
                <input
                  type="color"
                  value={theme.contentCardBg}
                  onChange={(e) =>
                    setTheme({ contentCardBg: e.target.value, presetName: 'custom' })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={theme.contentCardBg}
                  onChange={(e) =>
                    setTheme({ contentCardBg: e.target.value, presetName: 'custom' })
                  }
                  className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-xs font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Accent Color */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Couleur d&apos;accent
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => setTheme({ accentColor: e.target.value, presetName: 'custom' })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => setTheme({ accentColor: e.target.value, presetName: 'custom' })}
                className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-xs font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            {/* Quick accent colors */}
            <div className="flex gap-2">
              {[
                '#D97706',
                '#DC2626',
                '#059669',
                '#2563EB',
                '#7C3AED',
                '#DB2777',
                '#0891B2',
                '#84CC16',
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setTheme({ accentColor: c, presetName: 'custom' })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-125 ${
                    theme.accentColor === c ? 'border-gray-800 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* SECTION 5: Dark Mode Toggle */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Mode d&apos;affichage
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme({ darkMode: false })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  !theme.darkMode
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                Clair
              </button>
              <button
                onClick={() => setTheme({ darkMode: true })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  theme.darkMode
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                Sombre
              </button>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() => applyPreset('default')}
            className="w-full px-4 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser par défaut
          </button>
        </div>

        {/* FOOTER — Save button */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <AdminButton
            variant="primary"
            size="lg"
            loading={isSaving}
            onClick={async () => {
              await saveTheme();
              setIsOpen(false);
            }}
            className="w-full"
            icon={<Check className="w-4 h-4" />}
          >
            Enregistrer le thème
          </AdminButton>
        </div>
      </div>
    </>
  );
}
