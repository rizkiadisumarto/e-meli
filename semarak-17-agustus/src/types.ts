export interface Participant {
  id: string;
  name: string;
  lombaId: string;
  rt: string;
  registeredAt: string;
}

export interface ScoreEntry {
  id: string;
  lombaId: string;
  teamName: string;
  score: number;
}

export interface Lomba {
  id: string;
  name: string;
  icon: string;
  description: string;
  rules: string[];
  history: string;
  schedule: string;
  participants: Participant[];
  scores: ScoreEntry[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface GreetingCard {
  id: string;
  name: string;
  message: string;
  theme: 'red' | 'white' | 'gold';
  likes: number;
  createdAt: string;
}

export interface GeneratedPoster {
  id: string;
  url: string;
  prompt: string;
  style: string;
  resolution: string;
  createdAt: string;
}

export interface UserSession {
  name: string;
  role: 'warga' | 'panitia' | 'rt';
  rtNumber: string;
}

