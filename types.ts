// Domain Entities

export enum QuestionType {
  Calculation = 'Calculation',
  WordProblem = 'WordProblem',
  Geometry = 'Geometry',
  Logic = 'Logic',
  NumberTheory = 'NumberTheory'
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  classType: string;
  teacher: string;
}

export interface Question {
  id: string;
  examId: string;
  index: number;
  imageSliceUrl: string; // URL to the image of the question text
  maxScore: number;
  knowledgePoint: string;
  type: QuestionType;
  solutionImageSliceUrl?: string; // Standard solution
  standardAnswer: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  standardPaperImages: string[]; // URLs of the blank paper pages
  status: 'draft' | 'analyzed' | 'grading' | 'completed';
}

export interface QuestionResult {
  questionId: string;
  studentAnswerImageSliceUrl?: string; // Crop of student's answer
  score: number;
  isCorrect: boolean;
  errorAnalysis?: string; // AI generated reason for error
  studentAnswerText?: string; // OCR'd text
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentId: string;
  paperImages: string[];
  status: 'uploaded' | 'graded';
  results: QuestionResult[];
  totalScore: number;
}

// Analytics Types
export interface ClassAnalysis {
  examId: string;
  totalStudents: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  scoreDistribution: { range: string; count: number }[];
  questionStats: {
    questionIndex: number;
    errorRate: number; // 0-1
    avgScore: number;
    mainErrorFactors: string[];
  }[];
  knowledgePointStats: {
    point: string;
    accuracy: number; // 0-1
    issue: string;
  }[];
}
