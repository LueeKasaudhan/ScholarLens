/**
 * Public API Barrel for ScholarLens
 *
 * Exposes:
 *  - Data types (types.ts)
 *  - readApi.ts (Role: main_reader) - search, read, semantic match
 *  - bookmarkApi.ts (Role: bookmark_rw) - client-scoped bookmarking
 *
 * NOTE: adminApi.ts (Role: main_admin) is intentionally NOT exported here.
 * In accordance with the security access model, adminApi must only be imported directly by src/pages/Admin.tsx.
 */

export * from './types';
export * from './readApi';
export * from './bookmarkApi';
