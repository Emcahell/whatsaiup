"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import ModelSelect from "./ui/ModelSelect";
import { useLanguage } from "../context/LanguageContext";
import { AIProvider } from "../lib/types";
import { PROVIDER_INFO, getProviderModels } from "../lib/ai/providers";
import { saveModel, generateId } from "../lib/db/models";

export default function NewContactScreen() {
  const router = useRouter();
  const { translations } = useLanguage();
  const t = (key: string) => translations[key as keyof typeof translations] || key;

  const [name, setName] = useState("");
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(t('default_instruction'));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const models = getProviderModels(provider);
    if (models.length > 0) {
      setModelId(models[0].id);
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t('name_required'));
      return;
    }

    if (!apiKey.trim()) {
      setError(t('api_key_required'));
      return;
    }

    setIsSaving(true);

    try {
      const model = {
        id: generateId(),
        name: name.trim(),
        provider,
        apiKey: apiKey.trim(),
        modelId,
        temperature: 0.7,
        systemPrompt,
        createdAt: Date.now(),
      };

      await saveModel(model);
      router.push('/');
    } catch (err) {
      setError(t('error_saving_model'));
    } finally {
      setIsSaving(false);
    }
  };

  const providers = Object.entries(PROVIDER_INFO) as [AIProvider, typeof PROVIDER_INFO[AIProvider]][];
  const availableModels = getProviderModels(provider);

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-on-surface-variant">
            <MaterialSymbol name="arrow_back" className="text-2xl" />
          </button>
          <h1 className="text-[24px] font-medium text-primary tracking-tight">
            {t('new_ai_model')}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-4 py-2 text-primary font-semibold text-lg hover:bg-primary/5 rounded-full transition-colors disabled:opacity-50"
        >
          {isSaving ? t('saving') : t('save')}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        {/* Profile Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
            <img
              src={PROVIDER_INFO[provider].logo}
              alt={PROVIDER_INFO[provider].name}
              className="w-20 h-20"
              style={{ filter: `drop-shadow(0 2px 4px ${PROVIDER_INFO[provider].color}60)` }}
            />
          </div>
          <span className="text-sm font-medium text-on-surface-variant">
            {PROVIDER_INFO[provider].name}
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alias Name */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('alias_name')}
            </label>
            <div className="relative flex items-center">
              <MaterialSymbol
                name="label"
                className="absolute left-4 text-on-surface-variant"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder={t('alias_placeholder')}
                className="w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant pl-12"
              />
            </div>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('provider')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {providers.map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProvider(key)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    provider === key
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={info.logo}
                      alt={info.name}
                      className="w-7 h-7"
                      style={{ filter: `drop-shadow(0 1px 3px ${info.color}50)` }}
                    />
                    <span className="text-sm font-medium">{info.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('api_key')}
            </label>
            <div className="relative flex items-center">
              <MaterialSymbol
                name="key"
                className="absolute left-4 text-on-surface-variant"
              />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                }}
                placeholder={t('api_key_placeholder')}
                className="w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant pl-12"
              />
            </div>
            <p className="text-xs text-on-surface-variant px-2">
              {t('api_key_security_note')}
            </p>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('model')}
            </label>
            <ModelSelect
              value={modelId}
              options={availableModels}
              onChange={setModelId}
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('instruction')}
            </label>
            <div className="relative flex items-start">
              <MaterialSymbol
                name="info"
                className="absolute left-4 top-5 text-on-surface-variant"
              />
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t('instruction_placeholder')}
                rows={3}
                className="w-full bg-surface-container-lowest rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant pl-12 pr-4 py-4 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Delete Action */}
        <div className="py-8 flex justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant font-semibold py-2 px-6 hover:bg-surface-container rounded-full transition-colors"
          >
            <MaterialSymbol name="close" className="text-2xl" />
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}