'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllModels } from "../lib/db/models";
import { getConversationsByModelId } from "../lib/db/conversations";
import { getMessagesByConversationId } from "../lib/db/messages";
import { AIModel } from "../lib/types";
import { PROVIDER_INFO } from "../lib/ai/providers";
import { formatMessageTime, getDiffDays, formatWeekday, formatShortDate } from "../lib/time";

type FilterType = 'all' | 'unread';

interface ChatItem {
  id: string;
  name: string;
  message: string;
  time: string;
  lastTime: number;
  unread: number;
  avatar: string | null;
  provider: AIModel['provider'];
  conversationId: string | null;
}

function formatTime(timestamp: number, t: (key: string) => string): string {
  const diffDays = getDiffDays(timestamp);
  const time = formatMessageTime(timestamp);

  if (diffDays === 0) return time;
  if (diffDays === 1) return t('yesterday');
  if (diffDays < 7) return `${formatWeekday(timestamp)} ${time}`;
  return `${formatShortDate(timestamp)} ${time}`;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const t = (key: string) => translations[key as keyof typeof translations] || key;

  const loadData = async () => {
    try {
      const allModels = await getAllModels();
      setModels(allModels);

      const chatItems: ChatItem[] = await Promise.all(
        allModels.map(async (model) => {
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
            time: formatTime(lastTime, t),
            lastTime,
            unread: 0,
            avatar: null,
            provider: model.provider,
            conversationId,
          };
        })
      );

      chatItems.sort((a, b) => b.lastTime - a.lastTime);
      setChats(chatItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredChats = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = chats;
    if (q) {
      result = result.filter(chat => chat.name.toLowerCase().includes(q));
    }
    if (activeFilter === 'unread') {
      result = result.filter(chat => chat.unread > 0);
    }
    return result;
  }, [activeFilter, chats, searchQuery]);

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
      <header className="px-5 py-4 flex items-center justify-between gap-2">
        {showSearch ? (
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="p-2 -ml-2 text-on-surface-variant flex items-center justify-center"
            >
              <MaterialSymbol name="arrow_back" className="text-2xl" />
            </button>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="flex-1 bg-surface-variant text-[16px] font-semibold text-on-surface outline-none placeholder:text-on-surface-variant/50 px-4 py-2 rounded-full"
            />
          </div>
        ) : (
          <>
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

            <button
              onClick={() => setShowSearch(true)}
              className="p-2 -mr-2 text-on-surface-variant flex items-center justify-center"
            >
              <MaterialSymbol name="search" className="text-2xl" />
            </button>
          </>
        )}
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
            <p className="text-body-lg">
              {models.length === 0
                ? t('no_chats')
                : searchQuery
                  ? t('no_search_results').replace('{name}', searchQuery)
                  : t('no_unread_messages')}
            </p>
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