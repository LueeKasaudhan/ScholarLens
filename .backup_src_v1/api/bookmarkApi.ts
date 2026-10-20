import { simulateLatency } from './store';
import { getOpportunity } from './readApi';
import { BookmarkRecord, HydratedBookmark } from './types';

/**
 * MODULE: bookmarkApi.ts
 * ROLE: bookmark_rw (Separate Per-Client Bookmark Database Role)
 *
 * Simulates an isolated bookmark datastore indexed by an anonymous clientId.
 * Bookmark rows are stored as { client_id, opportunity_id, created_at }.
 * Inactive or missing opportunities are hydrated with is_available: false so UI
 * shows "No longer available" instead of crashing.
 */

const CLIENT_ID_STORAGE_KEY = 'scholarlens_client_id_v1';
const BOOKMARK_ROWS_STORAGE_KEY = 'scholarlens_bookmark_rows_v1';

// In-memory fallbacks when localStorage is blocked or unavailable
let inMemoryClientId: string | null = null;
let inMemoryBookmarkRows: BookmarkRecord[] = [];

/**
 * Returns the anonymous clientId, generating a persistent random UUID on first visit.
 */
export function getClientId(): string {
  if (inMemoryClientId) {
    return inMemoryClientId;
  }

  try {
    const stored = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (stored) {
      inMemoryClientId = stored;
      return stored;
    }
  } catch {
    // Storage access blocked
  }

  // Generate new anonymous UUID
  let newId: string;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    newId = crypto.randomUUID();
  } else {
    newId = `client-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
  }

  inMemoryClientId = newId;

  try {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, newId);
  } catch {
    // LocalStorage write failed
  }

  return newId;
}

/**
 * Helper to read raw bookmark rows from storage or in-memory fallback.
 */
function readAllBookmarkRows(): BookmarkRecord[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_ROWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to memory
  }

  // Initialize with sample bookmark row for demo experience
  if (inMemoryBookmarkRows.length === 0) {
    inMemoryBookmarkRows = [
      {
        client_id: getClientId(),
        opportunity_id: 'opp-lt-001',
        created_at: new Date().toISOString()
      }
    ];
  }

  return inMemoryBookmarkRows;
}

/**
 * Helper to persist raw bookmark rows.
 */
function saveAllBookmarkRows(rows: BookmarkRecord[]): void {
  inMemoryBookmarkRows = rows;
  try {
    localStorage.setItem(BOOKMARK_ROWS_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // Quota exceeded or disabled
  }
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: bookmark_rw
 * GET /api/bookmarks
 * Headers:
 *   - X-Client-Id: {clientId}
 * Response:
 *   [
 *     {
 *       "client_id": string,
 *       "opportunity_id": string,
 *       "created_at": string,
 *       "opportunity": Opportunity | null,
 *       "is_available": boolean
 *     }
 *   ]
 */
export async function listBookmarks(): Promise<HydratedBookmark[]> {
  await simulateLatency();

  const clientId = getClientId();
  const allRows = readAllBookmarkRows();
  const clientRows = allRows.filter((row) => row.client_id === clientId);

  // Hydrate opportunities and verify availability
  const hydrated: HydratedBookmark[] = await Promise.all(
    clientRows.map(async (row) => {
      const opp = await getOpportunity(row.opportunity_id);
      const isAvailable = Boolean(opp && opp.is_active);

      return {
        client_id: row.client_id,
        opportunity_id: row.opportunity_id,
        created_at: row.created_at,
        opportunity: isAvailable ? opp : null,
        is_available: isAvailable
      };
    })
  );

  return hydrated;
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: bookmark_rw
 * POST /api/bookmarks
 * Headers:
 *   - X-Client-Id: {clientId}
 * Request Body:
 *   { "opportunity_id": string }
 * Response: 201 Created
 */
export async function addBookmark(opportunityId: string): Promise<void> {
  await simulateLatency();

  const clientId = getClientId();
  const allRows = readAllBookmarkRows();

  const exists = allRows.some(
    (row) => row.client_id === clientId && row.opportunity_id === opportunityId
  );

  if (!exists) {
    const newRow: BookmarkRecord = {
      client_id: clientId,
      opportunity_id: opportunityId,
      created_at: new Date().toISOString()
    };
    saveAllBookmarkRows([newRow, ...allRows]);
  }
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: bookmark_rw
 * DELETE /api/bookmarks/{opportunity_id}
 * Headers:
 *   - X-Client-Id: {clientId}
 * Response: 204 No Content
 */
export async function removeBookmark(opportunityId: string): Promise<void> {
  await simulateLatency();

  const clientId = getClientId();
  const allRows = readAllBookmarkRows();

  const filtered = allRows.filter(
    (row) => !(row.client_id === clientId && row.opportunity_id === opportunityId)
  );

  saveAllBookmarkRows(filtered);
}

/**
 * Fast synchronous check for bookmark UI state.
 */
export function isOpportunityBookmarkedSync(opportunityId: string): boolean {
  const clientId = getClientId();
  const allRows = readAllBookmarkRows();
  return allRows.some((r) => r.client_id === clientId && r.opportunity_id === opportunityId);
}
