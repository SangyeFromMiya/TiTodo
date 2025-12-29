import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, TaskFilter } from '../types';
import { Checkbox } from './Checkbox';
import { formatDate } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskListProps {
  project: Project | null;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
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
  onAddTask,
  onToggleTask,
  onDeleteTask,
  filter = 'all',
}) => {
  const { t } = useLanguage();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    // Mark for deletion after animation
    setTimeout(() => {
      onDeleteTask(taskId);
    }, 300);
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

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {project.id === 'all-tasks' ? t('app.allTasks') :
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
            {incompleteTasks.map((task) => (
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
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-gray-100 font-medium">
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {t('task.created')} {formatDate(task.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
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