import React from 'react';
import { Globe, Sun, Moon, Download, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../types';

interface TopBarProps {
  onExportData?: () => void;
  onImportData?: (file: File) => Promise<void>;
  lastSaved?: Date | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  onExportData,
  onImportData,
  lastSaved,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();

  const languages = [
    { code: 'en' as Language, name: 'English', native: 'English' },
    { code: 'zh' as Language, name: 'Chinese', native: '中文' },
    { code: 'bo' as Language, name: 'Tibetan', native: 'བོད་ཡིག' },
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportData) {
      onImportData(file).then(() => {
        // Clear input
        e.target.value = '';
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Data Operations */}
      <div className="flex items-center gap-1">
        {/* Import Button */}
        <label className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </label>

        {/* Export Button */}
        <button
          onClick={onExportData}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
          title="Export data"
        >
          <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && (
        <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
          {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        {darkMode ? (
          <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <Moon className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Language Selector */}
      <div className="relative group">
        <button className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language.toUpperCase()}
          </span>
        </button>
        
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.native}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};