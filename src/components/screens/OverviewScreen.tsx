import React, { useState } from 'react';
import { HostEvent, getVendorCost } from '../../types/host.ts';

interface OverviewScreenProps {
  event: HostEvent;
  onDeleteEvent: (eventId: string) => void;
  onNavigate: (view: 'budget' | 'checklist' | 'ai' | 'menu') => void;
  onToggleTask: (taskId: string) => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  event,
  onDeleteEvent,
  onNavigate,
  onToggleTask,
  onSelectPrompt,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Single Cost Tally: calculate total cost across all items
  const totalCost = event.vendors.reduce((sum, v) => sum + getVendorCost(v), 0);
  const totalBudget = event.totalBudget || 1;
  const percentSpent = Math.min(100, Math.round((totalCost / totalBudget) * 100));
  const remainingBudget = totalBudget - totalCost;

  const bookedVendorsCount = event.vendors.filter((v) => v.status === 'Booked').length;
  const completedTasks = event.tasks.filter((t) => t.completed).length;
  const pendingTasks = event.tasks.filter((t) => !t.completed);
  const taskPercent = event.tasks.length > 0 ? Math.round((completedTasks / event.tasks.length) * 100) : 0;

  const handlePromptClick = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    }
    onNavigate('ai');
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Celebration Banner */}
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
              Celebration Overview • {event.guestCount} expected guests • ₹{totalBudget.toLocaleString('en-IN')} allocated cap
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
              Total Budget: ₹{totalBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-sm font-bold text-[#E5A91A]/30 hidden sm:inline">|</span>
            <span className="text-base sm:text-xl font-bold text-[#E5A91A]/80">
              Total Cost: ₹{totalCost.toLocaleString('en-IN')}
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
              ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Flat Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold text-[#E5A91A]/80 mb-1.5">
            <span>{percentSpent}% of budget allocated</span>
            <span>
              ₹{totalCost.toLocaleString('en-IN')} of ₹{totalBudget.toLocaleString('en-IN')}
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

      {/* 2. THE THREE SHORTCUT CARDS (Budget, Checklist, AI) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#E5A91A]/70">
            Celebration Hub • Quick Shortcuts
          </h3>
          <span className="text-xs text-[#E5A91A]/50">Click any card to open full page</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Budget & Vendors */}
          <div
            onClick={() => onNavigate('budget')}
            className="bg-[#0A0A0A] border border-[#E5A91A]/30 hover:border-[#E5A91A] rounded-lg p-5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#E5A91A]/10 border border-[#E5A91A]/30 flex items-center justify-center text-[#E5A91A] group-hover:bg-[#E5A91A] group-hover:text-[#0A0A0A] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5A91A]/15 text-[#E5A91A] border border-[#E5A91A]/30">
                  {event.vendors.length} Items
                </span>
              </div>

              <h4 className="font-heading font-extrabold text-lg text-[#E5A91A] group-hover:text-[#E5A91A]">
                Budget & Vendors
              </h4>
              <p className="text-xs text-[#E5A91A]/70 mt-1 leading-relaxed">
                Single cost tally tracking for contracts, catering, decor & venue payment statuses.
              </p>

              <div className="mt-4 pt-3 border-t border-[#E5A91A]/20 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#E5A91A]">
                  <span>Total Cost:</span>
                  <span>₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-[#E5A91A]/70 font-medium">
                  <span>Balance:</span>
                  <span className={remainingBudget >= 0 ? 'text-[#E5A91A]' : 'text-[#C41E3A] font-bold'}>
                    ₹{Math.abs(remainingBudget).toLocaleString('en-IN')} {remainingBudget >= 0 ? 'left' : 'deficit'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#E5A91A]/60">
                  <span>Booked / Paid:</span>
                  <span>
                    {event.vendors.filter((v) => v.status === 'Booked' || v.status === 'Paid').length} of {event.vendors.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E5A91A]/15">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('budget');
                }}
                className="w-full py-2 bg-[#E5A91A] text-[#0A0A0A] group-hover:bg-[#C41E3A] group-hover:text-[#E5A91A] border border-[#E5A91A] text-xs font-bold rounded transition-colors flex items-center justify-center cursor-pointer select-none"
              >
                Open Budget & Vendors
              </button>
            </div>
          </div>

          {/* Card 2: Checklist */}
          <div
            onClick={() => onNavigate('checklist')}
            className="bg-[#0A0A0A] border border-[#E5A91A]/30 hover:border-[#E5A91A] rounded-lg p-5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#E5A91A]/10 border border-[#E5A91A]/30 flex items-center justify-center text-[#E5A91A] group-hover:bg-[#E5A91A] group-hover:text-[#0A0A0A] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5A91A]/15 text-[#E5A91A] border border-[#E5A91A]/30">
                  {completedTasks}/{event.tasks.length} Done
                </span>
              </div>

              <h4 className="font-heading font-extrabold text-lg text-[#E5A91A] group-hover:text-[#E5A91A]">
                Timelines & Checklist
              </h4>
              <p className="text-xs text-[#E5A91A]/70 mt-1 leading-relaxed">
                Chronological milestone execution and day-of task checklist without cumbersome blocks.
              </p>

              {/* Mini Upcoming Tasks Preview */}
              <div className="mt-4 pt-3 border-t border-[#E5A91A]/20 space-y-2">
                {event.tasks.length === 0 ? (
                  <p className="text-xs text-[#E5A91A]/40 italic py-1">No tasks created yet.</p>
                ) : (
                  pendingTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className="flex items-center gap-2 text-xs text-[#E5A91A] hover:text-[#C41E3A] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task.id)}
                        className="h-3.5 w-3.5 rounded border border-[#E5A91A] accent-[#C41E3A] cursor-pointer"
                      />
                      <span className="truncate flex-1 font-medium">{task.title}</span>
                    </div>
                  ))
                )}
                {pendingTasks.length > 3 && (
                  <p className="text-[11px] text-[#E5A91A]/50">
                    +{pendingTasks.length - 3} more pending tasks
                  </p>
                )}
                {pendingTasks.length === 0 && event.tasks.length > 0 && (
                  <p className="text-xs text-[#C41E3A] font-bold py-1">All tasks completed!</p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E5A91A]/15">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('checklist');
                }}
                className="w-full py-2 bg-[#E5A91A] text-[#0A0A0A] group-hover:bg-[#C41E3A] group-hover:text-[#E5A91A] border border-[#E5A91A] text-xs font-bold rounded transition-colors flex items-center justify-center cursor-pointer select-none"
              >
                Open Timelines & Checklist
              </button>
            </div>
          </div>

          {/* Card 3: AI Brain */}
          <div
            onClick={() => onNavigate('ai')}
            className="bg-[#0A0A0A] border border-[#E5A91A]/30 hover:border-[#E5A91A] rounded-lg p-5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#C41E3A]/15 border border-[#C41E3A] flex items-center justify-center text-[#C41E3A] group-hover:bg-[#C41E3A] group-hover:text-[#0A0A0A] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C41E3A] text-[#0A0A0A]">
                  gemini-3.8-flash
                </span>
              </div>

              <h4 className="font-heading font-extrabold text-lg text-[#E5A91A] group-hover:text-[#E5A91A]">
                GenAI Assistant
              </h4>
              <p className="text-xs text-[#E5A91A]/70 mt-1 leading-relaxed">
                Personalized celebration concepts, catering audits & instant budget shock rebalancing.
              </p>

              {/* Interactive Prompt Chips */}
              <div className="mt-4 pt-3 border-t border-[#E5A91A]/20 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#E5A91A]/60 block">Quick Prompts</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptClick("Audit caterer plate count clauses and unbilled liabilities");
                    }}
                    className="text-left text-[11px] font-medium text-[#E5A91A] bg-[#E5A91A]/10 hover:bg-[#E5A91A]/20 px-2.5 py-1 rounded truncate border border-[#E5A91A]/20 cursor-pointer"
                  >
                    🔍 Caterer plate audit & leakage
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptClick("Give me 3 cost-effective aesthetic decor ideas for this budget");
                    }}
                    className="text-left text-[11px] font-medium text-[#E5A91A] bg-[#E5A91A]/10 hover:bg-[#E5A91A]/20 px-2.5 py-1 rounded truncate border border-[#E5A91A]/20 cursor-pointer"
                  >
                    ✨ 3 aesthetic decor ideas
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptClick("Guest count just increased by 40, rebalance budget");
                    }}
                    className="text-left text-[11px] font-medium text-[#E5A91A] bg-[#E5A91A]/10 hover:bg-[#E5A91A]/20 px-2.5 py-1 rounded truncate border border-[#E5A91A]/20 cursor-pointer"
                  >
                    ⚡ Guest surge rebalance
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E5A91A]/15">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('ai');
                }}
                className="w-full py-2 bg-[#E5A91A] text-[#0A0A0A] group-hover:bg-[#C41E3A] group-hover:text-[#E5A91A] border border-[#E5A91A] text-xs font-bold rounded transition-colors flex items-center justify-center cursor-pointer select-none"
              >
                Open GenAI Assistant
              </button>
            </div>
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
    </div>
  );
};
