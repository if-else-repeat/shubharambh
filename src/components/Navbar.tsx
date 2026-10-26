import React from 'react';
import { HostEvent, AppView } from '../types/host.ts';

interface NavbarProps {
  events: HostEvent[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onNavigate: (view: AppView) => void;
  currentView: AppView;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onOpenNewEventModal,
  onNavigate,
  currentView,
}) => {
  const currentIndex = events.findIndex((e) => e.id === activeEventId);
  const currentEvent = events[currentIndex] || events[0];

  const handleNextEvent = () => {
    if (events.length <= 1) return;
    const nextIndex = (currentIndex + 1) % events.length;
    onSelectEvent(events[nextIndex].id);
  };

  const handleToggleMenu = () => {
    if (currentView === 'menu') {
      onNavigate('home');
    } else {
      onNavigate('menu');
    }
  };

  return (
    <header className="w-full bg-[#0A0A0A] border-b border-[#E5A91A]/30 sticky top-0 z-20">
      {/* Main Header Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand & SVG Logo - Clicking returns to Home */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          title="Return to Home Dashboard"
        >
          {/* User's Exact SVG Brand Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 512 512" width="100%" height="100%">
              <rect width="512" height="512" rx="128" fill="#0A0A0A" />
              <g strokeLinecap="round" strokeWidth="56">
                <line x1="224" y1="168" x2="368" y2="168" stroke="#E5A91A" />
                <line x1="144" y1="256" x2="368" y2="256" stroke="#C41E3A" />
                <line x1="144" y1="344" x2="288" y2="344" stroke="#E5A91A" />
              </g>
            </svg>
          </div>

          {/* Brand: shubharambh in crimson red (#C41E3A) with Outfit font */}
          <span className="font-heading font-extrabold text-[#C41E3A] text-2xl sm:text-3xl tracking-tight">
            shubharambh
          </span>
        </div>

        {/* Top Right: Compact Plus Button + Menu Page Button */}
        <div className="flex items-center gap-2">
          {/* Plus button (Creates new celebration modal) */}
          <button
            type="button"
            onClick={onOpenNewEventModal}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E5A91A] bg-[#0A0A0A] text-[#E5A91A] hover:bg-[#E5A91A] hover:text-[#0A0A0A] flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
            title="Create New Celebration"
            aria-label="Create New Celebration"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Menu button - Opens Menu Page (not a popup window) */}
          <button
            type="button"
            onClick={handleToggleMenu}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center cursor-pointer select-none active:scale-95 ${
              currentView === 'menu'
                ? 'bg-[#E5A91A] text-[#0A0A0A] border-[#E5A91A]'
                : 'border-[#E5A91A]/40 bg-[#0A0A0A] text-[#E5A91A] hover:border-[#E5A91A] hover:bg-[#E5A91A]/10'
            }`}
            title="Open Celebrations & Settings Page"
            aria-label="Open Settings Page"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thin strip below the header: Event heading + Next button in same strip */}
      {currentEvent && events.length > 0 && (
        <div className="w-full bg-[#0A0A0A] border-t border-b border-[#E5A91A]/20 py-2">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
            {/* Event Heading in Outfit font + Next Button right next to it */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="font-heading font-bold text-sm sm:text-base text-[#E5A91A] hover:text-[#C41E3A] truncate tracking-tight text-left cursor-pointer"
                title="Click to go to celebration home"
              >
                {currentEvent.name}
              </button>

              {events.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextEvent}
                  className="px-2.5 py-1 bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] text-xs font-bold rounded border border-[#E5A91A] cursor-pointer inline-flex items-center transition-colors select-none shrink-0"
                  title="Next Celebration"
                >
                  Next
                </button>
              )}
            </div>

            {/* Current View Indicator / Celebration Indicator */}
            <div className="text-[11px] font-bold text-[#E5A91A]/70 shrink-0 flex items-center gap-2">
              {currentView !== 'home' && (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-xs font-bold text-[#C41E3A] hover:underline cursor-pointer"
                >
                  Dashboard
                </button>
              )}
              <span>
                {currentIndex >= 0 ? currentIndex + 1 : 1} of {events.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
