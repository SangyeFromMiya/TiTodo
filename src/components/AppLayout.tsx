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
    clearAllData,
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
    
    // Set initial current project when categories are loaded
    if (categories.length > 0 && !currentProject) {
      const firstProject = categories[0].projects[0] || null;
      setCurrentProject(firstProject);
      if (firstProject) {
        setCurrentFilter(firstProject.categoryId as TaskFilter);
      }
    }
  }, [language, categories, currentProject]);

  
  // Get filtered tasks based on current filter (this might not be needed anymore)
  const getFilteredTasks = () => {
    if (!currentProject) return [];
    return currentProject.tasks;
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    // Set the filter to the project's category
    setCurrentFilter(project.categoryId as TaskFilter);
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

  const handleAddTask = (title: string) => {
    if (!currentProject) return;

    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(currentProject.categoryId, currentProject.id, newTask);
    
    setCurrentProject(prev =>
      prev ? { ...prev, tasks: [...prev.tasks, newTask], updatedAt: new Date() } : null
    );
  };

  const handleToggleTask = (taskId: string) => {
    if (!currentProject) return;

    const task = currentProject.tasks.find(t => t.id === taskId);
    if (!task) return;

    updateTask(
      currentProject.categoryId,
      currentProject.id,
      taskId,
      { completed: !task.completed }
    );

    // Update local state
    setCurrentProject(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date() } : task
      )
    } : null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentProject) return;

    deleteTask(currentProject.categoryId, currentProject.id, taskId);

    // Update local state
    setCurrentProject(prev => prev ? {
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
      updatedAt: new Date()
    } : null);
  };

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
          onResetData={clearAllData}
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
            project={currentProject ? {
              ...currentProject,
              tasks: getFilteredTasks()
            } : null}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            filter={currentFilter}
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