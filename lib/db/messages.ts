import { initDB } from './index';
import { Message } from '../types';
import { generateId } from './models';

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const index = store.index('conversationId');
    const request = index.getAll(conversationId);
    request.onsuccess = () => {
      const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
      resolve(messages);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string, timestamp?: number, image?: string): Promise<Message> {
  const db = await initDB();
  const message: Message = {
    id: generateId(),
    conversationId,
    role,
    content,
    timestamp: timestamp ?? Date.now(),
  };
  if (image) message.image = image;
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const request = store.add(message);
    request.onsuccess = () => resolve(message);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearConversationMessages(conversationId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const index = store.index('conversationId');
    const request = index.getAllKeys(conversationId);
    request.onsuccess = () => {
      request.result.forEach(key => store.delete(key));
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}