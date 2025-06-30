'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import apiClient from '@/lib/apiClient';

// --- Defines ALL values the context will provide to the app ---
interface AppContextType {
  user: { id: number; username: string; email: string } | null;
  profile: any | null;
  isInstituteOwner: boolean;
  isLoading: boolean;
  fetcher: (url: string) => Promise<any>;
  login: (accessToken: string, refreshToken: string) => Promise<any>;
  logout: () => void;
  messages: any[];
  unreadCount: number;
  markAsRead: (messageId: number) => void;
  examId: string | null;
  setExamId: (id: string | null) => void;
  topicId: string | null;
  setTopicId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Universal SWR fetcher that uses our central API client
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- State Management ---
  const [user, setUser] = useState<AppContextType['user']>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isInstituteOwner, setIsInstituteOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [examId, setExamId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  
  const { mutate } = useSWRConfig();
  const router = useRouter();

  // --- Core Functions ---

  const logout = useCallback(() => {
    // This function's ONLY job is to clear state. The redirect is handled by the component that calls it.
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setProfile(null);
    setIsInstituteOwner(false);
    // Clear all cached API data to prevent showing stale info after logout
    mutate(() => true, undefined, { revalidate: false });
  }, [mutate]);

  const fetchAndSetUser = useCallback(async () => {
    // This is the single source of truth for fetching profile data.
    setIsLoading(true);
    try {
      const response = await apiClient.get('/auth/profile/');
      const profileData = response.data;
      setUser(profileData.user || profileData);
      setProfile(profileData);
      setIsInstituteOwner(profileData.is_owner === true);
      return profileData;
    } catch (error) {
      console.error("Session could not be verified. Clearing session.", error);
      // If fetching the profile fails, the token is bad. Log out completely.
      logout();
      // Re-throw the error so the calling function (like the login page) knows it failed.
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const login = async (accessToken: string, refreshToken: string) => {
    // This function handles the entire login process after tokens are received.
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    return await fetchAndSetUser();
  };

  // On initial application load, check if a token exists and validate the session.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchAndSetUser();
    } else {
      setIsLoading(false); // If no token, we're done loading immediately.
    }
  }, [fetchAndSetUser]);

  // --- SWR hook for notifications ---
  const { data: messages, mutate: mutateMessages } = useSWR(
    user ? '/my-messages/' : null, // Only fetch if user is logged in
    fetcher,
    { refreshInterval: 60000 } // Fetches every 60 seconds
  );
  
  const unreadCount = messages?.filter((msg: any) => user && msg.read_by && !msg.read_by.includes(user.id)).length || 0;

  const markAsRead = async (messageId: number) => {
    try {
        await apiClient.post(`/messages/${messageId}/mark-as-read/`);
        mutateMessages(); // Re-fetch messages to update the UI
    } catch (error) {
        console.error("Failed to mark message as read", error);
    }
  };

  // --- Final Context Value ---
  // All state and functions are provided to the rest of the app here.
  const value: AppContextType = {
    user,
    profile,
    isInstituteOwner,
    isLoading,
    login,
    logout,
    fetcher,
    messages: messages || [],
    unreadCount,
    markAsRead,
    examId,
    setExamId,
    topicId,
    setTopicId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- The Custom Hook to use the context ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};