"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import { useLanguage } from "../context/LanguageContext";
import { getModelById } from "../lib/db/models";
import { getConversationById, createConversation, updateConversationTimestamp } from "../lib/db/conversations";
import { getMessagesByConversationId, saveMessage } from "../lib/db/messages";
import { createAIClient, ChatMessage } from "../lib/ai/client";
import { AIModel, Conversation } from "../lib/types";
import { PROVIDER_INFO, checkModelAvailability } from "../lib/ai/providers";
import { formatMessageTime, getDateLabel as getDateLabelTz, getDiffDays } from "../lib/time";
import Markdown from "./ui/Markdown";

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatDetailProps {
  chatParams: { id: string; modelId?: string };
}

export default function ChatDetailScreen({ chatParams }: ChatDetailProps) {
  const router = useRouter();
  const { translations } = useLanguage();
  
  const [model, setModel] = useState<AIModel | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const t = (key: string) => translations[key as keyof typeof translations] || key;

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  async function initializeChat() {
    try {
      const { id, modelId } = chatParams;
      if (!modelId) {
        setError('No model ID provided');
        return;
      }

      const modelData = await getModelById(modelId);
      
      if (!modelData) {
        setError('Model not found');
        return;
      }
      
      setModel(modelData);

      if (id && id !== 'new') {
        const conv = await getConversationById(id);
        
        if (conv && conv.modelId === modelId) {
          setConversation(conv);
          const msgs = await getMessagesByConversationId(id);
          setMessages(msgs.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })));
        }
      }
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError('Error loading chat');
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function adjustTextareaHeight() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = 24 * 5 + 24;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading || !model) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    let convId = conversation?.id;
    if (!convId) {
      const newConv = await createConversation(model.id);
      setConversation(newConv);
      convId = newConv.id;
    }

    setIsLoading(true);

    const streamingMsg: MessageItem = {
      id: `streaming-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, streamingMsg]);

    try {
      const availability = checkModelAvailability(model.provider, model.modelId);
      if (!availability.available) {
        throw new Error(availability.message);
      }

      const client = createAIClient(model.provider, model.apiKey, model.modelId);
      
      const chatMessages: ChatMessage[] = [];
      
      if (model.systemPrompt) {
        chatMessages.push({ role: 'system', content: model.systemPrompt });
      }
      
      for (const m of messages) {
        if (!m.isStreaming) {
          chatMessages.push({ role: m.role as 'user' | 'assistant', content: m.content });
        }
      }
      
      chatMessages.push({ role: 'user', content: userMessage });

      let fullResponse = '';
      const streamingId = streamingMsg.id;
      const userTimestamp = userMsg.timestamp;

      await client.sendMessageStream(chatMessages, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => 
          m.id === streamingId 
            ? { ...m, content: fullResponse }
            : m
        ));
      });

      const responseTimestamp = Date.now();
      await saveMessage(convId!, 'user', userMessage, userTimestamp);
      await saveMessage(convId!, 'assistant', fullResponse, responseTimestamp);
      await updateConversationTimestamp(convId!);

      setMessages(prev => prev.map(m => 
        m.id === streamingId 
          ? { ...m, id: Date.now().toString(), isStreaming: false, timestamp: responseTimestamp }
          : m
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const streamingId = streamingMsg.id;
      setMessages(prev => prev.map(m => 
        m.id === streamingId 
          ? { ...m, content: `Error: ${errorMsg}`, isStreaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function formatMessageTimestamp(timestamp: number): string {
    const diffDays = getDiffDays(timestamp);
    const time = formatMessageTime(timestamp);

    if (diffDays === 0) return time;
    if (diffDays === 1) return `${t('yesterday')} ${time}`;
    return `${getDateLabelTz(timestamp, t)} ${time}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col items-center justify-center">
        <MaterialSymbol name="hourglass_empty" className="text-5xl animate-spin" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col items-center justify-center">
        <MaterialSymbol name="error" className="text-5xl mb-4 text-error" />
        <p className="text-body-lg mb-4">{error || t('model_not_found')}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-on-primary rounded-full"
        >
          Go back
        </button>
      </div>
    );
  }

  const providerInfo = PROVIDER_INFO[model.provider];

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col relative">
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-3 bg-surface border-b border-surface-container fixed top-0 left-0 right-0 z-10">
        <button onClick={() => router.back()} className="p-1 -ml-2 text-on-surface-variant flex items-center justify-center">
          <MaterialSymbol name="arrow_back" className="text-2xl" />
        </button>

        <div
          onClick={() => router.push(`/edit-contact?modelId=${model.id}`)}
          className="flex flex-1 items-center gap-3 cursor-pointer"
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: providerInfo.color + '20' }}
          >
            <img
              src={providerInfo.logo}
              alt={providerInfo.name}
              className="w-6 h-6"
              style={{ filter: `drop-shadow(0 1px 2px ${providerInfo.color}60)` }}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight">{model.name}</h2>
            <p className="text-xs text-on-surface-variant">{providerInfo.name}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 text-on-surface-variant flex items-center justify-center"
          >
            <MaterialSymbol name="more_vert" className="text-2xl" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 bg-surface-container-high rounded-2xl shadow-lg py-2 min-w-[180px] z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push(`/edit-contact?modelId=${model.id}`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-on-surface hover:bg-surface-container transition-colors"
                >
                  <MaterialSymbol name="person" className="text-xl" />
                  <span className="font-medium">{t('view_contact')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 flex flex-col pt-22 pb-20">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
            <MaterialSymbol name="chat" className="text-5xl mb-4" />
            <p className="text-body-lg">{t('start_conversation')}</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showDateDivider = !prevMsg || getDiffDays(prevMsg.timestamp) !== getDiffDays(msg.timestamp);

              return (
                <Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex justify-center">
                      <span className="px-4 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full">
                        {getDateLabelTz(msg.timestamp, t)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'} space-y-1`}
                  >
                    <div
                      className={`${msg.role === 'user' ? 'bg-secondary-container text-on-secondary-container rounded-tr-sm' : 'bg-surface-container rounded-tl-sm'} px-5 py-4 rounded-[24px] text-body-lg ${msg.isStreaming ? 'animate-pulse' : ''}`}
                    >
                      {msg.isStreaming ? (
                        msg.content
                      ) : (
                        <Markdown content={msg.content} />
                      )}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-on-surface-variant ml-1 animate-bounce" />
                      )}
                    </div>
                    <span className="text-[11px] text-on-surface-variant px-2 block">
                      {formatMessageTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input Bar */}
      <div className="p-2 bg-surface fixed bottom-0 left-0 right-0">
        <div className="flex items-end gap-2 bg-surface-container-high px-4 rounded-[24px] overflow-hidden">
          <button className="p-2 text-on-surface-variant shrink-0 flex items-center justify-center self-center">
            <MaterialSymbol name="sentiment_satisfied" className="text-2xl" />
          </button>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('message')}
            disabled={isLoading}
            rows={1}
            className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-body-lg placeholder:text-on-surface-variant resize-none py-3 overflow-y-hidden"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 shrink-0 flex items-center justify-center disabled:opacity-50 self-center"
          >
            {isLoading ? (
              <MaterialSymbol name="hourglass_empty" className="text-2xl animate-spin" />
            ) : (
              <MaterialSymbol name="send" className="text-2xl text-primary" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}