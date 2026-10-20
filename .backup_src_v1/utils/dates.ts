export type DeadlineStatus = 'urgent' | 'soon' | 'normal' | 'closed' | 'rolling';

export interface DeadlineInfo {
  status: DeadlineStatus;
  label: string;
  daysRemaining: number | null;
  formattedDate: string;
}

/**
 * Calculates deadline urgency and days remaining relative to current date.
 * Urgency criteria:
 *  - rolling (null)
 *  - closed (days < 0)
 *  - urgent (< 14 days)
 *  - soon (< 45 days)
 *  - normal (>= 45 days)
 */
export function getDeadlineInfo(
  deadlineIso: string | null,
  referenceDate: Date = new Date()
): DeadlineInfo {
  if (!deadlineIso) {
    return {
      status: 'rolling',
      label: 'Rolling Deadline',
      daysRemaining: null,
      formattedDate: 'Open Year-Round'
    };
  }

  const deadline = new Date(deadlineIso + 'T23:59:59');
  const now = new Date(referenceDate);

  // Normalize time components for date-only comparison
  const d1 = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = d1.getTime() - d2.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (diffDays < 0) {
    return {
      status: 'closed',
      label: 'Closed',
      daysRemaining: diffDays,
      formattedDate
    };
  }

  if (diffDays === 0) {
    return {
      status: 'urgent',
      label: 'Closing Today',
      daysRemaining: 0,
      formattedDate
    };
  }

  if (diffDays === 1) {
    return {
      status: 'urgent',
      label: '1 day left',
      daysRemaining: 1,
      formattedDate
    };
  }

  if (diffDays < 14) {
    return {
      status: 'urgent',
      label: `${diffDays} days left`,
      daysRemaining: diffDays,
      formattedDate
    };
  }

  if (diffDays < 45) {
    return {
      status: 'soon',
      label: `${diffDays} days left`,
      daysRemaining: diffDays,
      formattedDate
    };
  }

  return {
    status: 'normal',
    label: `${diffDays} days left`,
    daysRemaining: diffDays,
    formattedDate
  };
}
