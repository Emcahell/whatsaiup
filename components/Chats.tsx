'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";

type FilterType = 'all' | 'unread';

const CHATS = [
  {
    id: 1,
    name: 'Alex Rivers',
    message: "Sounds like a plan! Let's meet at th...",
    time: '10:45 AM',
    unread: 2,
    online: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  {
    id: 2,
    name: 'Jordan Smith',
    message: 'Did you see the new design system upd...',
    time: 'Yesterday',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  },
  {
    id: 3,
    name: 'Product Sync Team',
    message: 'Sarah: The prototype is ready for review.',
    time: 'Tuesday',
    unread: 0,
    isGroup: true,
  },
  {
    id: 4,
    name: 'Casey',
    message: "I'll send the files over by EOD.",
    time: 'Oct 24',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
  },
  {
    id: 5,
    name: 'Taylor',
    message: 'Thanks for the feedback!',
    time: 'Oct 22',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
  },
  {
    id: 6,
    name: 'Sam Wheeler',
    message: 'Can you take a look at the latest sprint it...',
    time: 'Oct 15',
    unread: 0,
    avatar: null,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredChats = useMemo(() => {
    if (activeFilter === 'unread') {
      return CHATS.filter(chat => chat.unread > 0);
    }
    return CHATS;
  }, [activeFilter]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All chats' },
    { key: 'unread', label: 'Unread' },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button className="p-2 -ml-2 text-on-surface-variant">
          <MaterialSymbol name="menu" className="text-2xl" />
        </button>
        <h1 className="text-[28px] font-medium font-sans text-primary tracking-tight">
          Whatsaiup
        </h1>
        <button className="p-2 -mr-2 text-on-surface-variant">
          <MaterialSymbol name="search" className="text-2xl" />
        </button>
      </header>

      {/* Categories / Filters */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
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
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <MaterialSymbol name="inbox" className="text-5xl mb-4" />
            <p className="text-body-lg">No unread messages</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push('/chat/' + chat.id)}
              className="flex items-center gap-4 py-4 active:bg-surface-container transition-colors cursor-pointer group"
            >
              {/* Avatar Section */}
              <div className="relative">
                {chat.isGroup ? (
                  <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <MaterialSymbol name="group" className="text-3xl" filled />
                  </div>
                ) : chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-16 h-16 rounded-full bg-surface-container-high object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <MaterialSymbol name="person" className="text-3xl" filled />
                  </div>
                )}
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-4 border-surface rounded-full" />
                )}
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
          ))
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
