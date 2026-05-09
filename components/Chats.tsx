'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllModels } from "../lib/db/models";
import { getConversationsByModelId } from "../lib/db/conversations";
import { getMessagesByConversationId } from "../lib/db/messages";
import { AIModel, Message } from "../lib/types";
import { PROVIDER_INFO } from "../lib/ai/providers";

type FilterType = 'all' | 'unread';

interface ChatItem {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  avatar: string | null;
  provider: AIModel['provider'];
  conversationId: string | null;
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const dayInMs = 24 * 60 * 60 * 1000;

  if (diff < dayInMs) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diff < 2 * dayInMs) {
    return 'Yesterday';
  } else if (diff < 7 * dayInMs) {
    const days = Math.floor(diff / dayInMs);
    return days === 1 ? 'Yesterday' : new Date(timestamp).toLocaleDateString([], { weekday: 'long' });
  } else {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export default function MessagesScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, translations, toggleLanguage } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (key: string) => translations[key as keyof typeof translations] || key;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allModels = await getAllModels();
      setModels(allModels);

      const chatItems: ChatItem[] = await Promise.all(
        allModels.map(async (model) => {
          const providerInfo = PROVIDER_INFO[model.provider];
          const conversations = await getConversationsByModelId(model.id);
          
          let lastMessage = '';
          let lastTime = model.createdAt;
          let conversationId: string | null = null;

          if (conversations.length > 0) {
            const lastConv = conversations[conversations.length - 1];
            conversationId = lastConv.id;
            lastTime = lastConv.updatedAt;
            
            const messages = await getMessagesByConversationId(lastConv.id);
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];
              lastMessage = lastMsg.content.length > 50 
                ? lastMsg.content.substring(0, 50) + '...' 
                : lastMsg.content;
            }
          }

          return {
            id: model.id,
            name: model.name,
            message: lastMessage || t('new_conversation'),
            time: formatTime(lastTime),
            unread: 0,
            avatar: null,
            provider: model.provider,
            conversationId,
          };
        })
      );

      setChats(chatItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredChats = useMemo(() => {
    if (activeFilter === 'unread') {
      return chats.filter(chat => chat.unread > 0);
    }
    return chats;
  }, [activeFilter, chats]);

  const filters = [
    { key: 'all' as FilterType, label: t('all_chats') },
    { key: 'unread' as FilterType, label: t('unread') },
  ];

  function handleChatClick(chat: ChatItem) {
    if (chat.conversationId) {
      router.push(`/chat/${chat.conversationId}?modelId=${chat.id}`);
    } else {
      router.push(`/chat/new?modelId=${chat.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -ml-2 text-on-surface-variant flex items-center justify-center"
          >
            <MaterialSymbol name="menu" className="text-2xl" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute left-0 top-full mt-2 bg-surface-container-high rounded-2xl shadow-lg py-2 min-w-[200px] z-20 overflow-hidden">
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-on-surface hover:bg-surface-container transition-colors"
                >
                  <MaterialSymbol
                    name={theme === "dark" ? "light_mode" : "dark_mode"}
                    className="text-xl"
                  />
                  <span className="font-medium">
                    {theme === "dark" ? t('light_mode') : t('dark_mode')}
                  </span>
                </button>

                <button
                  onClick={() => {
                    toggleLanguage();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-on-surface hover:bg-surface-container transition-colors"
                >
                  <MaterialSymbol name="translate" className="text-xl" />
                  <span className="font-medium">
                    {language === "en" ? "Español" : "English"}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <h1 className="text-[24px] font-semibold font-sans text-primary tracking-tight">
          {t('whatsaiup')}
        </h1>

        <button className="p-2 -mr-2 text-on-surface-variant flex items-center justify-center">
          <MaterialSymbol name="search" className="text-2xl" />
        </button>
      </header>

      {/* Categories / Filters */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
              activeFilter === filter.key
                ? 'bg-primary text-on-primary'
                : 'border border-outline text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="flex-1 px-5 mt-4 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <MaterialSymbol name="hourglass_empty" className="text-5xl mb-4 animate-spin" />
            <p className="text-body-lg">Loading...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <MaterialSymbol name="inbox" className="text-5xl mb-4" />
            <p className="text-body-lg">{models.length === 0 ? t('add_first_ai') : t('no_unread_messages')}</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const providerInfo = PROVIDER_INFO[chat.provider];
            return (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className="flex items-center gap-4 py-4 active:bg-surface-container transition-colors cursor-pointer group"
              >
                {/* Avatar Section */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: providerInfo.color + '20' }}
                >
                  <img
                    src={providerInfo.logo}
                    alt={providerInfo.name}
                    className="w-9 h-9"
                    style={{ filter: `drop-shadow(0 1px 3px ${providerInfo.color}60)` }}
                  />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 border-b border-surface-container pb-4 group-last:border-none">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-semibold truncate text-on-surface">
                      {chat.name}
                    </h3>
                    <span className={`text-xs ${chat.unread > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-on-surface-variant truncate">
                      {chat.message}
                    </p>
                    {chat.unread > 0 && (
                      <div className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-primary text-on-primary text-[10px] font-bold rounded-full">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6">
        <button
          onClick={() => router.push('/select-contact')}
          className="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95"
        >
          <MaterialSymbol name="chat" className="text-3xl" filled />
        </button>
      </div>
    </div>
  );
}