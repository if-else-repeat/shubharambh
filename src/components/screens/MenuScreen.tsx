import React, { useState } from 'react';
import { HostEvent, AppView } from '../../types/host.ts';
import { CelebrationSwitcherCard } from '../menu/CelebrationSwitcherCard.tsx';
import { MenuFooterCredits } from '../menu/MenuFooterCredits.tsx';
import { formatRupees } from '../../utils/sanitize.ts';

interface MenuScreenProps {
  events: HostEvent[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onDeleteEvent: (eventId: string) => void;
  onClearAllEvents: () => void;
  onNavigate: (view: AppView) => void;
}

/**
 * MenuScreen provides multi-event switching, workspace clearing,
 * and project engine credentials.
 */
export const MenuScreen: React.FC<MenuScreenProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onOpenNewEventModal,
  onDeleteEvent,
  onClearAllEvents,
  onNavigate,
}) => {
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const currentEvent = events.find((e) => e.id === activeEventId) || events[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5A91A]/20">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center text-xs font-bold text-[#E5A91A] hover:text-[#C41E3A] cursor-pointer transition-colors"
        >
          Back to Dashboard
        </button>

        <span className="text-xs font-medium text-[#E5A91A]/60">
          Celebrations & Engine Settings
        </span>
      </div>

      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-5 sm:p-6 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5A91A]/20 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#C41E3A]" />
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E5A91A] tracking-tight">
                Celebrations & Workspace
              </h2>
            </div>
            <p className="text-xs font-medium text-[#E5A91A]/70 mt-1">
              Switch between celebrations, configure events, or inspect the AI engine.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewEventModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] text-[#0A0A0A] border border-[#E5A91A] text-xs font-bold rounded transition-colors cursor-pointer select-none"
          >
            <span>+ Launch New Celebration</span>
          </button>
        </div>

        {/* Current Active Celebration Card */}
        {currentEvent && (
          <div className="p-4 rounded-lg bg-[#E5A91A]/10 border border-[#E5A91A]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#E5A91A] uppercase tracking-wider">
                Current Active Celebration
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5A91A] text-[#0A0A0A]">
                ACTIVE
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#E5A91A]">
                  {currentEvent.name}
                </h3>
                <p className="text-xs text-[#E5A91A]/70">
                  {currentEvent.date} • {currentEvent.guestCount} guests • {formatRupees(currentEvent.totalBudget)} budget cap
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#E5A91A] hover:text-[#0A0A0A] text-[#E5A91A] border border-[#E5A91A] text-xs font-bold rounded transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Celebration Switcher List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E5A91A]/80">
              All Celebrations ({events.length})
            </h3>
            <span className="text-xs text-[#E5A91A]/50">Click any celebration to switch</span>
          </div>

          {events.length === 0 ? (
            <div className="p-6 rounded border border-[#E5A91A]/20 text-center text-xs text-[#E5A91A]/60">
              No celebrations recorded. Click above to launch one.
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.map((ev) => (
                <CelebrationSwitcherCard
                  key={ev.id}
                  event={ev}
                  isActive={ev.id === activeEventId}
                  canDelete={events.length > 1}
                  onSelectEvent={onSelectEvent}
                  onDeleteEvent={onDeleteEvent}
                  onNavigateHome={() => onNavigate('home')}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Brain Context & Model Info */}
        <div className="p-4 rounded-lg border border-[#E5A91A]/30 bg-[#E5A91A]/5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-[#E5A91A]">GenAI Planning Engine</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C41E3A] text-[#0A0A0A]">
              gemini-3.8-flash
            </span>
          </div>
          <p className="text-[#E5A91A]/70 leading-relaxed">
            Celebration & Event Planner assistant that helps organizers manage weddings, birthdays, and community events with single-cost budgets, chronological timelines, vendor checklists, and personalized ideas.
          </p>
        </div>

        {/* Danger Zone: Wipe All Celebrations */}
        {events.length > 0 && (
          <div className="pt-4 border-t border-[#E5A91A]/20">
            {showWipeConfirm ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#C41E3A] block">Are you sure?</span>
                  <span className="text-xs text-[#E5A91A]/60">
                    Wipe all celebrations, resets storage and returns to landing screen.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllEvents();
                      setShowWipeConfirm(false);
                      onNavigate('home');
                    }}
                    className="text-xs font-bold bg-[#C41E3A] text-[#0A0A0A] px-3.5 py-1.5 rounded hover:bg-[#A3162C] cursor-pointer"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWipeConfirm(false)}
                    className="text-xs font-bold text-[#E5A91A] border border-[#E5A91A]/40 px-3 py-1.5 rounded hover:bg-[#E5A91A]/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#C41E3A] block">Danger Zone</span>
                  <span className="text-xs text-[#E5A91A]/60">
                    Wipe all celebrations, resets storage and returns to landing screen.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWipeConfirm(true)}
                  className="font-bold text-xs text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-[#0A0A0A] px-3.5 py-1.5 rounded cursor-pointer transition-colors shrink-0"
                >
                  Wipe All Celebrations
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Credit & Social Links */}
        <MenuFooterCredits />
      </div>
    </div>
  );
};
