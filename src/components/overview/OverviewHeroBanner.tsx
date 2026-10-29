import React, { useState } from 'react';
import { HostEvent } from '../../types/host.ts';
import { formatRupees } from '../../utils/sanitize.ts';

interface OverviewHeroBannerProps {
  event: HostEvent;
  totalCost: number;
  totalBudget: number;
  remainingBudget: number;
  percentSpent: number;
  onDeleteEvent: (eventId: string) => void;
  onNavigate: (view: 'budget' | 'checklist' | 'ai' | 'menu') => void;
}

/**
 * OverviewHeroBanner renders the executive header, financial progress bar,
 * and handles celebration deletion with a confirmation dialog.
 */
export const OverviewHeroBanner: React.FC<OverviewHeroBannerProps> = ({
  event,
  totalCost,
  totalBudget,
  remainingBudget,
  percentSpent,
  onDeleteEvent,
  onNavigate,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E5A91A] tracking-tight">
                {event.name}
              </h2>
              {event.date && (
                <span className="text-xs bg-[#E5A91A] text-[#0A0A0A] font-bold px-2.5 py-0.5 rounded border border-[#E5A91A]">
                  {event.date}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#E5A91A]/70 mt-1">
              Celebration Overview • {event.guestCount} expected guests • {formatRupees(totalBudget)} allocated cap
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-[#E5A91A] hover:bg-[#E5A91A]/10 border border-[#E5A91A]/40 px-3.5 py-1.5 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer select-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Celebration Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-bold text-[#C41E3A] hover:bg-[#C41E3A] hover:text-[#0A0A0A] border border-[#C41E3A] px-3.5 py-1.5 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer select-none bg-transparent"
              title="Delete this celebration"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Single Cost Tally Strip */}
        <div className="mt-5 pt-4 border-t border-[#E5A91A]/20 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-heading font-bold text-2xl sm:text-3xl text-[#E5A91A] tracking-tight">
              Total Budget: {formatRupees(totalBudget)}
            </span>
            <span className="text-sm font-bold text-[#E5A91A]/30 hidden sm:inline">|</span>
            <span className="text-base sm:text-xl font-bold text-[#E5A91A]/80">
              Total Cost: {formatRupees(totalCost)}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-[#E5A91A]/70 block uppercase tracking-wider">
              {remainingBudget >= 0 ? 'Remaining Balance' : 'Over Budget Deficit'}
            </span>
            <p
              className={`font-heading font-extrabold text-xl ${
                remainingBudget >= 0 ? 'text-[#E5A91A]' : 'text-[#C41E3A]'
              }`}
            >
              {formatRupees(Math.abs(remainingBudget))}
            </p>
          </div>
        </div>

        {/* Flat Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold text-[#E5A91A]/80 mb-1.5">
            <span>{percentSpent}% of budget allocated</span>
            <span>
              {formatRupees(totalCost)} of {formatRupees(totalBudget)}
            </span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-3 rounded-full overflow-hidden border border-[#E5A91A]/40">
            <div
              className={`h-full transition-all duration-300 ${
                remainingBudget >= 0 ? 'bg-[#E5A91A]' : 'bg-[#C41E3A]'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0A0A0A] border-2 border-[#E5A91A] rounded-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C41E3A]/20 text-[#C41E3A] border border-[#C41E3A] flex items-center justify-center flex-shrink-0 font-extrabold text-lg">
                !
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#E5A91A]">Delete Celebration?</h3>
                <p className="text-xs font-medium text-[#E5A91A]/80 mt-0.5">
                  Are you sure you want to delete <span className="underline font-bold text-[#E5A91A]">{event.name}</span>?
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-[#E5A91A]/80 bg-[#E5A91A]/10 p-3 rounded border border-[#E5A91A]/30 leading-relaxed">
              This will permanently delete all {event.vendors.length} vendors, {event.tasks.length} tasks, and saved AI chat history associated with this celebration.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-1.5 text-xs font-bold text-[#E5A91A] hover:bg-[#E5A91A]/10 border border-[#E5A91A]/30 rounded transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteEvent(event.id);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#C41E3A] text-[#0A0A0A] hover:bg-[#C41E3A]/80 border border-[#C41E3A] rounded transition-colors cursor-pointer select-none"
              >
                Yes, Delete Celebration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
