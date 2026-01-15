import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Task, TaskFilter } from '../types';
import { Checkbox } from './Checkbox';
import { formatDate } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit2, X, Check } from 'lucide-react';

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
  // Group if the current view is NOT a specific project view
  // i.e., project.id is a virtual ID like 'all-tasks', 'personal', 'work', 'completed'
  // AND we have tasks to show
  const isGroupedView = allProjects.length > 0 && !allProjects.some(p => p.id === project.id);

  // Helper to render a single task
  const renderTask = (task: Task) => (
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
  // Sort groups by project name (or some other criteria? Maybe just keys for now)
  // We can use allProjects to sort by creation date or name if needed.
  
  const getProjectName = (pid: string) => {
    if (pid === 'unknown') return 'No Project';
    return allProjects.find(p => p.id === pid)?.name || 'Unknown Project';
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {incompleteTasks.length} {incompleteTasks.length === 1 ? t('app.task') : t('app.tasks')}
          </div>
        </div>
        {project.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {project.description}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          
          {/* Incomplete Tasks */}
          <AnimatePresence>
            {isGroupedView ? (
              // Grouped View
              Object.entries(incompleteGroups).map(([projectId, tasks]) => (
                <div key={projectId} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                    <div className="w-1 h-6 bg-brand-red-500 rounded-full" />
                    {getProjectName(projectId)}
                    <span className="text-sm font-normal text-gray-400">
                      ({tasks.length})
                    </span>
                  </h3>
                  <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-1.5">
                    {tasks.map(task => renderTask(task))}
                  </div>
                </div>
              ))
            ) : (
              // Flat View
              incompleteTasks.map((task) => renderTask(task))
            )}
          </AnimatePresence>

          {/* Add Task */}
          {!isAddingTask ? (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full task-item text-left text-gray-400 dark:text-gray-dark-muted hover:text-gray-600 dark:hover:text-gray-dark-text transition-colors duration-150"
            >
              {t('app.addTask')}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="task-item"
            >
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-dark-border mr-3" />
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
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-dark-text placeholder-gray-400 dark:placeholder-gray-dark-muted"
                autoFocus
              />
            </motion.div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-4">
                {t('app.completed')}
              </div>
              <AnimatePresence>
                {/* For completed tasks, we can also group if needed, but usually flat list is fine for "Completed" section at bottom. 
                    However, if the user wanted "Project Grouping" for the main view, they might expect it for completed too. 
                    The request specifically mentioned "incomplete tasks" in the description: "display current category's incomplete tasks... grouped".
                    So I will leave completed tasks flat for now to avoid over-complicating the bottom section, unless it looks weird.
                    Let's keep it flat as per specific request for "incomplete tasks".
                */}
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={taskVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="task-item opacity-60"
                  >
                    <Checkbox
                      checked={task.completed}
                      priority={task.priority}
                      onChange={() => handleTaskComplete(task.id)}
                    />
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-dark-muted line-through">
                        {task.title}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
