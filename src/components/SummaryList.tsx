import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Project } from '../types';
import { formatDate } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface SummaryListProps {
  title: string;
  description: string;
  tasks: Task[];
  projects: Project[]; // Needed to look up project names
}

export const SummaryList: React.FC<SummaryListProps> = ({
  title,
  description,
  tasks,
  projects,
}) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Group tasks by project
  const groupedTasks = tasks.reduce((acc, task) => {
    const project = projects.find(p => p.id === task.projectId);
    const projectName = project ? project.name : 'Unknown Project';
    
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort tasks within groups by updated date (desc)
  Object.keys(groupedTasks).forEach(key => {
    groupedTasks[key].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  });

  const handleSmartSummary = async () => {
    setIsGenerating(true);
    setSummary(null);

    try {
      // Prepare data for AI
      const tasksText = tasks.map(t => 
        `- ${t.title} (Completed on: ${formatDate(t.updatedAt)})`
      ).join('\n');

      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      
      if (!apiKey) {
        setSummary("Please configure VITE_DEEPSEEK_API_KEY in your .env file to use this feature.");
        setIsGenerating(false);
        return;
      }

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that summarizes completed tasks. Provide a concise, encouraging summary of what has been accomplished. Use the same language as the tasks provided."
            },
            {
              role: "user",
              content: `Here are my completed tasks:\n${tasksText}\n\nPlease summarize my achievements.`
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummary(data.choices[0].message.content);

    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary("Failed to generate summary. Please check your network or API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
          
          <button
            onClick={handleSmartSummary}
            disabled={isGenerating || tasks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{t('app.smartSummary') || 'Smart Summary'}</span>
          </button>
        </div>

        {/* AI Summary Result */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900 rounded-lg p-4 text-gray-800 dark:text-gray-200 text-sm leading-relaxed"
            >
              <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Summary
              </div>
              <div className="whitespace-pre-wrap">{summary}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grouped Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {Object.entries(groupedTasks).length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No completed tasks found in this period.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
              <div key={projectName} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                  <div className="w-1 h-6 bg-brand-red-500 rounded-full" />
                  {projectName}
                  <span className="text-sm font-normal text-gray-400">
                    ({projectTasks.length})
                  </span>
                </h3>
                
                <div className="grid gap-2">
                  {projectTasks.map(task => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 dark:text-gray-100 font-medium truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Completed on {formatDate(task.updatedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
