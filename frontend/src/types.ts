export enum TaskStatus {
  YENI_TALEP = 'Yeni Talep',
  DEVAM_EDIYOR = 'Devam Ediyor',
  BEKLEMEDE = 'Beklemede',
  TEST_ASAMASINDA = 'Test Aşamasında',
  TAMAMLANDI = 'Tamamlandı',
}

export interface Person {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Feedback {
  id: string;
  text: string;
  timestamp: Date;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
}

export interface Task {
  id:string;
  title: string;
  description: string;
  status: TaskStatus;
  assignees: Person[];
  feedback: Feedback[];
  dueDate?: string; // e.g., 'YYYY-MM-DD'
}