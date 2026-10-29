import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HostEvent, ChatMessage, AnomalyData, AppView, getVendorCost } from '../../types/host.ts';
import { ScreenHeaderNav } from '../common/ScreenHeaderNav.tsx';
import { ChatMessageBubble } from '../assistant/ChatMessageBubble.tsx';
import { QuickPromptChips } from '../assistant/QuickPromptChips.tsx';
import { formatRupees } from '../../utils/sanitize.ts';

interface AssistantScreenProps {
  event: HostEvent;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onApplyChanges: (messageId: string, anomalyData: AnomalyData) => void;
  onClearChat?: () => void;
  isLoading: boolean;
  onNavigate?: (view: AppView) => void;
  initialPrompt?: string;
}

/**
 * AssistantScreen connects the host to the GenAI Celebration Strategist & Anomaly Solver.
 */
export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  event,
  chatHistory,
  onSendMessage,
  onApplyChanges,
  onClearChat,
  isLoading,
  onNavigate,
  initialPrompt,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInputValue(initialPrompt);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const msg = inputValue.trim();
    setInputValue('');
    onSendMessage(msg);
  };

  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Dynamic prompts derived from the active celebration's exact parameters
  const suggestedPrompts = useMemo(() => {
    const cateringVendor = event.vendors.find((v) => v.category === 'Catering');
    const decorVendor = event.vendors.find((v) => v.category === 'Decor');
    const decorCost = decorVendor
      ? getVendorCost(decorVendor)
      : Math.round(event.totalBudget * 0.15);
    const tenPercentCut = Math.round(event.totalBudget * 0.1);

    return [
      `Guest count for ${event.name} surged by 40 and budget dropped by 10%. Calculate cuts.`,
      `Give me 3 minimal aesthetic floral concepts for ${event.name} within ${formatRupees(decorCost)}.`,
      `Audit catering contract with ${cateringVendor ? cateringVendor.name : 'the caterer'} for ${event.guestCount} guests to prevent plate leakage.`,
      `Recommend 3 practical areas to save ${formatRupees(tenPercentCut)} without hurting guest hospitality for ${event.name}.`,
    ];
  }, [event]);

  return (
    <div className="space-y-6">
      {onNavigate && <ScreenHeaderNav currentView="ai" onNavigate={onNavigate} />}

      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg overflow-hidden shadow-sm">
        {/* Header bar */}
        <div className="px-5 py-4 border-b border-[#E5A91A]/20 bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#C41E3A]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-lg sm:text-xl text-[#E5A91A] tracking-tight">
                  GenAI Assistant
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C41E3A] text-[#0A0A0A]">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs font-medium text-[#E5A91A]/70">
                Contextualized for <span className="underline font-semibold text-[#E5A91A]">{event.name}</span> • Personalized ideas & anomaly rebalancing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-[#E5A91A]/80">
            <span className="bg-[#E5A91A]/10 text-[#E5A91A] px-2 py-0.5 rounded border border-[#E5A91A]/30">
              {formatRupees(event.totalBudget)} cap
            </span>
            <span>•</span>
            <span>{event.guestCount} guests</span>
            {onClearChat && chatHistory.length > 0 && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onClearChat}
                  className="text-xs font-bold text-[#C41E3A] hover:underline cursor-pointer"
                  title="Clear conversation history for this celebration"
                >
                  Clear History
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Suggested Prompts */}
        <QuickPromptChips
          eventName={event.name}
          prompts={suggestedPrompts}
          onSelectPrompt={handlePromptClick}
        />

        {/* Chat Messages Stream */}
        <div className="p-5 sm:p-6 space-y-5">
          {chatHistory.length === 0 ? (
            <div className="py-8 text-center max-w-md mx-auto text-[#E5A91A]">
              <div className="w-12 h-12 rounded-full bg-[#E5A91A]/10 border border-[#E5A91A] flex items-center justify-center mx-auto mb-3 font-heading font-extrabold text-xl text-[#E5A91A]">
                AI
              </div>
              <h3 className="font-heading font-bold text-base text-[#E5A91A]">
                Ask Gemini for {event.name} Ideas or Anomaly Solutions
              </h3>
              <p className="text-xs text-[#E5A91A]/70 mt-1 leading-relaxed">
                Click any prompt above to pre-fill your message box, or type freely below to rebalance budgets, inspect vendor contracts, and resolve headcount surges.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                onApplyChanges={onApplyChanges}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#E5A91A] py-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C41E3A] animate-pulse" />
              <span>Gemini is computing plan optimizations for {event.name}...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#E5A91A]/20 bg-[#0A0A0A] flex items-center gap-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={`Ask a question or describe an anomaly for ${event.name}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm px-4 py-3 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/40 focus:outline-none focus:border-[#E5A91A]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-5 py-3 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] disabled:opacity-40 text-[#0A0A0A] border border-[#E5A91A] text-sm font-bold rounded transition-colors cursor-pointer select-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
