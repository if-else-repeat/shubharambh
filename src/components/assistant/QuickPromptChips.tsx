import React from 'react';

interface QuickPromptChipsProps {
  eventName: string;
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

/**
 * QuickPromptChips renders one-click suggested prompt chips tailored to the active celebration.
 */
export const QuickPromptChips: React.FC<QuickPromptChipsProps> = ({
  eventName,
  prompts,
  onSelectPrompt,
}) => {
  return (
    <div className="px-5 py-3 bg-[#0A0A0A] border-b border-[#E5A91A]/20">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5A91A]/70 block mb-2">
        Suggested Prompts for {eventName} (Click to edit in message box)
      </span>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(p)}
            className="text-xs text-left px-3 py-1.5 bg-[#0A0A0A] text-[#E5A91A] hover:bg-[#E5A91A] hover:text-[#0A0A0A] border border-[#E5A91A]/40 rounded font-medium transition-colors cursor-pointer select-none"
            title="Click to populate message box"
          >
            + {p}
          </button>
        ))}
      </div>
    </div>
  );
};
