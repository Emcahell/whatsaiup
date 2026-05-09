import { initDB } from './index';
import { Conversation } from '../types';
import { generateId } from './models';

export async function getConversationsByModelId(modelId: string): Promise<Conversation[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('conversations', 'readonly');
    const store = tx.objectStore('conversations');
    const index = store.index('modelId');
    const request = index.getAll(modelId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getConversationById(id: string): Promise<Conversation | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('conversations', 'readonly');
    const store = tx.objectStore('conversations');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function createConversation(modelId: string): Promise<Conversation> {
  const db = await initDB();
  const conversation: Conversation = {
    id: generateId(),
    modelId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    const request = store.add(conversation);
    request.onsuccess = () => resolve(conversation);
    request.onerror = () => reject(request.error);
  });
}

export async function updateConversationTimestamp(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const conversation = getRequest.result;
      if (conversation) {
        conversation.updatedAt = Date.now();
        const putRequest = store.put(conversation);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await initDB();
  
  const deleteMessages = new Promise<void>((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const index = store.index('conversationId');
    const request = index.getAllKeys(id);
    request.onsuccess = () => {
      request.result.forEach(key => store.delete(key));
      resolve();
    };
    request.onerror = () => reject(request.error);
  });

  const deleteConv = new Promise<void>((resolve, reject) => {
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  await deleteMessages;
  await deleteConv;
}