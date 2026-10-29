import React from 'react';
import { HostTask } from '../../types/host.ts';

interface TaskItemRowProps {
  task: HostTask;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * TaskItemRow renders an individual checklist task with status checkbox and deletion.
 */
export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onToggleTask,
  onDeleteTask,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-lg border transition-all ${
        task.completed
          ? 'bg-[#0A0A0A]/40 border-[#E5A91A]/10 opacity-70'
          : 'bg-[#0A0A0A] border-[#E5A91A]/30 hover:border-[#E5A91A]/60'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
          className="w-4 h-4 rounded border-[#E5A91A] text-[#E5A91A] focus:ring-[#E5A91A] cursor-pointer accent-[#E5A91A]"
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`text-xs sm:text-sm font-medium cursor-pointer truncate ${
            task.completed ? 'line-through text-[#E5A91A]/40' : 'text-[#E5A91A]'
          }`}
        >
          {task.title}
        </label>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {task.dueDate && task.dueDate !== 'TBD' && (
          <span className="text-[11px] font-semibold text-[#E5A91A]/60 bg-[#E5A91A]/5 border border-[#E5A91A]/20 px-2 py-0.5 rounded">
            {task.dueDate}
          </span>
        )}
        {task.deadlineGroup && (
          <span className="text-[10px] font-bold text-[#C41E3A] bg-[#C41E3A]/10 border border-[#C41E3A]/30 px-2 py-0.5 rounded hidden sm:inline">
            {task.deadlineGroup}
          </span>
        )}
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="text-[#C41E3A] hover:bg-[#C41E3A] hover:text-[#0A0A0A] p-1.5 rounded transition-colors cursor-pointer"
          title="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
