import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getDeadlineInfo, DeadlineStatus } from '../utils/dates';

interface DeadlineBadgeProps {
  deadline: string | null;
  className?: string;
  showDate?: boolean;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  className = '',
  showDate = true
}) => {
  const info = getDeadlineInfo(deadline);

  const getStatusStyles = (status: DeadlineStatus) => {
    switch (status) {
      case 'urgent':
        return {
          wrapper: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
        };
      case 'soon':
        return {
          wrapper: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'normal':
        return {
          wrapper: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700',
          icon: <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
        };
      case 'closed':
        return {
          wrapper: 'bg-stone-100 dark:bg-stone-900/80 text-stone-500 dark:text-stone-500 border-stone-200 dark:border-stone-800 line-through decoration-stone-400',
          icon: <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        };
      case 'rolling':
        return {
          wrapper: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        };
    }
  };

  const style = getStatusStyles(info.status);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style.wrapper} ${className}`}
      title={deadline ? `Deadline: ${info.formattedDate}` : 'Rolling admissions / evaluated periodically'}
    >
      {style.icon}
      <span>{info.label}</span>
      {showDate && deadline && (
        <span className="text-[11px] opacity-75 font-normal ml-0.5">
          ({info.formattedDate})
        </span>
      )}
    </div>
  );
};
