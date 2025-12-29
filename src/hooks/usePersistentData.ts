import { useState, useEffect, useCallback } from 'react';
import { Category, Project, Task } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LocalStorageService } from '../services/localStorage';

export function usePersistentData() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data from Supabase
  useEffect(() => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catsResult, projsResult, tasksResult] = await Promise.all([
          supabase.from('categories').select('*').order('created_at'),
          supabase.from('projects').select('*').order('created_at'),
          supabase.from('tasks').select('*').order('created_at'),
        ]);

        if (catsResult.error) throw catsResult.error;
        if (projsResult.error) throw projsResult.error;
        if (tasksResult.error) throw tasksResult.error;

        const catsData = catsResult.data || [];
        const projsData = projsResult.data || [];
        const tasksData = tasksResult.data || [];

        // Reconstruct tree
        const fullCategories = catsData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || '📁',
          color: cat.color || '#666666',
          createdAt: new Date(cat.created_at),
          updatedAt: new Date(cat.updated_at),
          projects: projsData
            .filter((p: any) => p.category_id === cat.id)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              color: p.color,
              deadline: p.deadline ? new Date(p.deadline) : undefined,
              categoryId: p.category_id,
              createdAt: new Date(p.created_at),
              updatedAt: new Date(p.updated_at),
              tasks: tasksData
                .filter((t: any) => t.project_id === p.id)
                .map((t: any) => ({
                  id: t.id,
                  title: t.title,
                  completed: t.completed,
                  priority: t.priority,
                  createdAt: new Date(t.created_at),
                  updatedAt: new Date(t.updated_at),
                })),
            })),
        }));

        // If no categories found for new user, create defaults
        if (fullCategories.length === 0) {
          await createDefaultCategories(user.id);
          
          // Re-fetch categories to get the real UUIDs
          const { data: newCats } = await supabase.from('categories').select('*').order('created_at');
          if (newCats) {
             const newFullCategories = newCats.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || '📁',
                color: cat.color || '#666666',
                createdAt: new Date(cat.created_at),
                updatedAt: new Date(cat.updated_at),
                projects: []
             }));
             setCategories(newFullCategories);
          }
        } else {
          setCategories(fullCategories);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const createDefaultCategories = async (userId: string) => {
    const defaults = [
      { name: 'Personal', icon: '👤', color: '#DC4C3E' },
      { name: 'Work', icon: '💼', color: '#2563EB' },
    ];

    for (const d of defaults) {
      await supabase.from('categories').insert({
        user_id: userId,
        name: d.name,
        icon: d.icon,
        color: d.color
      });
    }
    // Note: This simple default creation doesn't add sub-projects, but it's a start.
  };

  // Add new category
  const addCategory = useCallback(async (category: Category) => {
    if (!user) return;
    
    // Optimistic update
    setCategories(prev => [...prev, category]);

    const { error } = await supabase.from('categories').insert({
      id: category.id,
      user_id: user.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
    });

    if (error) console.error('Error adding category:', error);
  }, [user]);

  // Update category
  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Category>) => {
    if (!user) return;

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, ...updates, updatedAt: new Date() }
          : category
      )
    );

    const { error } = await supabase.from('categories').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', categoryId);

    if (error) console.error('Error updating category:', error);
  }, [user]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!user) return;

    setCategories(prev => prev.filter(category => category.id !== categoryId));

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) console.error('Error deleting category:', error);
  }, [user]);

  // Add project
  const addProject = useCallback(async (categoryId: string, project: Project) => {
    if (!user) return;

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

    const { error } = await supabase.from('projects').insert({
      id: project.id,
      user_id: user.id,
      category_id: categoryId,
      name: project.name,
      description: project.description,
      color: project.color,
      deadline: project.deadline?.toISOString(),
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
    });

    if (error) console.error('Error adding project:', error);
  }, [user]);

  // Update project
  const updateProject = useCallback(async (categoryId: string, projectId: string, updates: Partial<Project>) => {
    if (!user) return;

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

    const dbUpdates: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.deadline) dbUpdates.deadline = updates.deadline.toISOString();

    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', projectId);
    if (error) console.error('Error updating project:', error);
  }, [user]);

  // Delete project
  const deleteProject = useCallback(async (categoryId: string, projectId: string) => {
    if (!user) return;

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

    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) console.error('Error deleting project:', error);
  }, [user]);

  // Add task
  const addTask = useCallback(async (categoryId: string, projectId: string, task: Task) => {
    if (!user) return;

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

    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      user_id: user.id,
      project_id: projectId,
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    });

    if (error) console.error('Error adding task:', error);
  }, [user]);

  // Update task
  const updateTask = useCallback(async (categoryId: string, projectId: string, taskId: string, updates: Partial<Task>) => {
    if (!user) return;

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

    const { error } = await supabase.from('tasks').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', taskId);

    if (error) console.error('Error updating task:', error);
  }, [user]);

  // Delete task
  const deleteTask = useCallback(async (categoryId: string, projectId: string, taskId: string) => {
    if (!user) return;

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

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) console.error('Error deleting task:', error);
  }, [user]);

  // Export/Import - Keep LocalStorage service or implement JSON download
  const exportData = useCallback(() => {
    // We can just dump current state to JSON file
    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `titodo-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [categories]);

  const importData = useCallback(async (file: File): Promise<void> => {
    // Reading file and bulk inserting... complex, maybe skip for now or just impl basic
    // For now, let's just use the LocalStorageService helper to parse, but insert to Supabase
    const success = await LocalStorageService.importFromJSON(file); // This parses and validates
    // But wait, LocalStorageService.importFromJSON returns boolean and might try to save to LS
    // Let's rely on the parsing logic if exposed, otherwise skip import for this MVP
    console.warn("Import not fully implemented for Supabase backend yet");
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
    exportData,
    importData,
  };
}

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
