import React, { useState } from 'react';
import { HostEvent, getVendorCost, AppView } from '../../types/host.ts';

interface MenuScreenProps {
  events: HostEvent[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onDeleteEvent: (eventId: string) => void;
  onClearAllEvents: () => void;
  onNavigate: (view: AppView) => void;
}

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
      {/* Top Navigation Bar with Back button */}
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

      {/* Main Settings & Celebrations Panel */}
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
                  {currentEvent.date} • {currentEvent.guestCount} guests • ₹{currentEvent.totalBudget.toLocaleString('en-IN')} budget cap
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
              {events.map((ev) => {
                const isActive = ev.id === activeEventId;
                const cost = ev.vendors.reduce((s, v) => s + getVendorCost(v), 0);

                return (
                  <div
                    key={ev.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-[#E5A91A]/10 border-[#E5A91A]'
                        : 'bg-[#0A0A0A] border-[#E5A91A]/25 hover:border-[#E5A91A]/60'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectEvent(ev.id);
                        onNavigate('home');
                      }}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-base text-[#E5A91A] truncate">
                          {ev.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-[#E5A91A] text-[#0A0A0A] px-2 py-0.5 rounded">
                            Active Now
                          </span>
                        )}
                        {ev.date && (
                          <span className="text-xs text-[#E5A91A]/60">
                            • {ev.date}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#E5A91A]/70 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Budget: ₹{ev.totalBudget.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span>Cost: ₹{cost.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span>{ev.vendors.length} items</span>
                        <span>•</span>
                        <span>{ev.tasks.length} tasks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectEvent(ev.id);
                            onNavigate('home');
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] border border-[#E5A91A] cursor-pointer"
                        >
                          Switch & View
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigate('home')}
                          className="text-xs font-bold px-3 py-1.5 rounded bg-[#0A0A0A] text-[#E5A91A] border border-[#E5A91A] hover:bg-[#E5A91A] hover:text-[#0A0A0A] cursor-pointer"
                        >
                          View Dashboard
                        </button>
                      )}

                      {events.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete celebration "${ev.name}"?`)) {
                              onDeleteEvent(ev.id);
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
              })}
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
        <div className="pt-6 border-t border-[#E5A91A]/20 flex flex-col items-center justify-center space-y-3">
          {/* GitHub & LinkedIn Circle Icons with Yellow Outline & Official Colors on Click */}
          <div className="flex items-center justify-center gap-3.5">
            {/* GitHub - Yellow outline, official Green (#238636) on click/hover */}
            <a
              href="https://github.com/if-else-repeat"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-[#E5A91A] bg-[#0A0A0A] text-[#E5A91A] hover:border-[#238636] hover:text-[#238636] hover:bg-[#238636]/15 active:bg-[#238636] active:border-[#238636] active:text-[#0A0A0A] flex items-center justify-center transition-all cursor-pointer shadow-md select-none group"
              title="GitHub: if-else-repeat"
              aria-label="GitHub Profile"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* LinkedIn - Yellow outline, official Blue (#0A66C2) on click/hover */}
            <a
              href="https://www.linkedin.com/in/priyanshu-raj-mishra"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-[#E5A91A] bg-[#0A0A0A] text-[#E5A91A] hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/15 active:bg-[#0A66C2] active:border-[#0A66C2] active:text-white flex items-center justify-center transition-all cursor-pointer shadow-md select-none group"
              title="LinkedIn: priyanshu-raj-mishra"
              aria-label="LinkedIn Profile"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </a>
          </div>

          {/* AN OLDMILL PROJECT Link */}
          <div className="text-center pt-1">
            <a
              href="https://oldmill.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold tracking-widest uppercase text-[#E5A91A] hover:text-[#E5A91A] hover:underline transition-colors cursor-pointer select-none inline-block"
            >
              AN OLDMILL PROJECT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
