import React from 'react';
import { motion } from 'framer-motion';
import { TaskFilter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface FilterSidebarProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

interface FilterItem {
  id: TaskFilter;
  icon: string;
  label: string;
}

const filterSidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentFilter,
  onFilterChange,
  isOpen,
  onToggle,
  className,
}) => {
  const { t } = useLanguage();

  const filters: FilterItem[] = [
    { id: 'all', icon: '📋', label: t('app.allTasks') },
    { id: 'personal', icon: '👤', label: t('app.personal') },
    { id: 'work', icon: '💼', label: t('app.work') },
    { id: 'completed', icon: '✅', label: t('app.completed') },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
        />
      )}

      {/* Filter Sidebar */}
      <motion.div
        className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col ${className}`}
        variants={filterSidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('app.categories')}
          </h3>
        </div>

        {/* Filter List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-1">
            {filters.map((filter) => {
              const isActive = currentFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    onFilterChange(filter.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium border-l-4 border-red-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{filter.icon}</span>
                  <span className="font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Task Filter
          </div>
        </div>
      </motion.div>
    </>
  );
};