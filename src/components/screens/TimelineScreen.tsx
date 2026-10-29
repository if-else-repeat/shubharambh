import React, { useState, useMemo } from 'react';
import { HostTask, AppView } from '../../types/host.ts';
import { ScreenHeaderNav } from '../common/ScreenHeaderNav.tsx';
import { TaskItemRow } from '../checklist/TaskItemRow.tsx';
import { AddTaskForm } from '../checklist/AddTaskForm.tsx';
import { TaskProgressHeader } from '../checklist/TaskProgressHeader.tsx';

interface TimelineScreenProps {
  tasks: HostTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<HostTask, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigate?: (view: AppView) => void;
}

/**
 * TimelineScreen provides milestone task tracking and day-of checklist management.
 */
export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onNavigate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const pendingCount = tasks.length - completedCount;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="space-y-6">
      {onNavigate && <ScreenHeaderNav currentView="checklist" onNavigate={onNavigate} />}

      {/* Screen Title & Add Button */}
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

        <div className="mt-6">
          <TaskProgressHeader
            completedCount={completedCount}
            totalCount={totalCount}
            pendingCount={pendingCount}
            progressPercent={progressPercent}
          />
        </div>
      </div>

      {isAdding && (
        <AddTaskForm
          onAddTask={(task) => {
            onAddTask(task);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Checklist Task Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-[#E5A91A]">
            Milestones ({filteredTasks.length})
          </h3>

          <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#E5A91A]/30 rounded p-0.5">
            {(['all', 'pending', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                className={`text-xs px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                  filter === mode
                    ? 'bg-[#E5A91A] text-[#0A0A0A] font-bold'
                    : 'text-[#E5A91A]/70 hover:text-[#E5A91A]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-[#0A0A0A] border border-[#E5A91A]/20 rounded-lg">
            <p className="text-sm text-[#E5A91A]/60">No tasks in this view.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskItemRow
                key={task.id}
                task={task}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
