import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';
import { listBookmarks, removeBookmark, HydratedBookmark } from '../api';
import { useBookmarks } from '../context/BookmarkContext';
import { OpportunityCard } from '../components/OpportunityCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const Bookmarks: React.FC = () => {
  const { refreshBookmarks, clientId } = useBookmarks();
  const [bookmarkItems, setBookmarkItems] = useState<HydratedBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await listBookmarks();
      setBookmarkItems(records);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = async (opportunityId: string) => {
    // Optimistic removal from local UI
    setBookmarkItems((prev) => prev.filter((item) => item.opportunity_id !== opportunityId));
    await removeBookmark(opportunityId);
    await refreshBookmarks();
  };

  const activeCount = bookmarkItems.filter((b) => b.is_available).length;
  const unavailableCount = bookmarkItems.filter((b) => !b.is_available).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-serif-title text-3xl sm:text-4xl text-stone-900 dark:text-stone-50 font-semibold tracking-tight">
            Saved Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Scoped to client ID: <code className="font-mono text-[11px] bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">{clientId.slice(0, 18)}...</code>
          </p>
        </div>

        {bookmarkItems.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {activeCount} Available {activeCount === 1 ? 'Program' : 'Programs'}
            </div>
            {unavailableCount > 0 && (
              <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                {unavailableCount} Archived
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton count={3} />}

      {/* Empty State */}
      {!isLoading && bookmarkItems.length === 0 && (
        <div className="max-w-md mx-auto text-center py-16 px-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            No saved opportunities yet
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            As you browse long-tail fellowships and university grants, click the bookmark icon on any card to save it to this personal shortlist.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-medium text-sm hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Opportunities</span>
            </Link>
          </div>
        </div>
      )}

      {/* Bookmarked Grid */}
      {!isLoading && bookmarkItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarkItems.map((item) => {
            if (item.is_available && item.opportunity) {
              return (
                <div key={item.opportunity_id} className="relative group">
                  <OpportunityCard opportunity={item.opportunity} />
                </div>
              );
            }

            // Inactive or missing opportunity: "No longer available" fallback card
            return (
              <div
                key={item.opportunity_id}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 p-5 flex flex-col justify-between space-y-4 text-stone-500"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      No longer available
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.opportunity_id)}
                      className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-rose-600 hover:border-rose-300 transition-colors"
                      aria-label="Remove unavailable bookmark"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    This program has been deactivated, archived, or is no longer listed.
                  </p>
                  <p className="text-xs font-mono text-stone-400">
                    ID: {item.opportunity_id}
                  </p>
                  <p className="text-xs text-stone-400">
                    Saved on {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Archived from active listings</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.opportunity_id)}
                    className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Remove bookmark
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
