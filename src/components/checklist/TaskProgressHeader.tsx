import React from 'react';

interface TaskProgressHeaderProps {
  completedCount: number;
  totalCount: number;
  pendingCount: number;
  progressPercent: number;
}

/**
 * TaskProgressHeader renders the checklist completion stats and progress indicator.
 */
export const TaskProgressHeader: React.FC<TaskProgressHeaderProps> = ({
  completedCount,
  totalCount,
  pendingCount,
  progressPercent,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0A0A0A] border border-[#E5A91A]/40 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-[#E5A91A]/70">
            Total Tasks
          </p>
          <p className="font-heading font-extrabold text-2xl text-[#E5A91A] mt-1">
            {totalCount}
          </p>
          <p className="text-[11px] text-[#E5A91A]/50 mt-1">Milestones tracked</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#E5A91A]/40 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-[#E5A91A]/70">
            Completed
          </p>
          <p className="font-heading font-extrabold text-2xl text-[#16A34A] mt-1">
            {completedCount}
          </p>
          <p className="text-[11px] text-[#E5A91A]/50 mt-1">Execution confirmed</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#E5A91A]/40 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-[#E5A91A]/70">
            Pending Action Items
          </p>
          <p className="font-heading font-extrabold text-2xl text-[#C41E3A] mt-1">
            {pendingCount}
          </p>
          <p className="text-[11px] text-[#E5A91A]/50 mt-1">Awaiting day-of completion</p>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-[#E5A91A]">Execution Progress</span>
          <span className="text-[#E5A91A]">{progressPercent}% complete</span>
        </div>
        <div className="w-full bg-[#E5A91A]/10 h-2.5 rounded-full overflow-hidden border border-[#E5A91A]/30">
          <div
            className="h-full bg-[#E5A91A] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
