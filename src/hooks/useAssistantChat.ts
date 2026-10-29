import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, HostEvent } from '../types/host.ts';
import { processAssistantOffline } from '../services/assistantEngine.ts';

const CHAT_STORAGE_KEY = 'shubharambh_chats_v6';

const INITIAL_SEED_CHATS: Record<string, ChatMessage[]> = {
  'udaipur-sangeet': [
    {
      id: 'msg-seed-1',
      role: 'assistant',
      content:
        'Welcome to shubharambh. I am synced with the **Udaipur Sangeet & Royal Wedding** ledger (₹15,00,000 budget cap, 280 guests).\n\nAsk me for aesthetic decor ideas, catering plate leakage audits, or sudden budget shocks (e.g., *"Guest count just went up by 50, and budget dropped by 10%"*).',
      timestamp: 'Ready',
      isAnomaly: false,
    },
  ],
};

export function useAssistantChat() {
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const savedChats = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // Graceful fallback
    }
    return {};
  });

  const [isLoadingAssistant, setIsLoadingAssistant] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistories));
    } catch {
      // Storage quota or restriction protection
    }
  }, [chatHistories]);

  const handleSendMessage = useCallback(async (text: string, currentEvent: HostEvent | null) => {
    if (!currentEvent) return;
    const targetEventId = currentEvent.id;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp,
    };

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
    } catch {
      // Deterministic offline engine fallback
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
  }, []);

  const handleClearChat = useCallback((eventId: string) => {
    setChatHistories((prev) => ({
      ...prev,
      [eventId]: [],
    }));
  }, []);

  const handleMarkAnomalyApplied = useCallback((eventId: string, messageId: string) => {
    setChatHistories((prev) => {
      const history = prev[eventId] || [];
      const updated = history.map((msg) =>
        msg.id === messageId ? { ...msg, applied: true } : msg
      );
      return { ...prev, [eventId]: updated };
    });
  }, []);

  const handleDeleteEventChat = useCallback((eventId: string) => {
    setChatHistories((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  }, []);

  const handleClearAllChats = useCallback(() => {
    setChatHistories({});
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Handled silently
    }
  }, []);

  const handleSeedPresetChats = useCallback(() => {
    setChatHistories(INITIAL_SEED_CHATS);
  }, []);

  return {
    chatHistories,
    isLoadingAssistant,
    handleSendMessage,
    handleClearChat,
    handleMarkAnomalyApplied,
    handleDeleteEventChat,
    handleClearAllChats,
    handleSeedPresetChats,
  };
}
