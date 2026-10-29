import React from 'react';
import { HostEvent, getVendorCost } from '../../types/host.ts';
import { formatRupees } from '../../utils/sanitize.ts';

interface CelebrationSwitcherCardProps {
  event: HostEvent;
  isActive: boolean;
  canDelete: boolean;
  onSelectEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onNavigateHome: () => void;
}

/**
 * CelebrationSwitcherCard renders an individual celebration item in the switcher menu.
 */
export const CelebrationSwitcherCard: React.FC<CelebrationSwitcherCardProps> = ({
  event,
  isActive,
  canDelete,
  onSelectEvent,
  onDeleteEvent,
  onNavigateHome,
}) => {
  const cost = event.vendors.reduce((s, v) => s + getVendorCost(v), 0);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border transition-all ${
        isActive
          ? 'bg-[#E5A91A]/10 border-[#E5A91A]'
          : 'bg-[#0A0A0A] border-[#E5A91A]/25 hover:border-[#E5A91A]/60'
      }`}
    >
      <div
        onClick={() => {
          onSelectEvent(event.id);
          onNavigateHome();
        }}
        className="flex-1 cursor-pointer min-w-0"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-heading font-bold text-base text-[#E5A91A] truncate">
            {event.name}
          </span>
          {isActive && (
            <span className="text-[10px] font-bold bg-[#E5A91A] text-[#0A0A0A] px-2 py-0.5 rounded">
              Active Now
            </span>
          )}
          {event.date && (
            <span className="text-xs text-[#E5A91A]/60">• {event.date}</span>
          )}
        </div>
        <div className="text-xs text-[#E5A91A]/70 mt-1 flex flex-wrap gap-x-3 gap-y-1">
          <span>Budget: {formatRupees(event.totalBudget)}</span>
          <span>•</span>
          <span>Cost: {formatRupees(cost)}</span>
          <span>•</span>
          <span>{event.vendors.length} items</span>
          <span>•</span>
          <span>{event.tasks.length} tasks</span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {!isActive ? (
          <button
            type="button"
            onClick={() => {
              onSelectEvent(event.id);
              onNavigateHome();
            }}
            className="text-xs font-bold px-3 py-1.5 rounded bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] border border-[#E5A91A] cursor-pointer"
          >
            Switch & View
          </button>
        ) : (
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-bold px-3 py-1.5 rounded bg-[#0A0A0A] text-[#E5A91A] border border-[#E5A91A] hover:bg-[#E5A91A] hover:text-[#0A0A0A] cursor-pointer"
          >
            View Dashboard
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete celebration "${event.name}"?`)) {
                onDeleteEvent(event.id);
              }
            }}
            className="text-xs font-bold text-[#C41E3A] hover:underline p-1.5 cursor-pointer ml-1"
            title="Delete Celebration"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
