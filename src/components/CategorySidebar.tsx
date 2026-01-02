import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronRight, Calendar, Trash2, Edit, LogOut, LayoutList, CalendarRange, CalendarDays } from 'lucide-react';
import { Category, Project, TaskFilter } from '../types';
import { getTaskCount, cn, formatDate } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface CategorySidebarProps {
  categories: Category[];
  currentProject: Project | null;
  currentFilter: TaskFilter;
  onProjectSelect: (project: Project) => void;
  onAddProject: (categoryId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  onSelectSummary: (type: 'weekly-summary' | 'monthly-summary' | 'yearly-summary') => void;
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

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  currentProject,
  currentFilter,
  onProjectSelect,
  onAddProject,
  onEditProject,
  onDeleteProject,
  isOpen,
  onToggle,
  className,
  onSelectSummary,
}) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Update expandedCategories when categories are loaded to include all category IDs
  React.useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(prev => {
         const newIds = categories.map(c => c.id);
         // Merge unique IDs
         return Array.from(new Set([...prev, ...newIds]));
      });
    }
  }, [categories]);

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'GU';
  const displayName = user?.email || 'Guest User';

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryName = (category: Category) => {
    // Try to translate standard categories
    if (['Personal', 'Work'].includes(category.name)) {
      const key = `app.${category.name.toLowerCase()}`;
      const translation = t(key);
      // If translation exists and is different from key, use it
      if (translation !== key) return translation;
    }
    return category.name;
  };

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

      {/* Category Sidebar */}
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
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={displayName}>
                  {displayName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors duration-150"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories with Projects */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          
          {/* Summary Section */}
          <div className="mb-6 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('app.summaries')}
            </div>
            
            <button
              onClick={() => {
                onSelectSummary('weekly-summary');
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                currentFilter === 'weekly-summary'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutList className="w-5 h-5" />
              <span>{t('app.weeklySummary')}</span>
            </button>

            <button
              onClick={() => {
                onSelectSummary('monthly-summary');
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                currentFilter === 'monthly-summary'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>{t('app.monthlySummary')}</span>
            </button>

            <button
              onClick={() => {
                onSelectSummary('yearly-summary');
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                currentFilter === 'yearly-summary'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <CalendarRange className="w-5 h-5" />
                 <span>{t('app.yearlySummary')}</span>
            </button>
          </div>

          <div className="space-y-2">
            {categories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const categoryTaskCount = category.projects.reduce(
                (total, project) => total + getTaskCount(project.tasks),
                0
              );

              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 ${
                      currentFilter === category.id
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium border-l-4 border-red-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{getCategoryName(category)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {categoryTaskCount > 0 && (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          {categoryTaskCount}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Projects in Category */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 space-y-1"
                      >
                        {/* Add Project Button */}
                        <button
                          onClick={() => {
                            onAddProject(category.id);
                            if (window.innerWidth < 1024) {
                              onToggle();
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150"
                        >
                          <Plus className="w-3 h-3" />
                          {t('project.create')}
                        </button>

                        {/* Project List */}
                        {category.projects.map((project) => {
                          const taskCount = getTaskCount(project.tasks);
                          const isActive = currentProject?.id === project.id;

                          return (
                            <div
                              key={project.id}
                              className={cn(
                                'group cursor-pointer transition-colors duration-150',
                                isActive
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                              )}
                            >
                              <div className="px-3 py-2">
                                {/* Project Title Row */}
                                <div
                                  className="flex items-center gap-2 mb-1"
                                  onClick={() => {
                                    onProjectSelect(project);
                                    if (window.innerWidth < 1024) {
                                      onToggle();
                                    }
                                  }}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: project.color || '#DC4C3E' }}
                                  />
                                  <span className="text-sm font-medium truncate flex-1">
                                    {project.name}
                                  </span>
                                  {taskCount > 0 && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                                      {taskCount}
                                    </span>
                                  )}
                                </div>

                                {/* Project Details Row */}
                                <div className="flex items-center justify-between text-xs">
                                  {/* Deadline */}
                                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                    {project.deadline && (
                                      <>
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(project.deadline)}</span>
                                      </>
                                    )}
                                    {!project.deadline && (
                                      <span className="text-gray-300 dark:text-gray-600 italic">
                                        {t('project.noDeadline')}
                                      </span>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditProject(project);
                                        if (window.innerWidth < 1024) {
                                          onToggle();
                                        }
                                      }}
                                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors duration-150"
                                      title={t('project.edit')}
                                    >
                                      <Edit className="w-3 h-3 text-blue-500" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(t('project.deleteConfirm'))) {
                                          onDeleteProject(project.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-150"
                                      title={t('project.delete')}
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-400 dark:text-gray-500">
            TiTodo
          </div>
        </div>
      </motion.div>
    </>
  );
};
