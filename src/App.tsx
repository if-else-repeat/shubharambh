import React, { useState, useEffect } from 'react';
import { HostEvent, ChatMessage, AnomalyData, HostVendor, HostTask, AppView } from './types/host.ts';
import { INITIAL_EVENTS } from './data/initialEvents.ts';
import { Navbar } from './components/Navbar.tsx';
import { OverviewScreen } from './components/screens/OverviewScreen.tsx';
import { VendorsScreen } from './components/screens/VendorsScreen.tsx';
import { TimelineScreen } from './components/screens/TimelineScreen.tsx';
import { AssistantScreen } from './components/screens/AssistantScreen.tsx';
import { MenuScreen } from './components/screens/MenuScreen.tsx';
import { NewEventModal } from './components/NewEventModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { processAssistantOffline } from './services/assistantEngine.ts';

const STORAGE_KEYS = {
  EVENTS: 'shubharambh_events_v6',
  ACTIVE_ID: 'shubharambh_active_id_v6',
  CHATS: 'shubharambh_chats_v6',
};

export default function App() {
  // 1. Current Active Page View (home, budget, checklist, ai, menu)
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string>('');

  // 2. Initialize Events from LocalStorage (defaults to {} so new visitors arrive on LandingPage)
  const [events, setEvents] = useState<Record<string, HostEvent>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read events from localStorage:', e);
    }
    return {};
  });

  // 3. Initialize Active Event ID from LocalStorage
  const [activeEventId, setActiveEventId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (savedId) {
        return savedId;
      }
    } catch (e) {
      console.warn('Failed to read activeEventId from localStorage:', e);
    }
    return '';
  });

  // 4. Initialize Chat Histories from LocalStorage
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read chatHistories from localStorage:', e);
    }
    return {};
  });

  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isLoadingAssistant, setIsLoadingAssistant] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage:', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeEventId);
    } catch (e) {
      console.error('Failed to save activeEventId to localStorage:', e);
    }
  }, [activeEventId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chatHistories));
    } catch (e) {
      console.error('Failed to save chatHistories to localStorage:', e);
    }
  }, [chatHistories]);

  // Ensure activeEventId points to a valid event if events exist
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
  const currentChatHistory = currentEvent ? chatHistories[currentEvent.id] || [] : [];

  // Event handlers
  const handleSelectEvent = (id: string) => {
    if (events[id]) {
      setActiveEventId(id);
    }
  };

  const handleCreateEvent = (newEvent: HostEvent) => {
    setEvents((prev) => ({ ...prev, [newEvent.id]: newEvent }));
    setActiveEventId(newEvent.id);
    setCurrentView('home');
  };

  const handleDeleteEvent = (eventIdToDelete: string) => {
    let nextActiveId = '';

    setEvents((prev) => {
      const next = { ...prev };
      delete next[eventIdToDelete];
      const remainingKeys = Object.keys(next);
      nextActiveId = remainingKeys.length > 0 ? remainingKeys[0] : '';
      return next;
    });

    setChatHistories((prev) => {
      const nextChats = { ...prev };
      delete nextChats[eventIdToDelete];
      return nextChats;
    });

    setActiveEventId(nextActiveId);
    setCurrentView('home');
  };

  const handleClearAllEvents = () => {
    setEvents({});
    setActiveEventId('');
    setChatHistories({});
    setCurrentView('home');
    try {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
      localStorage.removeItem(STORAGE_KEYS.CHATS);
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  };

  const handleLoadPresets = () => {
    setEvents(INITIAL_EVENTS);
    const firstId = Object.keys(INITIAL_EVENTS)[0] || '';
    setActiveEventId(firstId);
    setChatHistories({
      'udaipur-sangeet': [
        {
          id: 'msg-seed-1',
          role: 'assistant',
          content: `Welcome to shubharambh. I am synced with the **Udaipur Sangeet & Royal Wedding** ledger (₹15,00,000 budget cap, 280 guests).\n\nAsk me for aesthetic decor ideas, catering plate leakage audits, or sudden budget shocks (e.g., *"Guest count just went up by 50, and budget dropped by 10%"*).`,
          timestamp: 'Ready',
          isAnomaly: false,
        },
      ],
    });
    setCurrentView('home');
  };

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    if (!currentEvent) return;
    setEvents((prev) => {
      const ev = prev[currentEvent.id];
      if (!ev) return prev;
      const updatedTasks = ev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, [currentEvent.id]: { ...ev, tasks: updatedTasks } };
    });
  };

  const handleAddTask = (taskData: Omit<HostTask, 'id'>) => {
    if (!currentEvent) return;
    const newTask: HostTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setEvents((prev) => {
      const ev = prev[currentEvent.id];
      if (!ev) return prev;
      return { ...prev, [currentEvent.id]: { ...ev, tasks: [...ev.tasks, newTask] } };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentEvent) return;
    setEvents((prev) => {
      const ev = prev[currentEvent.id];
      if (!ev) return prev;
      return {
        ...prev,
        [currentEvent.id]: { ...ev, tasks: ev.tasks.filter((t) => t.id !== taskId) },
      };
    });
  };

  // Vendor handlers (Single Cost Tally!)
  const handleAddVendor = (vendorData: Omit<HostVendor, 'id'>) => {
    if (!currentEvent) return;
    const newVendor: HostVendor = {
      ...vendorData,
      id: `v-${Date.now()}`,
    };
    setEvents((prev) => {
      const ev = prev[currentEvent.id];
      if (!ev) return prev;
      return {
        ...prev,
        [currentEvent.id]: { ...ev, vendors: [...ev.vendors, newVendor] },
      };
    });
  };

  const handleUpdateVendor = (updatedVendor: HostVendor) => {
    if (!currentEvent) return;
    setEvents((prev) => {
      const ev = prev[currentEvent.id];
      if (!ev) return prev;
      const updatedVendors = ev.vendors.map((v) =>
        v.id === updatedVendor.id ? updatedVendor : v
      );
      return {
        ...prev,
        [currentEvent.id]: { ...ev, vendors: updatedVendors },
      };
    });
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!currentEvent) return;
    setEvents((prev) => {
      const ev = prev[currentEvent.id];
      if (!ev) return prev;
      return {
        ...prev,
        [currentEvent.id]: {
          ...ev,
          vendors: ev.vendors.filter((v) => v.id !== vendorId),
        },
      };
    });
  };

  // AI Assistant Chat & Anomaly Handler
  const handleSendMessage = async (text: string) => {
    if (!currentEvent) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const targetEventId = currentEvent.id;

    // Append user message immediately
    setChatHistories((prev) => ({
      ...prev,
      [targetEventId]: [...(prev[targetEventId] || []), userMsg],
    }));

    setIsLoadingAssistant(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          eventState: currentEvent,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAnomaly: Boolean(data.isAnomaly),
        anomalyData: data.anomalyData || null,
        applied: false,
      };

      setChatHistories((prev) => ({
        ...prev,
        [targetEventId]: [...(prev[targetEventId] || []), assistantMsg],
      }));
    } catch (err) {
      console.warn('API error, executing client deterministic engine:', err);
      const fallback = processAssistantOffline(text, currentEvent);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAnomaly: fallback.isAnomaly,
        anomalyData: fallback.anomalyData || null,
        applied: false,
      };

      setChatHistories((prev) => ({
        ...prev,
        [targetEventId]: [...(prev[targetEventId] || []), assistantMsg],
      }));
    } finally {
      setIsLoadingAssistant(false);
    }
  };

  const handleClearChat = () => {
    if (!currentEvent) return;
    setChatHistories((prev) => ({
      ...prev,
      [currentEvent.id]: [],
    }));
  };

  // Apply Anomaly Changes to Vendors & Budget (Single Cost Tally)
  const handleApplyChanges = (messageId: string, anomalyData: AnomalyData) => {
    if (!currentEvent) return;
    const targetEventId = currentEvent.id;

    setEvents((prev) => {
      const ev = prev[targetEventId];
      if (!ev) return prev;

      const newBudget = Number(anomalyData.newBudgetCap) || ev.totalBudget;
      const newGuestCount = anomalyData.guestCountDelta
        ? Math.max(1, ev.guestCount + (Number(anomalyData.guestCountDelta) || 0))
        : ev.guestCount;

      const adjustmentsMap = new Map<string, number>();
      (anomalyData.vendorAdjustments || []).forEach((adj) => {
        const cutSafe = Math.max(0, Number(adj.newCost ?? adj.newActualCost) || 0);
        if (adj.vendorId) {
          adjustmentsMap.set(adj.vendorId, cutSafe);
        } else {
          const match = ev.vendors.find(
            (v) =>
              v.name.toLowerCase().includes(adj.name.toLowerCase()) ||
              (adj.category && v.category.toLowerCase().includes(adj.category.toLowerCase()))
          );
          if (match) {
            adjustmentsMap.set(match.id, cutSafe);
          }
        }
      });

      const updatedVendors = ev.vendors.map((vendor) => {
        if (adjustmentsMap.has(vendor.id)) {
          const newCost = adjustmentsMap.get(vendor.id)!;
          return {
            ...vendor,
            cost: newCost,
            actualCost: newCost,
            estimatedCost: newCost,
          };
        }
        return vendor;
      });

      return {
        ...prev,
        [targetEventId]: {
          ...ev,
          totalBudget: newBudget,
          guestCount: newGuestCount,
          vendors: updatedVendors,
        },
      };
    });

    setChatHistories((prev) => {
      const history = prev[targetEventId] || [];
      const updated = history.map((msg) =>
        msg.id === messageId ? { ...msg, applied: true } : msg
      );
      return { ...prev, [targetEventId]: updated };
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5A91A] font-sans flex flex-col selection:bg-[#E5A91A] selection:text-[#0A0A0A]">
      {/* 1. Header with SVG icon, brand, + button, and Menu button */}
      <Navbar
        events={Object.values(events)}
        activeEventId={activeEventId}
        onSelectEvent={handleSelectEvent}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      {/* 2. Main Executive Workspace Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 sm:pb-16">
        {hasEvents && currentEvent ? (
          <div>
            {/* View 1: Home Dashboard with Celebration Banner and 3 Shortcut Cards */}
            {currentView === 'home' && (
              <OverviewScreen
                event={currentEvent}
                onDeleteEvent={handleDeleteEvent}
                onNavigate={setCurrentView}
                onToggleTask={handleToggleTask}
                onSelectPrompt={(p) => {
                  setInitialAssistantPrompt(p);
                  setCurrentView('ai');
                }}
              />
            )}

            {/* View 2: The Budget & Vendors Page (Pure Single Cost Tally) */}
            {currentView === 'budget' && (
              <VendorsScreen
                vendors={currentEvent.vendors}
                totalBudget={currentEvent.totalBudget}
                onAddVendor={handleAddVendor}
                onUpdateVendor={handleUpdateVendor}
                onDeleteVendor={handleDeleteVendor}
                onNavigate={setCurrentView}
              />
            )}

            {/* View 3: The Checklist Page (Simple & Flat, No Timeline Blocks) */}
            {currentView === 'checklist' && (
              <TimelineScreen
                tasks={currentEvent.tasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onNavigate={setCurrentView}
              />
            )}

            {/* View 4: The AI Assistant Page */}
            {currentView === 'ai' && (
              <AssistantScreen
                event={currentEvent}
                chatHistory={currentChatHistory}
                onSendMessage={handleSendMessage}
                onApplyChanges={handleApplyChanges}
                onClearChat={handleClearChat}
                isLoading={isLoadingAssistant}
                onNavigate={setCurrentView}
                initialPrompt={initialAssistantPrompt}
              />
            )}

            {/* View 5: Dedicated Full-Page Menu & Celebrations View (Not a popup modal!) */}
            {currentView === 'menu' && (
              <MenuScreen
                events={Object.values(events)}
                activeEventId={activeEventId}
                onSelectEvent={handleSelectEvent}
                onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
                onDeleteEvent={handleDeleteEvent}
                onClearAllEvents={handleClearAllEvents}
                onNavigate={setCurrentView}
              />
            )}
          </div>
        ) : (
          /* Clean Landing Page when all events are deleted */
          <LandingPage
            onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
            onLoadPresets={handleLoadPresets}
          />
        )}
      </main>

      {/* 3. New Event Creator Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
}
