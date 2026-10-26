import React, { useState, useRef, useEffect } from 'react';
import { HostEvent, ChatMessage, AnomalyData, AppView, getVendorCost } from '../../types/host.ts';

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

const renderFormattedText = (text: string, isUser: boolean) => {
  const lines = text.split('\n');

  const parseInline = (lineText: string, lineKey: string | number) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(lineText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(lineText.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        const inner = token.slice(2, -2);
        parts.push(
          <strong
            key={`${lineKey}-b-${match.index}`}
            className={isUser ? 'font-extrabold text-[#0A0A0A]' : 'font-bold text-[#E5A91A]'}
          >
            {inner}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        const inner = token.slice(1, -1);
        parts.push(
          <em key={`${lineKey}-i-${match.index}`} className="italic">
            {inner}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < lineText.length) {
      parts.push(lineText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : lineText;
  };

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={idx} className="h-1.5" />;
    }

    // Markdown headers ### or ##
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className={`font-heading font-bold text-sm mt-2 mb-0.5 ${isUser ? 'text-[#0A0A0A]' : 'text-[#E5A91A]'}`}>
          {parseInline(trimmed.slice(4), idx)}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className={`font-heading font-extrabold text-base mt-2.5 mb-1 ${isUser ? 'text-[#0A0A0A]' : 'text-[#E5A91A]'}`}>
          {parseInline(trimmed.slice(3), idx)}
        </h3>
      );
    }

    // Bullet points starting with "* ", "- ", "• "
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const bulletContent = trimmed.replace(/^(\*|-|•)\s+/, '');
      return (
        <div key={idx} className="flex items-start gap-2 my-0.5">
          <span className={isUser ? 'text-[#0A0A0A] shrink-0 font-bold mt-0.5' : 'text-[#C41E3A] shrink-0 font-bold mt-0.5'}>
            •
          </span>
          <div className="flex-1 min-w-0">
            {parseInline(bulletContent, idx)}
          </div>
        </div>
      );
    }

    // Numbered lists e.g. "1. " or "2) "
    const numberMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
    if (numberMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 my-0.5">
          <span className={isUser ? 'font-bold text-[#0A0A0A] shrink-0' : 'font-bold text-[#E5A91A] shrink-0'}>
            {numberMatch[1]}
          </span>
          <div className="flex-1 min-w-0">
            {parseInline(numberMatch[2], idx)}
          </div>
        </div>
      );
    }

    // Regular paragraph line
    return (
      <p key={idx} className="my-0.5 leading-relaxed">
        {parseInline(line, idx)}
      </p>
    );
  });
};

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

  // Dynamic prompts derived from the active celebration's exact details
  const cateringVendor = event.vendors.find((v) => v.category === 'Catering');
  const decorVendor = event.vendors.find((v) => v.category === 'Decor');
  const decorCost = decorVendor ? getVendorCost(decorVendor) : Math.round(event.totalBudget * 0.15);
  const tenPercentCut = Math.round(event.totalBudget * 0.1);

  const suggestedPrompts = [
    `Guest count for ${event.name} surged by 40 and budget dropped by 10%. Calculate cuts.`,
    `Give me 3 minimal aesthetic floral concepts for ${event.name} within ₹${decorCost.toLocaleString('en-IN')}.`,
    `Audit catering contract with ${cateringVendor ? cateringVendor.name : 'the caterer'} for ${event.guestCount} guests to prevent plate leakage.`,
    `Recommend 3 practical areas to save ₹${tenPercentCut.toLocaleString('en-IN')} without hurting guest hospitality for ${event.name}.`,
  ];

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
              onClick={() => onNavigate('checklist')}
              className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#E5A91A]/40 text-[#E5A91A] hover:border-[#E5A91A] hover:bg-[#E5A91A]/10 transition-colors cursor-pointer"
            >
              Timelines & Checklist
            </button>
          </div>
        </div>
      )}

      {/* Assistant Card */}
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
              ₹{event.totalBudget.toLocaleString('en-IN')} cap
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

        {/* Dynamic Suggested Prompts Strip */}
        <div className="px-5 py-3 bg-[#0A0A0A] border-b border-[#E5A91A]/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5A91A]/70 block mb-2">
            Suggested Prompts for {event.name} (Click to edit in message box)
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(p)}
                className="text-xs text-left px-3 py-1.5 bg-[#0A0A0A] text-[#E5A91A] hover:bg-[#E5A91A] hover:text-[#0A0A0A] border border-[#E5A91A]/40 rounded font-medium transition-colors cursor-pointer select-none"
                title="Click to populate message box"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>

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
            chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-lg p-4 text-sm leading-relaxed border ${
                      isUser
                        ? 'bg-[#E5A91A] text-[#0A0A0A] border-[#E5A91A] font-semibold'
                        : 'bg-[#0A0A0A] text-[#E5A91A] border-[#E5A91A]/40 font-normal'
                    }`}
                  >
                    <div className="text-sm">
                      {renderFormattedText(msg.content, isUser)}
                    </div>

                    {/* Anomaly Action Box & Apply Changes Button */}
                    {!isUser && msg.isAnomaly && msg.anomalyData && (
                      <div className="mt-4 pt-3 border-t border-[#E5A91A]/30 space-y-3">
                        <div className="bg-[#E5A91A]/10 border border-[#E5A91A]/30 rounded p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[#E5A91A] font-bold">
                            <span>Calculated Budget Deficit:</span>
                            <span className="font-heading font-bold text-[#C41E3A] text-sm">
                              ₹{msg.anomalyData.calculatedDeficit.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {msg.anomalyData.newBudgetCap && (
                            <div className="flex items-center justify-between text-[#E5A91A] font-semibold">
                              <span>Recommended New Budget Cap:</span>
                              <span className="font-heading font-bold text-[#E5A91A]">
                                ₹{msg.anomalyData.newBudgetCap.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                          {msg.anomalyData.vendorAdjustments &&
                            msg.anomalyData.vendorAdjustments.length > 0 && (
                              <div className="pt-2 border-t border-[#E5A91A]/20 space-y-1.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5A91A] block">
                                  Proposed Vendor Cost Reductions:
                                </span>
                                {msg.anomalyData.vendorAdjustments.map((adj, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center text-xs text-[#E5A91A]"
                                  >
                                    <span className="font-medium">{adj.name}</span>
                                    <span className="font-bold text-[#C41E3A]">
                                      -₹{adj.cutAmount.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* Apply Changes Button */}
                        <div>
                          {msg.applied ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E5A91A] border border-[#E5A91A] text-[#0A0A0A] text-xs font-bold rounded">
                              Budget adjustments applied to Vendors
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onApplyChanges(msg.id, msg.anomalyData!)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C41E3A] hover:bg-[#A3162C] text-[#0A0A0A] text-xs font-bold rounded border border-[#C41E3A] transition-colors cursor-pointer select-none"
                            >
                              Apply Changes to Budget
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-[#E5A91A]/50 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })
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
