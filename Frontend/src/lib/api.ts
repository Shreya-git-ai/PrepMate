/**
 * PrepMate API client.
 * Har backend endpoint yahan se ek typed function hai.
 * Token localStorage mein rehta hai; protected calls automatically
 * Authorization header attach kar dete hain.
 */

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "http://127.0.0.1:8000";

const TOKEN_KEY = "prepmate_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth: boolean = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response JSON nahi tha, statusText hi use karo
    }
    throw new ApiError(detail, res.status);
  }

  // 204 No Content jaisi responses ke liye
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- Auth ----------

export type User = { id: number; email: string; created_at: string };
export type Token = { access_token: string; token_type: string };

export function signup(email: string, password: string): Promise<User> {
  return request<User>(
    "/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    false
  );
}

export async function login(email: string, password: string): Promise<Token> {
  // backend OAuth2PasswordRequestForm expect karta hai -> form-encoded body,
  // JSON nahi. "username" field mein email jayega (OAuth2 spec convention).
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const token = await request<Token>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    false
  );

  setToken(token.access_token);
  return token;
}

export function logout() {
  clearToken();
}

// ---------- Documents ----------

export type Document = {
  id: number;
  filename: string;
  status: string;
  uploaded_at: string;
};

export function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  return request<Document>("/documents/upload", {
    method: "POST",
    body: formData,
    // Content-Type jaanbujh ke set nahi kiya -- browser khud
    // multipart boundary ke saath set karega
  });
}

export function getDocuments(): Promise<Document[]> {
  return request<Document[]>("/documents");
}

// ---------- Q&A ----------

export type AnswerResponse = { question: string; answer: string };

export function askQuestion(question: string, n_results = 3): Promise<AnswerResponse> {
  return request<AnswerResponse>("/qna/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, n_results }),
  });
}

// ---------- Quiz ----------

export type QuizQuestion = {
  id: number;
  question_text: string;
  options: string[];
};

export type Quiz = {
  id: number;
  topic: string;
  created_at: string;
  questions: QuizQuestion[];
};

export function generateQuiz(
  topic: string,
  num_questions = 5,
  document_id?: number
): Promise<Quiz> {
  return request<Quiz>("/quiz/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, num_questions, document_id }),
  });
}

export type AttemptResult = {
  question_id: number;
  is_correct: boolean;
  correct_answer: string;
  explanation: string | null;
};

export function submitAttempt(
  question_id: number,
  selected_option: string
): Promise<AttemptResult> {
  return request<AttemptResult>("/quiz/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id, selected_option }),
  });
}

// ---------- Mastery ----------

export type TopicMastery = {
  topic: string;
  total_attempts: number;
  correct: number;
  mastery_score: number;
};

export function getAllMastery(): Promise<TopicMastery[]> {
  return request<TopicMastery[]>("/mastery/all");
}

export function getWeakTopics(threshold = 0.6, min_attempts = 2): Promise<string[]> {
  return request<string[]>(`/mastery/weak?threshold=${threshold}&min_attempts=${min_attempts}`);
}

export { ApiError };