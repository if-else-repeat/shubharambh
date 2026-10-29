import React from 'react';
import { AppView } from '../../types/host.ts';

interface ScreenHeaderNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

/**
 * ScreenHeaderNav provides consistent sub-navigation across all inner workspace screens.
 */
export const ScreenHeaderNav: React.FC<ScreenHeaderNavProps> = ({
  currentView,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5A91A]/20">
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className="inline-flex items-center text-xs font-bold text-[#E5A91A] hover:text-[#C41E3A] cursor-pointer transition-colors"
      >
        Back to Dashboard
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#E5A91A]/50">Quick switch:</span>
        {currentView !== 'budget' && (
          <button
            type="button"
            onClick={() => onNavigate('budget')}
            className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#E5A91A]/40 text-[#E5A91A] hover:border-[#E5A91A] hover:bg-[#E5A91A]/10 transition-colors cursor-pointer"
          >
            Budget & Vendors
          </button>
        )}
        {currentView !== 'checklist' && (
          <button
            type="button"
            onClick={() => onNavigate('checklist')}
            className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#E5A91A]/40 text-[#E5A91A] hover:border-[#E5A91A] hover:bg-[#E5A91A]/10 transition-colors cursor-pointer"
          >
            Timelines & Checklist
          </button>
        )}
        {currentView !== 'ai' && (
          <button
            type="button"
            onClick={() => onNavigate('ai')}
            className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#C41E3A]/50 text-[#C41E3A] hover:border-[#C41E3A] hover:bg-[#C41E3A]/10 transition-colors cursor-pointer"
          >
            GenAI Assistant
          </button>
        )}
      </div>
    </div>
  );
};
