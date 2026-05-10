"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import { useLanguage } from "../context/LanguageContext";
import { getAllModels } from "../lib/db/models";
import { getConversationsByModelId } from "../lib/db/conversations";
import { AIModel } from "../lib/types";
import { PROVIDER_INFO } from "../lib/ai/providers";

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

interface ModelWithConversation {
  model: AIModel;
  conversationId: string | null;
}

interface GroupedSection {
  initial: string;
  items: ModelWithConversation[];
}

export default function SelectContactScreen() {
  const router = useRouter();
  const { translations } = useLanguage();
  const t = (key: string) => translations[key as keyof typeof translations] || key;

  const [sections, setSections] = useState<GroupedSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      const allModels = await getAllModels();
      allModels.sort((a, b) => a.name.localeCompare(b.name));

      const items = await Promise.all(
        allModels.map(async (model) => {
          const conversations = await getConversationsByModelId(model.id);
          const lastConv = conversations.length > 0 ? conversations[conversations.length - 1] : null;
          return { model, conversationId: lastConv?.id ?? null };
        })
      );

      const grouped: Record<string, ModelWithConversation[]> = {};
      for (const item of items) {
        const initial = getInitial(item.model.name);
        if (!grouped[initial]) grouped[initial] = [];
        grouped[initial].push(item);
      }

      const result: GroupedSection[] = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([initial, items]) => ({ initial, items }));

      setSections(result);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectModel(item: ModelWithConversation) {
    if (item.conversationId) {
      router.push(`/chat/${item.conversationId}?modelId=${item.model.id}`);
    } else {
      router.push(`/chat/new?modelId=${item.model.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-on-surface-variant flex items-center justify-center">
            <MaterialSymbol name="arrow_back" className="text-2xl" />
          </button>
          <h1 className="text-[24px] font-medium font-sans text-primary tracking-tight">
            {t('select_contact')}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-on-surface-variant flex items-center justify-center">
            <MaterialSymbol name="search" className="text-2xl" />
          </button>
        </div>
      </header>

        {/* Action List */}
        <div className="px-5 py-4">
          <button
            onClick={() => router.push('/new-contact')}
            className="flex items-center gap-4 w-full py-3 active:bg-surface-container transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <MaterialSymbol name="person_add" className="text-2xl" filled />
            </div>
            <span className="text-lg font-medium">{t('new_contact')}</span>
          </button>
        </div>

      {/* Contacts List */}
      <div className="flex-1 px-5 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <MaterialSymbol name="hourglass_empty" className="text-5xl animate-spin" />
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <MaterialSymbol name="inbox" className="text-5xl mb-4" />
            <p className="text-body-lg">{t('add_first_ai')}</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.initial} className="mb-6">
              <div className="sticky top-0 bg-surface py-2 text-primary font-bold text-sm">
                {section.initial}
              </div>

              <div className="space-y-6 mt-2">
                {section.items.map((item) => {
                  const providerInfo = PROVIDER_INFO[item.model.provider];
                  return (
                    <div
                      key={item.model.id}
                      onClick={() => handleSelectModel(item)}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: providerInfo.color + '20' }}
                      >
                        <img
                          src={providerInfo.logo}
                          alt={providerInfo.name}
                          className="w-8 h-8"
                          style={{ filter: `drop-shadow(0 1px 3px ${providerInfo.color}60)` }}
                        />
                      </div>

                      <div className="flex-1 border-b border-surface-container pb-4 group-last:border-none">
                        <h3 className="text-lg font-semibold text-on-surface leading-tight">
                          {item.model.name}
                        </h3>
                        <p className="text-sm text-on-surface-variant truncate max-w-[250px]">
                          {item.model.modelId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6">
        <button
          onClick={() => router.push('/new-contact')}
          className="w-16 h-16 bg-primary-container text-on-primary-container rounded-[20px] flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <MaterialSymbol name="person_add" className="text-3xl" filled />
        </button>
      </div>
    </div>
  );
}