import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { addBookmark as apiAddBookmark, removeBookmark as apiRemoveBookmark, listBookmarks as apiListBookmarks, getClientId } from '../api/bookmarkApi';

interface BookmarkContextType {
  clientId: string;
  bookmarkedIds: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  refreshBookmarks: () => Promise<void>;
  count: number;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId] = useState<string>(() => getClientId());
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshBookmarks = useCallback(async () => {
    try {
      const records = await apiListBookmarks();
      // Store all bookmarked opportunity IDs for fast lookup
      setBookmarkedIds(records.map((r) => r.opportunity_id));
    } catch (e) {
      console.warn('Failed to refresh bookmarks', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const isBookmarked = (id: string): boolean => {
    return bookmarkedIds.includes(id);
  };

  const toggleBookmark = async (id: string) => {
    if (isBookmarked(id)) {
      // Optimistic update
      setBookmarkedIds((prev) => prev.filter((item) => item !== id));
      await apiRemoveBookmark(id);
    } else {
      // Optimistic update
      setBookmarkedIds((prev) => [...prev, id]);
      await apiAddBookmark(id);
    }
  };

  const removeBookmark = async (id: string) => {
    setBookmarkedIds((prev) => prev.filter((item) => item !== id));
    await apiRemoveBookmark(id);
  };

  return (
    <BookmarkContext.Provider
      value={{
        clientId,
        bookmarkedIds,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        refreshBookmarks,
        count: bookmarkedIds.length
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
