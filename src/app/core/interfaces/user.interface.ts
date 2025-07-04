export interface UserResult {
    id: number;
    userId: number;
    quizId: number;
    score: number;
    answers: any; // Или уточните тип, если знаете структуру
    createdAt: string;
  }