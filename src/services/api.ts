import api from "@/lib/axios";

/* ============================================================
   INTERVIEW TYPES
============================================================ */

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
  question_text: string;
  question_type: string;
  question_order: number;
  interview_id: number;
  expected_answer: string | null;
  created_at: string;
}

export interface InterviewResponse {
  id: number;
  title: string;
  company: string | null;
  role: string;
  domain: string;
  difficulty: string;
  interview_type: string;
  total_questions: number;
  score: number;
}

/* ============================================================
   REPORT TYPES
============================================================ */

export interface QuestionReport {
  id: number;
  question_number: number;
  question: string;
  score: number;
  remark: string | null;
}

export interface ReportResponse {
  id: number;
  interview_id: number;

  overall_score: number;
  technical_score: number;
  answer_quality_score: number;
  problem_solving_score: number;
  communication_score: number;

  strengths: string | null;
  weaknesses: string | null;
  suggestions: string | null;
  final_feedback: string | null;

  question_reports: QuestionReport[];
}

/* ============================================================
   USER TYPES
============================================================ */

export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  target_role?: string | null;
  experience?: string | null;
  profile_photo?: string | null;
}

export interface UpdateProfileData {
  full_name: string;
  email: string;
  target_role: string;
  experience: string;
}

/* ============================================================
   RESUME TYPES
============================================================ */

export interface ResumeAnalysisResponse {
  atsScore: number;
  skillsFound: string[];
  missingSkills: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  experienceFeedback: string;
  projectsFeedback: string;
  keywordFeedback: string;
}

export interface LatestResumeAnalysisResponse {
  hasResume: boolean;
  atsScore: number | null;
  resumeAnalysisId?: number;
  filename?: string;
  createdAt?: string;
}

/* ============================================================
   AUTH SERVICE
============================================================ */

export const authService = {
  async uploadProfilePhoto(
  file: File
): Promise<CurrentUser> {
  const formData = new FormData();

  formData.append("file", file);

  try {
    console.log("📸 Uploading profile photo...");

    const response = await api.post(
      "/users/profile-photo",
      formData
    );

    console.log(
      "✅ Profile photo uploaded:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Profile photo upload failed:",
      error?.response?.data || error
    );

    throw error;
  }
},
  /* ==========================================================
     LOGIN
  ========================================================== */

  async login(email: string, password: string) {
    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Login failed:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     REGISTER
  ========================================================== */

  async register(
    full_name: string,
    email: string,
    password: string
  ) {
    try {
      const response = await api.post("/auth/register", {
        full_name,
        email,
        password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Registration failed:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     GET CURRENT USER
  ========================================================== */

  async getCurrentUser(): Promise<CurrentUser> {
    try {
      const response = await api.get("/users/me");

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to get current user:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     UPDATE PROFILE
  ========================================================== */

  async updateProfile(
    data: UpdateProfileData
  ): Promise<CurrentUser> {
    try {
      console.log("💾 Updating profile:", data);

      const response = await api.put(
        "/users/me",
        data
      );

      console.log(
        "✅ Profile updated:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to update profile:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     LOGOUT
  ========================================================== */

  logout() {
    localStorage.removeItem("token");
  },

  /* ==========================================================
     GET TOKEN
  ========================================================== */

  getToken() {
    return localStorage.getItem("token");
  },
};

/* ============================================================
   INTERVIEW SERVICE
============================================================ */

export const interviewService = {
  /* ==========================================================
     CREATE INTERVIEW
  ========================================================== */

  async startInterview(
    domain: InterviewDomain,
    difficulty: Difficulty
  ): Promise<InterviewResponse> {
    const payload = {
      title: `${domain} Mock Interview`,
      company: "General",
      role: "Software Engineer",
      domain,
      difficulty,
      interview_type: "Technical",

      // Keep 10 questions
      total_questions: 10,
    };

    try {
      console.log(
        "🚀 Starting interview..."
      );

      console.log(
        "📦 Payload:",
        payload
      );

      const response = await api.post(
        "/interviews/start",
        payload
      );

      console.log(
        "✅ Interview created:",
        response.data
      );

      if (!response.data?.id) {
        throw new Error(
          "Interview created but no interview ID was returned."
        );
      }

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to create interview:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     GET QUESTIONS
  ========================================================== */

  async getQuestions(
    interviewId: number
  ): Promise<InterviewQuestion[]> {
    if (!interviewId) {
      throw new Error(
        "Interview ID is missing."
      );
    }

    try {
      console.log(
        "📚 Fetching questions for interview:",
        interviewId
      );

      const response = await api.get(
        `/questions/${interviewId}`
      );

      console.log(
        "✅ Questions received:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch questions:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     SUBMIT ANSWER
  ========================================================== */

  async submitAnswer(
    question_id: number,
    answer_text: string
  ) {
    try {
      const response = await api.post(
        "/answers/submit",
        {
          question_id,
          answer_text,
        }
      );

      console.log(
        "✅ Answer submitted:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to submit answer:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     GENERATE REPORT
  ========================================================== */

  async generateReport(
    interviewId: number
  ): Promise<ReportResponse> {
    if (!interviewId) {
      throw new Error(
        "Interview ID is missing."
      );
    }

    try {
      const response = await api.post(
        `/reports/generate/${interviewId}`
      );

      console.log(
        "✅ Report generated:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to generate report:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     GET REPORT
  ========================================================== */

  async getReport(
    interviewId: number
  ): Promise<ReportResponse> {
    if (!interviewId) {
      throw new Error(
        "Interview ID is missing."
      );
    }

    try {
      console.log(
        "📄 Fetching report for interview:",
        interviewId
      );

      const response = await api.get(
        `/reports/${interviewId}`
      );

      console.log(
        "✅ Report received:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch report:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     HISTORY
  ========================================================== */

  async getHistory(): Promise<InterviewRecord[]> {
    try {
      const response = await api.get(
        "/interviews/history"
      );

      console.log(
        "📜 Interview history:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch interview history:",
        error?.response?.data || error
      );

      throw error;
    }
  },
};

/* ============================================================
   RESUME SERVICE
============================================================ */

export const resumeService = {
  /* ==========================================================
     ANALYZE RESUME
  ========================================================== */

  async analyze(
    file: File
  ): Promise<ResumeAnalysisResponse> {
    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    try {
      console.log(
        "📄 Sending resume for analysis..."
      );

      const response = await api.post(
        "/resume/analyze",
        formData
      );

      console.log(
        "✅ Resume analysis received:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Resume analysis failed:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     GET LATEST RESUME ANALYSIS
  ========================================================== */

  async getLatestAnalysis(): Promise<LatestResumeAnalysisResponse> {
    try {
      console.log(
        "📄 Fetching latest resume analysis..."
      );

      const response = await api.get(
        "/resume/latest"
      );

      console.log(
        "✅ Latest resume analysis:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch latest resume analysis:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  /* ==========================================================
     DOWNLOAD RESUME REPORT
  ========================================================== */

  async downloadReport(
    file: File
  ): Promise<void> {
    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    try {
      console.log(
        "📄 Generating resume PDF report..."
      );

      const response = await api.post(
        "/resume/report",
        formData,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "InterviewAI_Resume_Report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      console.log(
        "✅ Resume PDF downloaded."
      );
    } catch (error: any) {
      console.error(
        "❌ Failed to download resume report:",
        error?.response?.data || error
      );

      throw error;
    }
  },
};