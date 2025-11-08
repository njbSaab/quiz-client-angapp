export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
  points: number;
}

export interface Question {
  id: number;
  text: string;
  image?: string;
  order?: number;
  answers: Answer[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  previewImage?: string;
  firstPage?: string;
  finalPage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  categoryId?: number;
  img?: string;
  rating?: number; 
  isMainView: boolean;
}