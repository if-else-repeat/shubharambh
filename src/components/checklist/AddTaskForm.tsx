import React, { useState } from 'react';
import { HostTask, DeadlineGroup } from '../../types/host.ts';
import { TASK_DEADLINE_GROUPS } from '../../constants/celebration.ts';

interface AddTaskFormProps {
  onAddTask: (task: Omit<HostTask, 'id'>) => void;
  onCancel: () => void;
}

/**
 * AddTaskForm provides an accessible form to create milestone checklist tasks.
 */
export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, onCancel }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deadlineGroup, setDeadlineGroup] = useState<DeadlineGroup>('Week Of');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      dueDate: dueDate.trim() || 'TBD',
      completed: false,
      deadlineGroup: deadlineGroup || 'Week Of',
    });

    setTitle('');
    setDueDate('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0A0A0A] border border-[#E5A91A] rounded-lg p-5 space-y-4"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#E5A91A]/20">
        <h3 className="font-heading font-bold text-base text-[#E5A91A]">Add New Milestone Task</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[#E5A91A]/60 hover:text-[#E5A91A]"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="task-title-input" className="block text-xs font-bold text-[#E5A91A] mb-1">
            Task Description *
          </label>
          <input
            id="task-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Confirm guest count with caterer, Book Pandit Ji"
            className="w-full px-3 py-2 text-xs bg-[#0A0A0A] border border-[#E5A91A]/40 rounded text-[#E5A91A] placeholder-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
          />
        </div>

        <div>
          <label
            htmlFor="task-deadline-select"
            className="block text-xs font-bold text-[#E5A91A] mb-1"
          >
            Milestone Window
          </label>
          <select
            id="task-deadline-select"
            value={deadlineGroup}
            onChange={(e) => setDeadlineGroup(e.target.value as DeadlineGroup)}
            className="w-full px-3 py-2 text-xs bg-[#0A0A0A] border border-[#E5A91A]/40 rounded text-[#E5A91A] focus:outline-none focus:border-[#E5A91A]"
          >
            {TASK_DEADLINE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-[#E5A91A]/80 hover:text-[#E5A91A] border border-[#E5A91A]/30 rounded cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-bold bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] rounded transition-colors cursor-pointer"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};
