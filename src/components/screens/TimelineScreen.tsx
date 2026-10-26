import React, { useState } from 'react';
import { HostTask, AppView } from '../../types/host.ts';

interface TimelineScreenProps {
  tasks: HostTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<HostTask, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigate?: (view: AppView) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onNavigate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      dueDate: dueDate.trim() || 'TBD',
      completed: false,
    });

    setTitle('');
    setDueDate('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar with Back button and Quick Switchers */}
      {onNavigate && (
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
            <button
              type="button"
              onClick={() => onNavigate('budget')}
              className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#E5A91A]/40 text-[#E5A91A] hover:border-[#E5A91A] hover:bg-[#E5A91A]/10 transition-colors cursor-pointer"
            >
              Budget & Vendors
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai')}
              className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#C41E3A]/50 text-[#C41E3A] hover:border-[#C41E3A] hover:bg-[#C41E3A]/10 transition-colors cursor-pointer"
            >
              GenAI Assistant
            </button>
          </div>
        </div>
      )}

      {/* Header & Simple Execution Progress */}
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E5A91A] tracking-tight">
              Timelines & Checklist
            </h2>
            <p className="text-xs font-medium text-[#E5A91A]/70 mt-1">
              Chronological milestone execution and day-of task checklist for seamless celebration management.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] text-[#0A0A0A] border border-[#E5A91A] text-xs font-bold rounded transition-colors cursor-pointer select-none"
          >
            {isAdding ? 'Close Form' : '+ Add Task'}
          </button>
        </div>

        {/* Flat Progress Bar */}
        <div className="mt-5 pt-4 border-t border-[#E5A91A]/20">
          <div className="flex justify-between text-xs font-bold text-[#E5A91A]/80 mb-1.5">
            <span>Overall Task Progress</span>
            <span>
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-2.5 rounded-full overflow-hidden border border-[#E5A91A]/40">
            <div
              className="bg-[#E5A91A] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-5 flex items-center gap-2 pt-3 border-t border-[#E5A91A]/15 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#E5A91A] text-[#0A0A0A]'
                : 'text-[#E5A91A]/70 hover:text-[#E5A91A] border border-[#E5A91A]/20'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#E5A91A] text-[#0A0A0A]'
                : 'text-[#E5A91A]/70 hover:text-[#E5A91A] border border-[#E5A91A]/20'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#E5A91A] text-[#0A0A0A]'
                : 'text-[#E5A91A]/70 hover:text-[#E5A91A] border border-[#E5A91A]/20'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-[#0A0A0A] border-2 border-[#E5A91A] rounded-lg p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#E5A91A]/20 pb-2">
            <h3 className="font-heading font-bold text-base text-[#E5A91A]">Add Checklist Task</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Verify acoustic decibel permission with venue authority"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/40 focus:outline-none focus:border-[#E5A91A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">
                Target Due Date
              </label>
              <input
                type="text"
                placeholder="e.g. Nov 15, 2026 or 1 Week Out"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/40 focus:outline-none focus:border-[#E5A91A]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5A91A]/20">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs font-bold text-[#E5A91A] border border-[#E5A91A]/40 rounded hover:bg-[#E5A91A]/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] border border-[#E5A91A] rounded cursor-pointer"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Simple Flat Checklist (No Blocks!) */}
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-5 shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm font-medium text-[#E5A91A]/60">
              {filter === 'completed'
                ? 'No completed tasks yet.'
                : filter === 'pending'
                ? 'No pending tasks! All caught up.'
                : 'No tasks on your checklist yet.'}
            </p>
            {filter === 'all' && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs font-bold text-[#C41E3A] hover:underline cursor-pointer"
              >
                + Add your first task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E5A91A]/15">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-3.5 flex items-start justify-between gap-3 group hover:bg-[#E5A91A]/5 px-2 rounded transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="mt-1 h-4 w-4 rounded border border-[#E5A91A] accent-[#C41E3A] cursor-pointer flex-shrink-0"
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className="flex-1 cursor-pointer select-none min-w-0"
                  >
                    <span
                      className={`text-sm block break-words ${
                        task.completed
                          ? 'line-through text-[#E5A91A]/40 font-medium'
                          : 'text-[#E5A91A] font-semibold'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.dueDate && task.dueDate !== 'TBD' && (
                      <span className="inline-block text-[11px] font-medium text-[#E5A91A]/60 mt-1 px-1.5 py-0.2 rounded bg-[#E5A91A]/10 border border-[#E5A91A]/20">
                        Due: {task.dueDate}
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.completed && (
                    <span className="text-[11px] font-bold text-[#C41E3A] hidden sm:inline">
                      Completed
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-[#E5A91A]/40 hover:text-[#C41E3A] opacity-0 group-hover:opacity-100 transition-opacity p-1 text-xs font-extrabold cursor-pointer"
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
