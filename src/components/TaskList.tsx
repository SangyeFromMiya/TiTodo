import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Task, TaskFilter } from '../types';
import { Checkbox } from './Checkbox';
import { formatDate } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit2, X, Check, LayoutList, LayoutGrid } from 'lucide-react';

interface TaskListProps {
  project: Project | null;
  allProjects?: Project[];
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  filter?: TaskFilter;
}

const taskVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { 
    opacity: 0, 
    x: -100,
    scale: 0.95,
    transition: { duration: 0.3 }
  },
};

export const TaskList: React.FC<TaskListProps> = ({
  project,
  allProjects = [],
  onAddTask,
  onToggleTask,
  onUpdateTask,
  // onDeleteTask, // Temporarily unused
  filter = 'all',
}) => {
  const { t } = useLanguage();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  
  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditing = (task: { id: string, title: string }) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const saveEditing = () => {
    if (editingTaskId && editingTitle.trim()) {
      onUpdateTask(editingTaskId, editingTitle.trim());
      setEditingTaskId(null);
      setEditingTitle('');
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    onToggleTask(taskId);
  };

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-lg">
            {t('app.selectProject')}
          </div>
        </div>
      </div>
    );
  }

  const incompleteTasks = project.tasks.filter(task => !task.completed);
  const completedTasks = project.tasks.filter(task => task.completed);

  // Determine if we should group tasks by project
  const isGroupedView = allProjects.length > 0 && !allProjects.some(p => p.id === project.id);

  // Helper to render a single task in LIST view
  const renderListItem = (task: Task) => (
    <motion.div
      key={task.id}
      variants={taskVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="task-item"
    >
      <Checkbox
        checked={task.completed}
        priority={task.priority}
        onChange={() => handleTaskComplete(task.id)}
      />
      <div className="flex-1 group/task relative">
        {editingTaskId === task.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEditing();
                } else if (e.key === 'Escape') {
                  cancelEditing();
                }
              }}
              onBlur={saveEditing}
              className="flex-1 bg-white dark:bg-gray-700 border border-brand-red-500 rounded px-2 py-1 outline-none text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <button
              onClick={saveEditing}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEditing}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div 
                className="text-gray-900 dark:text-gray-100 font-medium cursor-text"
                onDoubleClick={() => startEditing(task)}
              >
                {task.title}
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {t('task.created')} {formatDate(task.createdAt)}
              </div>
            </div>
            
            {/* Edit Button (visible on hover) */}
            <button
              onClick={() => startEditing(task)}
              className="opacity-0 group-hover/task:opacity-100 p-1.5 text-gray-400 hover:text-brand-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
              title={t('project.edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Helper to render a single task in CARD view
  const renderCardItem = (task: Task) => (
    <motion.div
      key={task.id}
      variants={taskVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group/card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Checkbox
          checked={task.completed}
          priority={task.priority}
          onChange={() => handleTaskComplete(task.id)}
        />
        <button
          onClick={() => startEditing(task)}
          className="opacity-0 group-hover/card:opacity-100 p-1.5 text-gray-400 hover:text-brand-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
          title={t('project.edit')}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        {editingTaskId === task.id ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEditing();
                } else if (e.key === 'Escape') {
                  cancelEditing();
                }
              }}
              onBlur={saveEditing}
              className="w-full bg-white dark:bg-gray-700 border border-brand-red-500 rounded px-2 py-1 outline-none text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <div className="flex justify-end gap-2">
               <button onClick={saveEditing} className="p-1 text-green-600"><Check className="w-4 h-4" /></button>
               <button onClick={cancelEditing} className="p-1 text-red-600"><X className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <div 
            className="text-gray-900 dark:text-gray-100 font-medium text-lg cursor-text break-words"
            onDoubleClick={() => startEditing(task)}
          >
            {task.title}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        <span>{formatDate(task.createdAt)}</span>
      </div>
    </motion.div>
  );

  // Grouping logic
  const groupTasks = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const pId = task.projectId || 'unknown';
      if (!groups[pId]) groups[pId] = [];
      groups[pId].push(task);
    });
    return groups;
  };

  const incompleteGroups = isGroupedView ? groupTasks(incompleteTasks) : {};
  
  const getProjectName = (pid: string) => {
    if (pid === 'unknown') return 'No Project';
    return allProjects.find(p => p.id === pid)?.name || 'Unknown Project';
  };

  const renderTasksContent = () => {
     if (isGroupedView) {
        return Object.entries(incompleteGroups).map(([projectId, tasks]) => (
            <div key={projectId} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 mb-4 sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm py-2 z-10 rounded-lg">
                <div className="w-1 h-6 bg-brand-red-500 rounded-full" />
                {getProjectName(projectId)}
                <span className="text-sm font-normal text-gray-400">
                  ({tasks.length})
                </span>
              </h3>
              
              {viewMode === 'list' ? (
                <div className="pl-0 md:pl-4 border-l-0 md:border-l-2 border-transparent md:border-gray-100 md:dark:border-gray-800 ml-0 md:ml-1.5 space-y-1">
                  {tasks.map(task => renderListItem(task))}
                </div>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tasks.map(task => renderCardItem(task))}
                 </div>
              )}
            </div>
          ));
     } else {
         return viewMode === 'list' ? (
            <div className="space-y-1">
                {incompleteTasks.map((task) => renderListItem(task))}
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {incompleteTasks.map((task) => renderCardItem(task))}
            </div>
         );
     }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {project.id === 'all-tasks' ? t('app.allTasks') :
             project.id === 'weekly-summary' ? t('app.weeklySummary') :
             project.id === 'monthly-summary' ? t('app.monthlySummary') :
             project.id === 'yearly-summary' ? t('app.yearlySummary') :
             filter === 'all' ? t('app.allTasks') : 
             filter === 'personal' ? t('app.personal') : 
             filter === 'work' ? t('app.work') : 
             filter === 'completed' ? t('app.completed') : 
             project.name}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {incompleteTasks.length} {incompleteTasks.length === 1 ? t('app.task') : t('app.tasks')}
          </div>
          
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
              {project.description}
            </p>
          )}

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mt-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-brand-red-500 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="List View"
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'card' 
                  ? 'bg-white dark:bg-gray-600 text-brand-red-500 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Card View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 max-w-7xl mx-auto w-full">
          
          {/* Incomplete Tasks */}
          <AnimatePresence>
            {renderTasksContent()}
          </AnimatePresence>

          {/* Add Task - Only show in list mode or maybe floating? 
              For now keep it at bottom, but adapt style.
          */}
          {!isAddingTask ? (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 hover:border-brand-red-500 hover:text-brand-red-500 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 rounded-full border-2 border-current" />
              {t('app.addTask')}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
               {/* Add Task Input - simplified for now */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-brand-red-500">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleAddTask();
                    } else if (e.key === 'Escape') {
                        setIsAddingTask(false);
                        setNewTaskTitle('');
                    }
                    }}
                    onBlur={handleAddTask}
                    placeholder={t('task.addPlaceholder')}
                    className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg"
                    autoFocus
                />
              </div>
            </motion.div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6 text-center">
                {t('app.completed')}
              </div>
              <AnimatePresence>
                <div className={viewMode === 'list' ? "space-y-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                    {completedTasks.map((task) => (
                    <motion.div
                        key={task.id}
                        variants={taskVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`opacity-60 ${viewMode === 'list' ? 'task-item' : 'bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800'}`}
                    >
                        <div className="flex items-start gap-3">
                            <Checkbox
                            checked={task.completed}
                            priority={task.priority}
                            onChange={() => handleTaskComplete(task.id)}
                            />
                            <div className="flex-1">
                            <div className="text-gray-500 dark:text-gray-dark-muted line-through break-words">
                                {task.title}
                            </div>
                            </div>
                        </div>
                    </motion.div>
                    ))}
                </div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
