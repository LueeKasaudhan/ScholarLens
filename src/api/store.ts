import { INITIAL_MOCK_OPPORTUNITIES } from './mockData';
import { Opportunity, OpportunityInput } from './types';

// In-memory opportunities repository shared across the simulated server context.
// Modifiable only via adminApi, readable via readApi.
let inMemoryOpportunities: Opportunity[] = [...INITIAL_MOCK_OPPORTUNITIES];

/**
 * Simulates real network latency between 300ms and 600ms.
 */
export const simulateLatency = (): Promise<void> => {
  const delay = Math.floor(Math.random() * 300) + 300;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Internal access to retrieve opportunities (read operations).
 */
export function getAllOpportunitiesInternal(): Opportunity[] {
  return [...inMemoryOpportunities];
}

/**
 * Internal mutation: create new opportunity (called exclusively by adminApi).
 */
export function createOpportunityInternal(data: OpportunityInput): Opportunity {
  const now = new Date().toISOString();
  const newOpp: Opportunity = {
    ...data,
    id: `opp-custom-${Date.now().toString(36)}`,
    curated_by: data.curated_by || 'ScholarLens Admin Team',
    is_active: data.is_active ?? true,
    verified_on: data.verified_on || now.split('T')[0],
    created_at: now,
    updated_at: now
  };

  inMemoryOpportunities = [newOpp, ...inMemoryOpportunities];
  return newOpp;
}

/**
 * Internal mutation: update existing opportunity (called exclusively by adminApi).
 */
export function updateOpportunityInternal(
  id: string,
  data: Partial<OpportunityInput>
): Opportunity {
  const index = inMemoryOpportunities.findIndex((o) => o.id === id);
  if (index === -1) {
    throw new Error(`Opportunity with ID ${id} not found`);
  }

  const existing = inMemoryOpportunities[index];
  const updated: Opportunity = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString()
  };

  inMemoryOpportunities[index] = updated;
  return updated;
}

/**
 * Internal mutation: toggle active status / soft-delete (called exclusively by adminApi).
 */
export function setActiveInternal(id: string, isActive: boolean): void {
  const target = inMemoryOpportunities.find((o) => o.id === id);
  if (!target) {
    throw new Error(`Opportunity with ID ${id} not found`);
  }

  target.is_active = isActive;
  target.updated_at = new Date().toISOString();
}
