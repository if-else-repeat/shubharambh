import { useState, useCallback } from 'react';
import { AnomalyData, AppView } from './types/host.ts';
import { Navbar } from './components/Navbar.tsx';
import { OverviewScreen } from './components/screens/OverviewScreen.tsx';
import { VendorsScreen } from './components/screens/VendorsScreen.tsx';
import { TimelineScreen } from './components/screens/TimelineScreen.tsx';
import { AssistantScreen } from './components/screens/AssistantScreen.tsx';
import { MenuScreen } from './components/screens/MenuScreen.tsx';
import { NewEventModal } from './components/NewEventModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { useCelebrationEvents } from './hooks/useCelebrationEvents.ts';
import { useAssistantChat } from './hooks/useAssistantChat.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string>('');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  const {
    events,
    activeEventId,
    currentEvent,
    hasEvents,
    handleSelectEvent,
    handleCreateEvent,
    handleDeleteEvent: removeCelebrationEvent,
    handleClearAllEvents: clearAllCelebrationEvents,
    handleLoadPresets: loadCelebrationPresets,
    handleToggleTask,
    handleAddTask,
    handleDeleteTask,
    handleAddVendor,
    handleUpdateVendor,
    handleDeleteVendor,
    handleApplyAnomalyAdjustments,
  } = useCelebrationEvents();

  const {
    chatHistories,
    isLoadingAssistant,
    handleSendMessage: sendChatMessage,
    handleClearChat,
    handleMarkAnomalyApplied,
    handleDeleteEventChat,
    handleClearAllChats,
    handleSeedPresetChats,
  } = useAssistantChat();

  const currentChatHistory = currentEvent ? chatHistories[currentEvent.id] || [] : [];

  const handleDeleteEvent = useCallback(
    (eventIdToDelete: string) => {
      removeCelebrationEvent(eventIdToDelete);
      handleDeleteEventChat(eventIdToDelete);
      setCurrentView('home');
    },
    [removeCelebrationEvent, handleDeleteEventChat]
  );

  const handleClearAll = useCallback(() => {
    clearAllCelebrationEvents();
    handleClearAllChats();
    setCurrentView('home');
  }, [clearAllCelebrationEvents, handleClearAllChats]);

  const handleLoadPresets = useCallback(() => {
    loadCelebrationPresets();
    handleSeedPresetChats();
    setCurrentView('home');
  }, [loadCelebrationPresets, handleSeedPresetChats]);

  const handleApplyChanges = useCallback(
    (messageId: string, anomalyData: AnomalyData) => {
      if (!currentEvent) return;
      handleApplyAnomalyAdjustments(currentEvent.id, anomalyData);
      handleMarkAnomalyApplied(currentEvent.id, messageId);
    },
    [currentEvent, handleApplyAnomalyAdjustments, handleMarkAnomalyApplied]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      return sendChatMessage(text, currentEvent);
    },
    [sendChatMessage, currentEvent]
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5A91A] font-sans flex flex-col selection:bg-[#E5A91A] selection:text-[#0A0A0A]">
      <Navbar
        events={Object.values(events)}
        activeEventId={activeEventId}
        onSelectEvent={handleSelectEvent}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 sm:pb-16">
        {hasEvents && currentEvent ? (
          <div>
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

            {currentView === 'checklist' && (
              <TimelineScreen
                tasks={currentEvent.tasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'ai' && (
              <AssistantScreen
                event={currentEvent}
                chatHistory={currentChatHistory}
                onSendMessage={handleSendMessage}
                onApplyChanges={handleApplyChanges}
                onClearChat={() => handleClearChat(currentEvent.id)}
                isLoading={isLoadingAssistant}
                onNavigate={setCurrentView}
                initialPrompt={initialAssistantPrompt}
              />
            )}

            {currentView === 'menu' && (
              <MenuScreen
                events={Object.values(events)}
                activeEventId={activeEventId}
                onSelectEvent={handleSelectEvent}
                onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
                onDeleteEvent={handleDeleteEvent}
                onClearAllEvents={handleClearAll}
                onNavigate={setCurrentView}
              />
            )}
          </div>
        ) : (
          <LandingPage
            onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
            onLoadPresets={handleLoadPresets}
          />
        )}
      </main>

      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateEvent={(newEvent) => {
          handleCreateEvent(newEvent);
          setCurrentView('home');
        }}
      />
    </div>
  );
}
