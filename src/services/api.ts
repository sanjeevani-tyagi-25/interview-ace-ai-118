// Centralized service layer. Swap mock implementations for real FastAPI calls later.
// e.g. import axios from 'axios'; const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export type InterviewDomain =
  | "HR"
  | "DSA"
  | "Machine Learning"
  | "Data Science"
  | "System Design"
  | "Aptitude";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface InterviewRecord {
  id: string;
  date: string;
  domain: InterviewDomain;
  difficulty: Difficulty;
  score: number;
}

export interface InterviewQuestion {
  id: number;
  question: string;
}

export const authService = {
  async login(email: string, _password: string) {
    return { token: "mock-jwt", user: { email, name: "Sanjeevani" } };
  },
  async register(name: string, email: string, _password: string) {
    return { token: "mock-jwt", user: { email, name } };
  },
};

export const interviewService = {
  async getQuestions(_domain: InterviewDomain, _difficulty: Difficulty): Promise<InterviewQuestion[]> {
    return [
      { id: 1, question: "Tell me about yourself and why you're a great fit for this role." },
      { id: 2, question: "Explain the difference between an array and a linked list." },
      { id: 3, question: "Describe a challenging project you've worked on recently." },
      { id: 4, question: "How do you handle disagreements in a team setting?" },
      { id: 5, question: "Where do you see yourself in five years?" },
    ];
  },
  async getHistory(): Promise<InterviewRecord[]> {
    return [
      { id: "1", date: "2026-07-22", domain: "DSA", difficulty: "Medium", score: 82 },
      { id: "2", date: "2026-07-18", domain: "HR", difficulty: "Easy", score: 91 },
      { id: "3", date: "2026-07-14", domain: "System Design", difficulty: "Hard", score: 68 },
      { id: "4", date: "2026-07-05", domain: "Machine Learning", difficulty: "Medium", score: 76 },
    ];
  },
};

export const resumeService = {
  async analyze(_file: File | null) {
    return {
      atsScore: 84,
      skillsFound: ["React", "TypeScript", "Python", "SQL", "REST APIs", "Git"],
      missingSkills: ["Kubernetes", "GraphQL", "System Design"],
      suggestions: [
        "Add measurable impact metrics to your project bullets.",
        "Include a concise 3-line professional summary at the top.",
        "Tailor keywords to match the target job description.",
      ],
    };
  },
};
