import React, { useState, useEffect } from 'react';
import { CategorySidebar } from './CategorySidebar';
import { ProjectModal } from './ProjectModal';
import { TaskList } from './TaskList';
import { TopBar } from './TopBar';
import { Menu } from 'lucide-react';
import { Project, Task, TaskFilter } from '../types';
import { generateId } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentData } from '../hooks/usePersistentData';

export const AppLayout: React.FC = () => {
  const { language } = useLanguage();
  
  const {
    categories,
    isLoading,
    lastSaved,
    addProject,
    updateProject,
    deleteProject,
    addTask,
   updateTask,
    deleteTask,
    exportData,
    importData,
  } = usePersistentData();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>('personal');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectCategoryId, setNewProjectCategoryId] = useState<string>('');

  useEffect(() => {
    // Apply language class to body for Tibetan special handling
    document.body.className = language === 'bo' ? 'lang-bo' : '';
    
    // We no longer auto-select the first project.
    // Instead, if no project is selected, we'll show the "All Tasks" view.
  }, [language]);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    // Set the filter to the project's category
    setCurrentFilter(project.categoryId as TaskFilter);
  };

  const handleSummarySelect = (type: 'weekly-summary' | 'monthly-summary' | 'yearly-summary') => {
    setCurrentFilter(type);
    setCurrentProject(null); // Clear current project to show summary view
  };

  const handleAddProject = (categoryId: string) => {
    setNewProjectCategoryId(categoryId);
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProjectCategoryId('');
    setProjectModalOpen(true);
  };

  const handleSaveProject = (projectData: { name: string; description?: string; deadline?: string }) => {
    if (editingProject) {
      // Edit existing project
      updateProject(
        editingProject.categoryId,
        editingProject.id,
        {
          name: projectData.name,
          description: projectData.description,
          deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
        }
      );

      // Update current project if it's the one being edited
      if (currentProject?.id === editingProject.id) {
        setCurrentProject(prev => prev ? {
          ...prev,
          name: projectData.name,
          description: projectData.description,
          deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
          updatedAt: new Date(),
        } : null);
      }
    } else {
      // Create new project
      const newProject: Project = {
        id: generateId(),
        name: projectData.name,
        description: projectData.description,
        deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
        categoryId: newProjectCategoryId,
        color: newProjectCategoryId === 'personal' ? '#DC4C3E' : '#2563EB',
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [],
      };

      addProject(newProjectCategoryId, newProject);

      // Automatically select the new project
      setCurrentProject(newProject);
      setCurrentFilter(newProjectCategoryId as TaskFilter);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    // Find the project to delete
    let projectToDelete: Project | null = null;
    let projectCategoryId: string | null = null;
    
    for (const category of categories) {
      const project = category.projects.find(p => p.id === projectId);
      if (project) {
        projectToDelete = project;
        projectCategoryId = category.id;
        break;
      }
    }

    if (projectToDelete && projectCategoryId) {
      deleteProject(projectCategoryId, projectId);

      // If the deleted project was the current project, select the first available project
      if (currentProject?.id === projectId) {
        const remainingProjects = categories
          .flatMap(cat => cat.projects)
          .filter(p => p.id !== projectId);
        
        if (remainingProjects.length > 0) {
          setCurrentProject(remainingProjects[0]);
          setCurrentFilter(remainingProjects[0].categoryId as TaskFilter);
        } else {
          setCurrentProject(null);
        }
      }
    }
  };

  // Helper to find task location
  const findTaskLocation = (taskId: string) => {
    for (const cat of categories) {
      for (const proj of cat.projects) {
        const task = proj.tasks.find(t => t.id === taskId);
        if (task) {
          return { categoryId: cat.id, projectId: proj.id, task };
        }
      }
    }
    return null;
  };

  const handleAddTask = (title: string) => {
    // If a project is selected, add to it.
    // If no project is selected (All Tasks view), add to the first available project.
    let targetProjectId = currentProject?.id;
    let targetCategoryId = currentProject?.categoryId;

    if (!targetProjectId && categories.length > 0 && categories[0].projects.length > 0) {
        targetCategoryId = categories[0].id;
        targetProjectId = categories[0].projects[0].id;
    }

    if (!targetProjectId || !targetCategoryId) return;

    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(targetCategoryId, targetProjectId, newTask);
    
    // If we are in specific project view, update local state
    if (currentProject && currentProject.id === targetProjectId) {
        setCurrentProject(prev =>
        prev ? { ...prev, tasks: [...prev.tasks, newTask], updatedAt: new Date() } : null
        );
    }
  };

  const handleToggleTask = (taskId: string) => {
    const location = findTaskLocation(taskId);
    if (!location) return;

    const { categoryId, projectId, task } = location;

    updateTask(
      categoryId,
      projectId,
      taskId,
      { completed: !task.completed }
    );

    // Update local state if we are viewing a specific project
    if (currentProject && currentProject.id === projectId) {
        setCurrentProject(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
        )
        } : null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const location = findTaskLocation(taskId);
    if (!location) return;

    const { categoryId, projectId } = location;

    deleteTask(categoryId, projectId, taskId);

    // Update local state if we are viewing a specific project
    if (currentProject && currentProject.id === projectId) {
        setCurrentProject(prev => prev ? {
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId),
        updatedAt: new Date()
        } : null);
    }
  };

  // Construct the "All Tasks" project view
  const getAllTasksProject = (): Project => {
      const allTasks = categories.flatMap(c => c.projects.flatMap(p => p.tasks));
      // Sort by creation date desc
      allTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return {
          id: 'all-tasks',
          name: 'All Tasks', 
          description: 'Overview of all your tasks',
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: allTasks,
          categoryId: 'all'
      };
  };

  const projectToShow = currentProject || getAllTasksProject();

  return (
    <div className={`h-screen flex overflow-hidden bg-white dark:bg-gray-900 ${language === 'bo' ? 'lang-bo' : ''}`}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg lg:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* TopBar with Data Operations */}
      <div className="fixed top-4 right-4 z-50">
        <TopBar
          onExportData={exportData}
          onImportData={importData}
          lastSaved={lastSaved}
        />
      </div>

      {/* Category Sidebar */}
      <div className="hidden lg:block">
        <CategorySidebar
          categories={categories}
          currentProject={currentProject}
          currentFilter={currentFilter}
          onProjectSelect={handleProjectSelect}
          onAddProject={handleAddProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onSelectSummary={handleSummarySelect}
          isOpen={true}
          onToggle={() => {}}
        />
      </div>

      {/* Mobile Category Sidebar */}
      <CategorySidebar
        categories={categories}
        currentProject={currentProject}
        currentFilter={currentFilter}
        onProjectSelect={handleProjectSelect}
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onSelectSummary={handleSummarySelect}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-0 left-0 z-40 lg:hidden"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-300">
            Loading...
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!isLoading && (
          <TaskList
            project={projectToShow}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onUpdateTask={(taskId, title) => {
              const location = findTaskLocation(taskId);
              if (!location) return;
              updateTask(location.categoryId, location.projectId, taskId, { title });
              if (currentProject?.id === location.projectId) {
                setCurrentProject(prev => prev ? {
                  ...prev,
                  tasks: prev.tasks.map(t => t.id === taskId ? { ...t, title, updatedAt: new Date() } : t)
                } : null);
              }
            }}
            onDeleteTask={handleDeleteTask}
            filter={currentProject ? currentFilter : 'all'}
          />
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        mode={editingProject ? 'edit' : 'create'}
        initialData={editingProject ? {
          name: editingProject.name,
          description: editingProject.description,
          deadline: editingProject.deadline ? editingProject.deadline.toISOString().split('T')[0] : undefined,
        } : undefined}
      />
    </div>
  );
};