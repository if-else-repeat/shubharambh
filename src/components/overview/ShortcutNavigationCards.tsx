import React from 'react';
import { HostEvent } from '../../types/host.ts';
import { formatRupees } from '../../utils/sanitize.ts';

interface ShortcutNavigationCardsProps {
  event: HostEvent;
  totalCost: number;
  remainingBudget: number;
  completedTasks: number;
  pendingTasks: HostEvent['tasks'];
  onNavigate: (view: 'budget' | 'checklist' | 'ai') => void;
  onToggleTask: (taskId: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

/**
 * ShortcutNavigationCards renders the three primary action cards on the home dashboard:
 * 1. Budget & Vendors
 * 2. Timelines & Checklist
 * 3. GenAI Assistant
 */
export const ShortcutNavigationCards: React.FC<ShortcutNavigationCardsProps> = ({
  event,
  totalCost,
  remainingBudget,
  completedTasks,
  pendingTasks,
  onNavigate,
  onToggleTask,
  onSelectPrompt,
}) => {
  return (
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
                <span>{formatRupees(totalCost)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#E5A91A]/70 font-medium">
                <span>Balance:</span>
                <span className={remainingBudget >= 0 ? 'text-[#E5A91A]' : 'text-[#C41E3A] font-bold'}>
                  {formatRupees(Math.abs(remainingBudget))} {remainingBudget >= 0 ? 'left' : 'deficit'}
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

            <div className="mt-4 pt-3 border-t border-[#E5A91A]/20 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#E5A91A]/60 block">Quick Prompts</span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPrompt('Audit caterer plate count clauses and unbilled liabilities');
                  }}
                  className="text-left text-[11px] font-medium text-[#E5A91A] bg-[#E5A91A]/10 hover:bg-[#E5A91A]/20 px-2.5 py-1 rounded truncate border border-[#E5A91A]/20 cursor-pointer"
                >
                  🔍 Caterer plate audit & leakage
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPrompt('Give me 3 cost-effective aesthetic decor ideas for this budget');
                  }}
                  className="text-left text-[11px] font-medium text-[#E5A91A] bg-[#E5A91A]/10 hover:bg-[#E5A91A]/20 px-2.5 py-1 rounded truncate border border-[#E5A91A]/20 cursor-pointer"
                >
                  ✨ 3 aesthetic decor ideas
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPrompt('Guest count just increased by 40, rebalance budget');
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
  );
};
