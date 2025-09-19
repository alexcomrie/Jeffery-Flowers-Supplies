import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Username } from '@shared/schema';

interface UsernameContextType {
  username: string | null;
  userId: string | null;
  setUsername: (username: string) => void;
  clearUsername: () => void;
  isUsernameSet: boolean;
  lastUsernameChange: number | null;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

export function useUsername() {
  const context = useContext(UsernameContext);
  if (context === undefined) {
    throw new Error('useUsername must be used within a UsernameProvider');
  }
  return context;
}

interface UsernameProviderProps {
  children: ReactNode;
}

export function UsernameProvider({ children }: UsernameProviderProps) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  
  // Generate a UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Generate a unique userId
  const generateUserId = () => {
    // Create a UUID that is not tied to the username
    // This ensures the ID remains permanent even if username changes
    return generateUUID();
  };
  
  // Load username and userId from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    let savedUserId = localStorage.getItem('userId');
    
    // Set username if it exists
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
    
    // If no userId exists, generate a new one
    // This will be the permanent userId for this user
    if (!savedUserId) {
      savedUserId = generateUserId();
      localStorage.setItem('userId', savedUserId);
    }
    
    // Always set userId in state
    setUserIdState(savedUserId);
  }, []);

  const setUsername = (newUsername: string) => {
    if (newUsername && newUsername.trim().length >= 3) {
      // Save username to localStorage
      localStorage.setItem('username', newUsername);
      
      // Get the existing userId or generate a new one if it doesn't exist
      // This ensures the userId remains permanent even when username changes
      let existingUserId = localStorage.getItem('userId');
      if (!existingUserId) {
        existingUserId = generateUserId();
        localStorage.setItem('userId', existingUserId);
      }
      
      // Update state
      setUsernameState(newUsername);
      setUserIdState(existingUserId);
      
      // Create timestamp for tracking when username was set/updated
      const timestamp = Date.now();
      
      // Only set created_at if it doesn't exist (first username set)
      if (!localStorage.getItem('username_created_at')) {
        localStorage.setItem('username_created_at', timestamp.toString());
      }
      
      // Always update the updated_at timestamp
      localStorage.setItem('username_updated_at', timestamp.toString());
    }
  };

  const clearUsername = () => {
    // Get the existing userId - we want to keep this permanent
    const existingUserId = localStorage.getItem('userId');
    
    localStorage.removeItem('username');
    localStorage.removeItem('username_created_at');
    localStorage.removeItem('username_updated_at');
    
    // Don't change the userId in localStorage - keep it permanent
    
    setUsernameState(null);
    // Keep the userId in state to maintain restrictions
    setUserIdState(existingUserId);
  };

  const value = {
    username,
    userId,
    setUsername,
    clearUsername,
    isUsernameSet: !!username,
    lastUsernameChange: localStorage.getItem('username_updated_at') ? parseInt(localStorage.getItem('username_updated_at')!) : null,
  };

  return (
    <UsernameContext.Provider value={value}>
      {children}
    </UsernameContext.Provider>
  );
}