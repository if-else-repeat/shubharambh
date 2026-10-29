import React, { useMemo } from 'react';
import { HostEvent, getVendorCost } from '../../types/host.ts';
import { OverviewHeroBanner } from '../overview/OverviewHeroBanner.tsx';
import { ShortcutNavigationCards } from '../overview/ShortcutNavigationCards.tsx';

interface OverviewScreenProps {
  event: HostEvent;
  onDeleteEvent: (eventId: string) => void;
  onNavigate: (view: 'budget' | 'checklist' | 'ai' | 'menu') => void;
  onToggleTask: (taskId: string) => void;
  onSelectPrompt?: (prompt: string) => void;
}

/**
 * OverviewScreen orchestrates the executive celebration dashboard,
 * including budget metrics, timeline summaries, and shortcut cards.
 */
export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  event,
  onDeleteEvent,
  onNavigate,
  onToggleTask,
  onSelectPrompt,
}) => {
  // Single Cost Tally: calculate total cost across all items
  const totalCost = useMemo(
    () => event.vendors.reduce((sum, v) => sum + getVendorCost(v), 0),
    [event.vendors]
  );
  const totalBudget = event.totalBudget || 1;
  const percentSpent = Math.min(100, Math.round((totalCost / totalBudget) * 100));
  const remainingBudget = totalBudget - totalCost;

  const completedTasks = useMemo(
    () => event.tasks.filter((t) => t.completed).length,
    [event.tasks]
  );
  const pendingTasks = useMemo(
    () => event.tasks.filter((t) => !t.completed),
    [event.tasks]
  );

  const handleSelectPrompt = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    }
    onNavigate('ai');
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Celebration Banner */}
      <OverviewHeroBanner
        event={event}
        totalCost={totalCost}
        totalBudget={totalBudget}
        remainingBudget={remainingBudget}
        percentSpent={percentSpent}
        onDeleteEvent={onDeleteEvent}
        onNavigate={onNavigate}
      />

      {/* 2. Primary Shortcut Navigation Cards */}
      <ShortcutNavigationCards
        event={event}
        totalCost={totalCost}
        remainingBudget={remainingBudget}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        onNavigate={onNavigate}
        onToggleTask={onToggleTask}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
};
