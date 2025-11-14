export interface UserSessionData {
  quizId: number;
  userId?: string | null; // Изменено на необязательное поле
  sessionId?: string;
  currentQuestionIndex: number;
  correctAnswersCount: number;
  totalPoints: number;
  answers: { questionId: number; answerId: number | null }[];
  browserInfo: {
    userAgent: string;
    language: string;
    screen: { width: number; height: number };
    timezone: string;
    cookiesEnabled: boolean;
    platform: string;
    referrer: string;
    ipAddress?: string;
    geolocation?: { latitude: number; longitude: number };
  };
}

export interface UserResult {
  userId?: string | null; // Изменено на необязательное поле
  quizId: number;
  sessionId?: string;
  score: number;
  answers: { questionId: number; answerId: number }[];
  createdAt?: string; // Сделано необязательным, так как клиент не передает
  geo?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  sessions?: UserSessionData[];
  results?: UserResult[];
  uuid?: string;
  geo?: string;
}