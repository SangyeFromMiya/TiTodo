export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Language = 'en' | 'zh' | 'bo';

export type TaskFilter = 'personal' | 'work' | 'all' | 'completed' | 'weekly-summary' | 'monthly-summary' | 'yearly-summary';

export interface AppState {
  user: User | null;
  categories: Category[];
  currentProject: Project | null;
  language: Language;
  darkMode: boolean;
  sidebarOpen: boolean;
  taskFilter: TaskFilter;
}