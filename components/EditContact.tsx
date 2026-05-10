"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import ConfirmDialog from "./ui/ConfirmDialog";
import { useLanguage } from "../context/LanguageContext";
import { getModelById, saveModel, deleteModel } from "../lib/db/models";
import { PROVIDER_INFO, getProviderModels } from "../lib/ai/providers";
import { AIProvider } from "../lib/types";

export default function EditContactScreen({ modelId }: { modelId?: string }) {
  const router = useRouter();
  const { translations } = useLanguage();
  const t = (key: string) => translations[key as keyof typeof translations] || key;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelIdValue, setModelIdValue] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!modelId) {
      setError("No model ID provided");
      setLoading(false);
      return;
    }

    getModelById(modelId).then((model) => {
      if (!model) {
        setError("Model not found");
        setLoading(false);
        return;
      }
      setName(model.name);
      setProvider(model.provider);
      setApiKey(model.apiKey);
      setModelIdValue(model.modelId);
      setSystemPrompt(model.systemPrompt ?? "Keep responses brief and concise.");
      setLoading(false);
    }).catch(() => {
      setError("Error loading model");
      setLoading(false);
    });
  }, [modelId]);

  const availableModels = getProviderModels(provider);

  const handleSave = async () => {
    if (!modelId || !name.trim() || !apiKey.trim()) return;

    setIsSaving(true);
    setError("");

    try {
      await saveModel({
        id: modelId,
        name: name.trim(),
        provider,
        apiKey: apiKey.trim(),
        modelId: modelIdValue,
        temperature: 0.7,
        systemPrompt,
        createdAt: Date.now(),
      });
      router.back();
    } catch {
      setError("Error saving model");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modelId) return;
    try {
      await deleteModel(modelId);
      router.push('/');
    } catch {
      setError("Error deleting model");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col items-center justify-center">
        <MaterialSymbol name="hourglass_empty" className="text-5xl animate-spin" />
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col items-center justify-center">
        <MaterialSymbol name="error" className="text-5xl mb-4 text-error" />
        <p className="text-body-lg mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-on-primary rounded-full"
        >
          Go back
        </button>
      </div>
    );
  }

  const providerInfo = PROVIDER_INFO[provider];

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-on-surface-variant flex items-center justify-center">
            <MaterialSymbol name="arrow_back" className="text-2xl" />
          </button>
          <h1 className="text-[24px] font-medium text-primary tracking-tight">
            {t('edit_contact')}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-primary font-semibold text-lg hover:bg-primary/5 rounded-full transition-colors disabled:opacity-50"
        >
          {isSaving ? t('saving') : t('save')}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        {/* Provider Avatar (no edit button) */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
            <img
              src={providerInfo.logo}
              alt={providerInfo.name}
              className="w-20 h-20"
              style={{ filter: `drop-shadow(0 2px 4px ${providerInfo.color}60)` }}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
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
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder={t('alias_placeholder')}
                className="w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant pl-12"
              />
            </div>
          </div>

          {/* Provider (read-only) */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('provider')}
            </label>
            <div className="flex items-center gap-3 px-4 bg-surface-container-lowest h-16 rounded-[16px]">
              <img
                src={providerInfo.logo}
                alt={providerInfo.name}
                className="w-7 h-7"
                style={{ filter: `drop-shadow(0 1px 2px ${providerInfo.color}50)` }}
              />
              <span className="text-body-lg">{providerInfo.name}</span>
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
                onChange={(e) => { setApiKey(e.target.value); setError(""); }}
                placeholder={t('api_key_placeholder')}
                className="w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant pl-12"
              />
            </div>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-label-md font-semibold px-2 text-on-surface-variant">
              {t('model')}
            </label>
            <div className="relative flex items-center">
              <MaterialSymbol
                name="smart_toy"
                className="absolute left-4 text-on-surface-variant"
              />
              <select
                value={modelIdValue}
                onChange={(e) => setModelIdValue(e.target.value)}
                className="w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all pl-12 pr-4 appearance-none cursor-pointer"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <MaterialSymbol
                name="expand_more"
                className="absolute right-4 text-on-surface-variant pointer-events-none"
              />
            </div>
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
        </div>

        {/* Delete Action */}
        <div className="py-8 flex justify-center">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-error font-semibold py-2 px-6 hover:bg-error/5 rounded-full transition-colors"
          >
            <MaterialSymbol name="delete" className="text-2xl" />
            {t('delete_contact')}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('delete_contact')}
        message={t('delete_confirm_message')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
