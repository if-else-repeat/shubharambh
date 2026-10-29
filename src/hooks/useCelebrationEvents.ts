import { useState, useEffect, useCallback } from 'react';
import { HostEvent, HostVendor, HostTask, AnomalyData } from '../types/host.ts';
import { INITIAL_EVENTS } from '../data/initialEvents.ts';
import { applyAnomalyAdjustments } from '../services/assistantEngine.ts';

const EVENT_STORAGE_KEYS = {
  EVENTS: 'shubharambh_events_v6',
  ACTIVE_ID: 'shubharambh_active_id_v6',
} as const;

export function useCelebrationEvents() {
  const [events, setEvents] = useState<Record<string, HostEvent>>(() => {
    try {
      const saved = localStorage.getItem(EVENT_STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // Graceful fallback to empty state
    }
    return {};
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(EVENT_STORAGE_KEYS.ACTIVE_ID);
      if (savedId) {
        return savedId;
      }
    } catch {
      // Graceful fallback
    }
    return '';
  });

  // Sync events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EVENT_STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch {
      // Storage quota or restriction protection
    }
  }, [events]);

  // Sync active event ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EVENT_STORAGE_KEYS.ACTIVE_ID, activeEventId);
    } catch {
      // Storage quota or restriction protection
    }
  }, [activeEventId]);

  // Maintain valid active event selection
  useEffect(() => {
    const keys = Object.keys(events);
    if (keys.length > 0 && (!activeEventId || !events[activeEventId])) {
      setActiveEventId(keys[0]);
    } else if (keys.length === 0 && activeEventId !== '') {
      setActiveEventId('');
    }
  }, [events, activeEventId]);

  const hasEvents = Object.keys(events).length > 0 && Boolean(events[activeEventId]);
  const currentEvent: HostEvent | null = hasEvents ? events[activeEventId] : null;

  const handleSelectEvent = useCallback((id: string) => {
    setEvents((prev) => {
      if (prev[id]) {
        setActiveEventId(id);
      }
      return prev;
    });
  }, []);

  const handleCreateEvent = useCallback((newEvent: HostEvent) => {
    setEvents((prev) => ({ ...prev, [newEvent.id]: newEvent }));
    setActiveEventId(newEvent.id);
  }, []);

  const handleDeleteEvent = useCallback((eventIdToDelete: string) => {
    setEvents((prev) => {
      const next = { ...prev };
      delete next[eventIdToDelete];
      const remainingKeys = Object.keys(next);
      const nextActiveId = remainingKeys.length > 0 ? remainingKeys[0] : '';
      setActiveEventId(nextActiveId);
      return next;
    });
  }, []);

  const handleClearAllEvents = useCallback(() => {
    setEvents({});
    setActiveEventId('');
    try {
      localStorage.removeItem(EVENT_STORAGE_KEYS.EVENTS);
      localStorage.removeItem(EVENT_STORAGE_KEYS.ACTIVE_ID);
    } catch {
      // Handled silently
    }
  }, []);

  const handleLoadPresets = useCallback(() => {
    setEvents(INITIAL_EVENTS);
    const firstId = Object.keys(INITIAL_EVENTS)[0] || '';
    setActiveEventId(firstId);
  }, []);

  const handleToggleTask = useCallback((taskId: string) => {
    if (!activeEventId) return;
    setEvents((prev) => {
      const ev = prev[activeEventId];
      if (!ev) return prev;
      const updatedTasks = ev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, [activeEventId]: { ...ev, tasks: updatedTasks } };
    });
  }, [activeEventId]);

  const handleAddTask = useCallback((taskData: Omit<HostTask, 'id'>) => {
    if (!activeEventId) return;
    const newTask: HostTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setEvents((prev) => {
      const ev = prev[activeEventId];
      if (!ev) return prev;
      return { ...prev, [activeEventId]: { ...ev, tasks: [...ev.tasks, newTask] } };
    });
  }, [activeEventId]);

  const handleDeleteTask = useCallback((taskId: string) => {
    if (!activeEventId) return;
    setEvents((prev) => {
      const ev = prev[activeEventId];
      if (!ev) return prev;
      return {
        ...prev,
        [activeEventId]: { ...ev, tasks: ev.tasks.filter((t) => t.id !== taskId) },
      };
    });
  }, [activeEventId]);

  const handleAddVendor = useCallback((vendorData: Omit<HostVendor, 'id'>) => {
    if (!activeEventId) return;
    const newVendor: HostVendor = {
      ...vendorData,
      id: `v-${Date.now()}`,
    };
    setEvents((prev) => {
      const ev = prev[activeEventId];
      if (!ev) return prev;
      return {
        ...prev,
        [activeEventId]: { ...ev, vendors: [...ev.vendors, newVendor] },
      };
    });
  }, [activeEventId]);

  const handleUpdateVendor = useCallback((updatedVendor: HostVendor) => {
    if (!activeEventId) return;
    setEvents((prev) => {
      const ev = prev[activeEventId];
      if (!ev) return prev;
      const updatedVendors = ev.vendors.map((v) =>
        v.id === updatedVendor.id ? updatedVendor : v
      );
      return {
        ...prev,
        [activeEventId]: { ...ev, vendors: updatedVendors },
      };
    });
  }, [activeEventId]);

  const handleDeleteVendor = useCallback((vendorId: string) => {
    if (!activeEventId) return;
    setEvents((prev) => {
      const ev = prev[activeEventId];
      if (!ev) return prev;
      return {
        ...prev,
        [activeEventId]: {
          ...ev,
          vendors: ev.vendors.filter((v) => v.id !== vendorId),
        },
      };
    });
  }, [activeEventId]);

  const handleApplyAnomalyAdjustments = useCallback((targetEventId: string, anomalyData: AnomalyData) => {
    setEvents((prev) => {
      const ev = prev[targetEventId];
      if (!ev) return prev;
      return {
        ...prev,
        [targetEventId]: applyAnomalyAdjustments(ev, anomalyData),
      };
    });
  }, []);

  return {
    events,
    activeEventId,
    currentEvent,
    hasEvents,
    handleSelectEvent,
    handleCreateEvent,
    handleDeleteEvent,
    handleClearAllEvents,
    handleLoadPresets,
    handleToggleTask,
    handleAddTask,
    handleDeleteTask,
    handleAddVendor,
    handleUpdateVendor,
    handleDeleteVendor,
    handleApplyAnomalyAdjustments,
  };
}
