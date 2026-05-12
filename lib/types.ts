export type AIProvider = 'openai' | 'google' | 'anthropic' | 'deepseek' | 'groq';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  apiKey: string;
  modelId: string;
  temperature: number;
  systemPrompt?: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
}