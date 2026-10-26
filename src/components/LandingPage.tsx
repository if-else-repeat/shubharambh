import React from 'react';

interface LandingPageProps {
  onOpenNewEventModal: () => void;
  onLoadPresets: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenNewEventModal, onLoadPresets }) => {
  return (
    <div className="py-12 sm:py-20 max-w-3xl mx-auto px-4 text-center space-y-8">
      {/* Brand Icon & Heading */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20">
          <svg viewBox="0 0 512 512" width="100%" height="100%">
            <rect width="512" height="512" rx="128" fill="#0A0A0A" />
            <g strokeLinecap="round" strokeWidth="56">
              <line x1="224" y1="168" x2="368" y2="168" stroke="#E5A91A" />
              <line x1="144" y1="256" x2="368" y2="256" stroke="#C41E3A" />
              <line x1="144" y1="344" x2="288" y2="344" stroke="#E5A91A" />
            </g>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#C41E3A] tracking-tight">
            shubharambh
          </h1>
          <p className="font-heading font-bold text-lg sm:text-2xl text-[#E5A91A]">
            Celebration & Event Planner
          </p>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#E5A91A]/70">
            GenAI-Powered Planning Assistant for Weddings, Birthdays & Community Events
          </p>
        </div>

        <p className="text-sm sm:text-base text-[#E5A91A]/80 max-w-xl mx-auto leading-relaxed font-medium">
          From an intimate ₹5,000 birthday dinner to a ₹25,00,000 royal wedding. Built for hosts to balance budgets with a single cost tally, manage vendor checklists and payment statuses, track execution timelines, and generate personalized ideas with AI.
        </p>
      </div>

      {/* 3 Core High-Utility Features (Directly aligned with problem statement) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
        <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#E5A91A]/30 space-y-1.5 hover:border-[#E5A91A] transition-colors">
          <span className="text-[#C41E3A] font-bold text-xs uppercase tracking-wider">01. Personalized Ideas</span>
          <h3 className="font-heading font-bold text-base text-[#E5A91A]">GenAI Assistant</h3>
          <p className="text-xs text-[#E5A91A]/70 leading-relaxed">
            Brainstorm floral decor themes, curated menus, and invitations tailored to your exact budget tier, guest count, and celebration type.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#E5A91A]/30 space-y-1.5 hover:border-[#E5A91A] transition-colors">
          <span className="text-[#C41E3A] font-bold text-xs uppercase tracking-wider">02. Single Cost Tally</span>
          <h3 className="font-heading font-bold text-base text-[#E5A91A]">Budget & Vendors</h3>
          <p className="text-xs text-[#E5A91A]/70 leading-relaxed">
            Track contracts, itemized expenses, and advance payments across Pending, Booked, and Paid statuses with zero spreadsheet complexity.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#E5A91A]/30 space-y-1.5 hover:border-[#E5A91A] transition-colors">
          <span className="text-[#C41E3A] font-bold text-xs uppercase tracking-wider">03. Execution & Anomalies</span>
          <h3 className="font-heading font-bold text-base text-[#E5A91A]">Timelines & Rebalancer</h3>
          <p className="text-xs text-[#E5A91A]/70 leading-relaxed">
            Execute chronological milestones without clutter. If guest counts surge or budgets drop, the engine rebalances numbers in one click.
          </p>
        </div>
      </div>

      {/* Two Primary Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenNewEventModal}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] text-[#0A0A0A] font-heading font-bold text-sm sm:text-base rounded border border-[#E5A91A] transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          <span>+ Create Your First Celebration</span>
        </button>

        <button
          type="button"
          onClick={onLoadPresets}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#0A0A0A] hover:bg-[#E5A91A]/10 text-[#E5A91A] font-heading font-bold text-sm sm:text-base rounded border border-[#E5A91A]/60 transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Load Sample Celebrations</span>
        </button>
      </div>
    </div>
  );
};
