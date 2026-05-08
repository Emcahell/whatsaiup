'use client';

import { useState, useEffect } from 'react';
import WelcomeScreen from '../components/Welcome';
import MessagesScreen from '../components/Chats';

const USER_NAME_KEY = 'whatsaiup_user_name';

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem(USER_NAME_KEY);
    if (savedName) {
      setUserName(savedName);
    }
    setIsLoaded(true);
  }, []);

  const handleNameSubmit = (name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
  };

  if (!isLoaded) {
    return null;
  }

  if (!userName) {
    return <WelcomeScreen onNameSubmit={handleNameSubmit} />;
  }

  return <MessagesScreen />;
}
