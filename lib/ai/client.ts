import { AIProvider } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: { base64: string; mimeType: string }[];
}

export abstract class AIClient {
  protected apiKey: string;
  protected modelId: string;

  constructor(apiKey: string, modelId: string) {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  abstract sendMessage(messages: ChatMessage[]): Promise<string>;
  abstract sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void>;
  abstract validateApiKey(): Promise<boolean>;
  abstract getProvider(): AIProvider;
}

export class OpenAIClient extends AIClient {
  private baseUrl = 'https://api.openai.com/v1';

  getProvider(): AIProvider {
    return 'openai';
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private formatMessageContent(m: ChatMessage): unknown {
    const parts: { type: string; text?: string; image_url?: { url: string } }[] = [];
    if (m.content) parts.push({ type: 'text', text: m.content });
    if (m.images) {
      for (const img of m.images) {
        parts.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.base64}` } });
      }
    }
    if (parts.length === 0) return '';
    if (parts.length === 1 && parts[0].type === 'text') return parts[0].text!;
    return parts;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: this.formatMessageContent(m),
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[OpenAI Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[OpenAI Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: this.formatMessageContent(m),
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[OpenAI Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[OpenAI Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export class GoogleAIClient extends AIClient {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  getProvider(): AIProvider {
    return 'google';
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const systemMsg = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const contents = nonSystemMessages.map(m => {
      const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];
      if (m.content) parts.push({ text: m.content });
      if (m.images) {
        for (const img of m.images) {
          parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
        }
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: 0.9,
      },
    };

    if (systemMsg) {
      body.system_instruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    const response = await fetch(
      `${this.baseUrl}/models/${this.modelId}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[Google API Error]', errorBody);
        if (errorBody.error?.message) {
          errorMsg = errorBody.error.message;
        }
      } catch {
        if (errorText) {
          console.error('[Google API Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    if (!candidate) return '';

    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
      console.warn('[Google] Response blocked, finishReason:', candidate.finishReason);
      return `Response blocked: ${candidate.finishReason}`;
    }

    return candidate.content?.parts?.[0]?.text || '';
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const systemMsg = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const contents = nonSystemMessages.map(m => {
      const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];
      if (m.content) parts.push({ text: m.content });
      if (m.images) {
        for (const img of m.images) {
          parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
        }
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: 0.9,
      },
    };

    if (systemMsg) {
      body.system_instruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    const response = await fetch(
      `${this.baseUrl}/models/${this.modelId}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[Google API Error]', errorBody);
        if (errorBody.error?.message) {
          errorMsg = errorBody.error.message;
        }
      } catch {
        if (errorText) {
          console.error('[Google API Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('data: ')) {
          const raw = trimmed.slice(6);

          try {
            const json = JSON.parse(raw);
            const candidate = json.candidates?.[0];
            if (!candidate) continue;

            if (candidate.finishReason && candidate.finishReason !== 'STOP') {
              console.warn('[Google] Stream finished with reason:', candidate.finishReason);
              continue;
            }

            const text = candidate.content?.parts?.[0]?.text;
            if (text) onChunk(text);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export class AnthropicAIClient extends AIClient {
  private baseUrl = 'https://api.anthropic.com/v1';

  getProvider(): AIProvider {
    return 'anthropic';
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return response.ok || response.status === 400;
    } catch {
      return false;
    }
  }

  private formatAnthropicContent(m: ChatMessage): unknown {
    if (!m.images || m.images.length === 0) return m.content;
    const blocks: { type: string; text?: string; source?: { type: string; media_type: string; data: string } }[] = [];
    if (m.content) blocks.push({ type: 'text', text: m.content });
    for (const img of m.images) {
      blocks.push({ type: 'image', source: { type: 'base64', media_type: img.mimeType, data: img.base64 } });
    }
    return blocks;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const systemMsg = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const body: Record<string, unknown> = {
      model: this.modelId,
      max_tokens: 4096,
      messages: nonSystemMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: this.formatAnthropicContent(m),
      })),
    };

    if (systemMsg) {
      body.system = systemMsg.content;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[Anthropic Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[Anthropic Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const systemMsg = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const body: Record<string, unknown> = {
      model: this.modelId,
      max_tokens: 4096,
      messages: nonSystemMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: this.formatAnthropicContent(m),
      })),
      stream: true,
    };

    if (systemMsg) {
      body.system = systemMsg.content;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[Anthropic Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[Anthropic Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (!data.trim()) continue;

          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta' && json.delta?.text) {
              onChunk(json.delta.text);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export class DeepSeekAIClient extends AIClient {
  private baseUrl = 'https://api.deepseek.com/v1';

  getProvider(): AIProvider {
    return 'deepseek';
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private checkNoImages(messages: ChatMessage[]) {
    if (messages.some(m => m.images && m.images.length > 0)) {
      throw new Error('DeepSeek does not support image inputs');
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    this.checkNoImages(messages);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[DeepSeek Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[DeepSeek Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    this.checkNoImages(messages);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[DeepSeek Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[DeepSeek Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export class GroqClient extends AIClient {
  private baseUrl = 'https://api.groq.com/openai/v1';

  getProvider(): AIProvider {
    return 'groq';
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private checkNoImages(messages: ChatMessage[]) {
    if (messages.some(m => m.images && m.images.length > 0)) {
      throw new Error('Groq does not support image inputs');
    }
  }

  private formatMessageContent(m: ChatMessage): unknown {
    const parts: { type: string; text?: string; image_url?: { url: string } }[] = [];
    if (m.content) parts.push({ type: 'text', text: m.content });
    if (m.images) {
      for (const img of m.images) {
        parts.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.base64}` } });
      }
    }
    if (parts.length === 0) return '';
    if (parts.length === 1 && parts[0].type === 'text') return parts[0].text!;
    return parts;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    this.checkNoImages(messages);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: this.formatMessageContent(m),
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[Groq Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[Groq Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    this.checkNoImages(messages);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: this.formatMessageContent(m),
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(errorText);
        console.error('[Groq Error]', errorBody);
        if (errorBody.error?.message) errorMsg = errorBody.error.message;
      } catch {
        if (errorText) {
          console.error('[Groq Error body]', errorText);
          errorMsg = `HTTP ${response.status}: ${errorText.slice(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export function createAIClient(provider: AIProvider, apiKey: string, modelId: string): AIClient {
  switch (provider) {
    case 'openai':
      return new OpenAIClient(apiKey, modelId);
    case 'google':
      return new GoogleAIClient(apiKey, modelId);
    case 'anthropic':
      return new AnthropicAIClient(apiKey, modelId);
    case 'deepseek':
      return new DeepSeekAIClient(apiKey, modelId);
    case 'groq':
      return new GroqClient(apiKey, modelId);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}