import { AIProvider } from '../types';

export interface ModelOption {
  id: string;
  name: string;
}

export const PROVIDER_INFO: Record<AIProvider, { name: string; icon: string; color: string; logo: string; supportsImages: boolean }> = {
  openai: { name: 'OpenAI', icon: 'smart_toy', color: '#10a37f', logo: '/openai-icon.webp', supportsImages: true },
  google: { name: 'Google', icon: 'smart_toy', color: '#4285f4', logo: '/gemini-icon.webp', supportsImages: true },
  anthropic: { name: 'Anthropic', icon: 'smart_toy', color: '#d4a574', logo: '/anthropic-icon.webp', supportsImages: true },
  deepseek: { name: 'DeepSeek', icon: 'smart_toy', color: '#6b21a8', logo: '/deepseek-icon.webp', supportsImages: false },
};

export const MODELS_BY_PROVIDER: Record<AIProvider, ModelOption[]> = {
  openai: [
    { id: 'gpt-5.5', name: 'GPT-5.5' },
    { id: 'gpt-5.4', name: 'GPT-5.4' },
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini' },
    { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano' },
    { id: 'gpt-5', name: 'GPT-5' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  ],
  google: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    { id: 'gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-lite-preview-04-17', name: 'Gemini 2.5 Flash Lite' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder' },
  ],
};

export function getProviderModels(provider: AIProvider): ModelOption[] {
  return MODELS_BY_PROVIDER[provider] || [];
}

export interface ModelAvailability {
  available: boolean;
  message: string;
}

export function checkModelAvailability(provider: AIProvider, modelId: string): ModelAvailability {
  const providerModels = MODELS_BY_PROVIDER[provider];
  if (!providerModels) {
    const msg = `Provider "${provider}" not found. Available providers: ${Object.keys(MODELS_BY_PROVIDER).join(', ')}`;
    console.error(`[Model Error] ${msg}`);
    return { available: false, message: msg };
  }

  const modelExists = providerModels.some(m => m.id === modelId);
  if (!modelExists) {
    const providerName = PROVIDER_INFO[provider]?.name || provider;
    const availableModels = providerModels.map(m => m.id).join(', ');
    const msg = `Model "${modelId}" is not available or has been discontinued for ${providerName}. Available models: ${availableModels}`;
    console.warn(`[Model Warning] ${msg}`);
    return { available: false, message: msg };
  }

  return { available: true, message: '' };
}