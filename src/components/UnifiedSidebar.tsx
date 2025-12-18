import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Project, TaskFilter } from '../types';
import { getTaskCount, cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';

interface UnifiedSidebarProps {
  projects: Project[];
  currentProject: Project | null;
  currentFilter: TaskFilter;
  onProjectSelect: (project: Project) => void;
  onAddProject: () => void;
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

const sidebarVariants = {
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

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  projects,
  currentProject,
  currentFilter,
  onProjectSelect,
  onAddProject,
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Unified Sidebar */}
      <motion.div
        className={cn(
          'w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col fixed top-0 left-0 z-50 lg:relative lg:z-auto',
          className
        )}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        {/* Header with User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold">
                SN
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">SangyeNorbu</div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors duration-150"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {t('app.categories')}
            </h3>
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium border-l-4 border-red-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-lg">{filter.icon}</span>
                    <span className="font-medium text-sm">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('app.projects')}
            </h3>
            <button
              onClick={onAddProject}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((project) => {
              const taskCount = getTaskCount(project.tasks);
              const isActive = currentProject?.id === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    onProjectSelect(project);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    'project-item',
                    isActive && 'active'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color || '#DC4C3E' }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                      {project.name}
                    </span>
                  </div>
                  {taskCount > 0 && (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {taskCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-400 dark:text-gray-500">
            Norbu's Todo
          </div>
        </div>
      </motion.div>
    </>
  );
};