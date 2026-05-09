"use client";

import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import { useLanguage } from "../context/LanguageContext";

const CONTACTS = [
  {
    initial: "A",
    data: [
      {
        name: "Alex Rivers",
        status: "Hey there! I am using Stitch",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      {
        name: "Amara Chen",
        status: "Design is how it works.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amara",
      },
    ],
  },
  {
    initial: "B",
    data: [
      {
        name: "Bennett Smith",
        status: "Coding the future, one line at a time.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bennett",
      },
    ],
  },
  {
    initial: "C",
    data: [
      {
        name: "Claire Vance",
        status: "Exploring the intersection of art and...",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire",
      },
      {
        name: "Caleb Thorne",
        status: "Always online for coffee chats.",
        avatar: null,
      },
    ],
  },
  {
    initial: "D",
    data: [
      {
        name: "Dara Jenkins",
        status: "Busy at work. In urgent cases, call me.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dara",
      },
    ],
  },
];

export default function SelectContactScreen() {
  const router = useRouter();
  const { translations } = useLanguage();
  const t = (key: string) => translations[key as keyof typeof translations] || key;

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
        {CONTACTS.map((section) => (
          <div key={section.initial} className="mb-6">
            <div className="sticky top-0 bg-surface py-2 text-primary font-bold text-sm">
              {section.initial}
            </div>

            <div className="space-y-6 mt-2">
              {section.data.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-14 h-14 rounded-full bg-surface-container-high object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-lg">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 border-b border-surface-container pb-4 group-last:border-none">
                    <h3 className="text-lg font-semibold text-on-surface leading-tight">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant truncate max-w-[250px]">
                      {contact.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6">
        <button className="w-16 h-16 bg-primary-container text-on-primary-container rounded-[20px] flex items-center justify-center shadow-lg active:scale-95 transition-all">
          <MaterialSymbol name="person_search" className="text-3xl" filled />
        </button>
      </div>
    </div>
  );
}