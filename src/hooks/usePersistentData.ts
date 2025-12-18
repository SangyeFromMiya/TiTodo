import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { LocalStorageService } from '../services/localStorage';

export function usePersistentData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        const savedCategories = LocalStorageService.load();
        if (savedCategories) {
          setCategories(savedCategories);
        } else {
          // If no saved data, use default data
          setCategories(getDefaultCategories());
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default data
        setCategories(getDefaultCategories());
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-save whenever categories change
  useEffect(() => {
    if (categories.length > 0 && !isLoading) {
      const saveData = () => {
        LocalStorageService.save(categories);
        setLastSaved(new Date());
      };

      // Debounce save to avoid too frequent writes
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, isLoading]);

  // Add new category
  const addCategory = useCallback((category: Category) => {
    setCategories(prev => [...prev, category]);
  }, []);

  // Update category
  const updateCategory = useCallback((categoryId: string, updates: Partial<Category>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, ...updates, updatedAt: new Date() }
          : category
      )
    );
  }, []);

  // Delete category
  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
  }, []);

  // Add project to category
  const addProject = useCallback((categoryId: string, project: Category['projects'][0]) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              projects: [...category.projects, project],
              updatedAt: new Date(),
            }
          : category
      )
    );
  }, []);

  // Update project
  const updateProject = useCallback((categoryId: string, projectId: string, updates: Partial<Category['projects'][0]>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              projects: category.projects.map(project =>
                project.id === projectId
                  ? { ...project, ...updates, updatedAt: new Date() }
                  : project
              ),
              updatedAt: new Date(),
            }
          : category
      )
    );
  }, []);

  // Delete project
  const deleteProject = useCallback((categoryId: string, projectId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              projects: category.projects.filter(project => project.id !== projectId),
              updatedAt: new Date(),
            }
          : category
      )
    );
  }, []);

  // Add task to project
  const addTask = useCallback((categoryId: string, projectId: string, task: Category['projects'][0]['tasks'][0]) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              projects: category.projects.map(project =>
                project.id === projectId
                  ? {
                      ...project,
                      tasks: [...project.tasks, task],
                      updatedAt: new Date(),
                    }
                  : project
              ),
              updatedAt: new Date(),
            }
          : category
      )
    );
  }, []);

  // Update task
  const updateTask = useCallback((categoryId: string, projectId: string, taskId: string, updates: Partial<Category['projects'][0]['tasks'][0]>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              projects: category.projects.map(project =>
                project.id === projectId
                  ? {
                      ...project,
                      tasks: project.tasks.map(task =>
                        task.id === taskId
                          ? { ...task, ...updates, updatedAt: new Date() }
                          : task
                      ),
                      updatedAt: new Date(),
                    }
                  : project
              ),
              updatedAt: new Date(),
            }
          : category
      )
    );
  }, []);

  // Delete task
  const deleteTask = useCallback((categoryId: string, projectId: string, taskId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              projects: category.projects.map(project =>
                project.id === projectId
                  ? {
                      ...project,
                      tasks: project.tasks.filter(task => task.id !== taskId),
                      updatedAt: new Date(),
                    }
                  : project
              ),
              updatedAt: new Date(),
            }
          : category
      )
    );
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    LocalStorageService.clear();
    setCategories(getDefaultCategories());
    setLastSaved(null);
  }, []);

  // Export data
  const exportData = useCallback(() => {
    LocalStorageService.exportAsJSON();
  }, []);

  // Import data
  const importData = useCallback(async (file: File): Promise<void> => {
    const success = await LocalStorageService.importFromJSON(file);
    if (success) {
      const loadedCategories = LocalStorageService.load();
      if (loadedCategories) {
        setCategories(loadedCategories);
      }
    }
  }, []);

  return {
    categories,
    setCategories,
    isLoading,
    lastSaved,
    addCategory,
    updateCategory,
    deleteCategory,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    clearAllData,
    exportData,
    importData,
  };
}

// Get default categories for first-time users
function getDefaultCategories(): Category[] {
  return [
    {
      id: 'personal',
      name: 'Personal',
      icon: '👤',
      color: '#DC4C3E',
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'work',
      name: 'Work',
      icon: '💼',
      color: '#2563EB',
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}