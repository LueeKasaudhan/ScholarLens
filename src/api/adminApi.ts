/* eslint-disable no-restricted-imports */
// RESTRICTED MODULE: Only src/pages/Admin.tsx may import from this file.
// Any other module importing adminApi violates the three-role security architecture.

import {
  createOpportunityInternal,
  getAllOpportunitiesInternal,
  setActiveInternal,
  simulateLatency,
  updateOpportunityInternal
} from './store';
import { Opportunity, OpportunityInput } from './types';

/**
 * MODULE: adminApi.ts
 * ROLE: main_admin (PostgreSQL Elevated Write Role)
 *
 * Exclusively provides administrative management of opportunities:
 * creation, updating, and soft-delete activation toggles.
 * Hard deletions are deliberately prohibited to preserve historical link stability.
 */

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_admin
 * GET /api/admin/opportunities
 * Headers:
 *   - Authorization: Bearer <AdminJWT>
 * Response: Opportunity[] (includes active and soft-deleted records)
 */
export async function adminListOpportunities(): Promise<Opportunity[]> {
  await simulateLatency();
  // Returns all records including inactive/soft-deleted items for administrative auditing
  return getAllOpportunitiesInternal();
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_admin
 * POST /api/admin/opportunities
 * Headers:
 *   - Authorization: Bearer <AdminJWT>
 * Request Body: OpportunityInput
 * Response: Opportunity (201 Created)
 */
export async function adminCreateOpportunity(data: OpportunityInput): Promise<Opportunity> {
  await simulateLatency();
  return createOpportunityInternal(data);
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_admin
 * PATCH /api/admin/opportunities/{id}
 * Headers:
 *   - Authorization: Bearer <AdminJWT>
 * Request Body: Partial<OpportunityInput>
 * Response: Opportunity (200 OK)
 */
export async function adminUpdateOpportunity(
  id: string,
  data: Partial<OpportunityInput>
): Promise<Opportunity> {
  await simulateLatency();
  return updateOpportunityInternal(id, data);
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_admin
 * PATCH /api/admin/opportunities/{id}/status
 * Headers:
 *   - Authorization: Bearer <AdminJWT>
 * Request Body: { "is_active": boolean }
 * Response: 204 No Content
 */
export async function adminSetActive(id: string, isActive: boolean): Promise<void> {
  await simulateLatency();
  setActiveInternal(id, isActive);
}
