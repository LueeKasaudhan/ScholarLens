# ScholarLens — V1 Frontend

> **"Beyond the famous ten."** A curated discovery tool surfacing legitimate, high-value, lesser-known ("long-tail") scholarships and fellowships for Indian students pursuing technical Master's degrees (CS & Engineering) abroad.

---

## 1. Core Thesis & Architecture

Existing scholarship aggregators and search engines suffer from strong popularity bias: they disproportionately rank the same marquee programs (DAAD, Fulbright, Chevening, Erasmus Mundus) that receive tens of thousands of applicants.

**ScholarLens reverses this bias:**
- **Long-tail by default:** Highlights university departmental fellowships, lab stipends, research foundation grants, and institute waivers across Europe and Asia with significantly higher acceptance probabilities.
- **Three-Module API Separation:** To mirror three future PostgreSQL database roles, all API logic is strictly decomposed into three distinct modules within `src/api/`.

---

## 2. Access Model & Database Roles

The architecture isolates operations across three database roles:

| Module | Database Role | Purpose & Privileges | Restricted Importers |
|---|---|---|---|
| `src/api/readApi.ts` | `main_reader` | Read-only queries against published opportunities and semantic ranking. **Contains zero write or mutation functions.** | Public pages (`Home`, `OpportunityDetail`, components) |
| `src/api/bookmarkApi.ts` | `bookmark_rw` | Read/Write access to per-client bookmark rows. Identifies users via an anonymous `clientId` (`crypto.randomUUID()`). Missing or soft-deleted items hydrate as "No longer available" without crashing. | `BookmarkContext`, `Bookmarks` page |
| `src/api/adminApi.ts` | `main_admin` | Elevated write/update access to opportunity records. Soft-deletes via active status toggle; hard deletes are prohibited. | **Imported exclusively by `src/pages/Admin.tsx`** |

---

## 3. API Endpoint Mapping & Backend Contracts

### A. Read API (`main_reader`) — `src/api/readApi.ts`
| Function | HTTP Method & Future Endpoint | Request Parameters | Response Format |
|---|---|---|---|
| `searchOpportunities` | `GET /api/opportunities/search` | `?q=&host_countries=&degree_level=&funding_types=&fields_of_study=&deadline_before=&include_rolling=&long_tail_only=&sort_by=` | `Opportunity[]` |
| `getOpportunity` | `GET /api/opportunities/{id}` | Path: `id` | `Opportunity` (or 404) |
| `rankBySemanticMatch` | `POST /api/semantic/rank` | Body: `{ "background_text": string, "candidate_ids": string[] }` | `RankedResult[]` (`{ id, similarity }`) |

### B. Bookmark API (`bookmark_rw`) — `src/api/bookmarkApi.ts`
| Function | HTTP Method & Future Endpoint | Headers & Payload | Response Format |
|---|---|---|---|
| `listBookmarks` | `GET /api/bookmarks` | Header: `X-Client-Id: {clientId}` | `HydratedBookmark[]` (with `is_available` flag) |
| `addBookmark` | `POST /api/bookmarks` | Header: `X-Client-Id: {clientId}`<br>Body: `{ "opportunity_id": string }` | `201 Created` |
| `removeBookmark` | `DELETE /api/bookmarks/{opportunity_id}` | Header: `X-Client-Id: {clientId}` | `204 No Content` |

### C. Admin API (`main_admin`) — `src/api/adminApi.ts`
| Function | HTTP Method & Future Endpoint | Headers & Payload | Response Format |
|---|---|---|---|
| `adminListOpportunities` | `GET /api/admin/opportunities` | Header: `Authorization: Bearer <AdminJWT>` | `Opportunity[]` (includes inactive) |
| `adminCreateOpportunity` | `POST /api/admin/opportunities` | Header: `Authorization: Bearer <AdminJWT>`<br>Body: `OpportunityInput` | `Opportunity` (201 Created) |
| `adminUpdateOpportunity` | `PATCH /api/admin/opportunities/{id}` | Header: `Authorization: Bearer <AdminJWT>`<br>Body: `Partial<OpportunityInput>` | `Opportunity` (200 OK) |
| `adminSetActive` | `PATCH /api/admin/opportunities/{id}/status` | Header: `Authorization: Bearer <AdminJWT>`<br>Body: `{ "is_active": boolean }` | `204 No Content` |

---

## 4. Admin Portal Security & Login Gate

- Route: `/admin` (Public pages **never** link to this route).
- **Mock Login Gate:** Guarded by a demo password check (`admin`), clearly labeled `[demo only, real auth is server-side]`.
- **Complete Opportunity Model Validation:** The creation/editing form covers all model fields: `curated_by`, `verified_on`, `popularity_tier`, `official_url` (with protocol check), `application_deadline` (optional, empty = rolling), and comma-separated tags and fields.

---

## 5. What is Mocked vs. Real

### What is Mocked:
1. **Mock Dataset (`src/api/mockData.ts`):** 24 realistic opportunities (~20 long-tail university and foundation awards across 14+ countries, ~4 well-known benchmark grants). All official URLs point to `https://example.com/...` with a persistent top banner indicating illustrative demo data.
2. **Deterministic Semantic Matching (`src/api/semanticStub.ts`):** Client-side stub replacing the future `all-MiniLM-L6-v2` sentence-transformer cosine similarity model with weighted keyword overlap.
3. **Simulated Latency:** 300–600ms network delay.
4. **Admin Mutations:** In-memory repository modifies state for the active session.

### What is Real & Production-Grade:
- **Strict Role-Partitioned Architecture:** `readApi` has zero writes; `adminApi` is restricted to `/admin`.
- **Anonymous Per-Client Bookmarks:** `clientId` generated on first visit via `crypto.randomUUID()`; rows stored as `{ client_id, opportunity_id, created_at }`. Inactive bookmarks render a "No longer available" card with remove actions without crashing.
- **Deep-linking & URL State Sync:** All filters and sorting options are encoded in URL search parameters (`?q=...&countries=...&degree=...`).
- **Dark Mode Support:** Detects system preferences via `matchMedia` with manual toggle and CSS variable binding.

---

## 6. How to Replace `src/api/` with Real FastAPI Calls

When connecting the real backend, replace the functions in their respective modules:

```typescript
// Example: src/api/readApi.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function searchOpportunities(filters: SearchFilters = {}): Promise<Opportunity[]> {
  const query = new URLSearchParams();
  if (filters.query) query.set('q', filters.query);
  if (filters.host_countries?.length) query.set('host_countries', filters.host_countries.join(','));
  if (filters.degree_level) query.set('degree_level', filters.degree_level);
  if (filters.funding_types?.length) query.set('funding_types', filters.funding_types.join(','));
  if (filters.fields_of_study?.length) query.set('fields_of_study', filters.fields_of_study.join(','));
  if (filters.deadline_before) query.set('deadline_before', filters.deadline_before);
  if (filters.include_rolling !== undefined) query.set('include_rolling', String(filters.include_rolling));
  if (filters.long_tail_only !== undefined) query.set('long_tail_only', String(filters.long_tail_only));
  if (filters.sort_by) query.set('sort_by', filters.sort_by);

  const res = await fetch(`${API_BASE}/opportunities/search?${query.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
```

Zero changes to components, hooks, or pages are required!

---

## 7. Development & Testing

```bash
# Start development server on port 3000
npm run dev

# Run TypeScript check
npm run lint

# Run pure logic & API module unit tests
npx tsx --test tests/pure_logic.test.ts

# Production build
npm run build
```
