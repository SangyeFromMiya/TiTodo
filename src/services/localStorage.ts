import { Category } from '../types';

const STORAGE_KEY = 'norbu-todo-data';

export interface StoredData {
  categories: Category[];
  version: string;
  lastUpdated: string;
}

export class LocalStorageService {
  // Save data to localStorage
  static save(categories: Category[]): void {
    try {
      const storedData: StoredData = {
        categories,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // Load data from localStorage
  static load(): Category[] | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsedData: StoredData = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return this.parseCategories(parsedData.categories);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return null;
    }
  }

  // Parse categories and convert date strings to Date objects
  private static parseCategories(categories: any[]): Category[] {
    return categories.map(category => ({
      ...category,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
      projects: category.projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        deadline: project.deadline ? new Date(project.deadline) : undefined,
        tasks: project.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })),
      })),
    }));
  }

  // Check if there's any saved data
  static hasData(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  // Clear all saved data
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Export data to JSON file
  static exportAsJSON(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No data to export');
      }

      const data = JSON.parse(stored);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `norbu-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }

  // Import data from JSON file
  static importFromJSON(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Validate data structure
          if (!data.categories || !Array.isArray(data.categories)) {
            throw new Error('Invalid data format');
          }
          
          // Save imported data
          this.save(this.parseCategories(data.categories));
          resolve(true);
        } catch (error) {
          console.error('Failed to import data:', error);
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  }
}