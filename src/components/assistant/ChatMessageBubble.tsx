import React from 'react';
import { ChatMessage, AnomalyData } from '../../types/host.ts';
import { MarkdownText } from '../common/MarkdownText.tsx';
import { AnomalyActionCard } from './AnomalyActionCard.tsx';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onApplyChanges: (messageId: string, anomalyData: AnomalyData) => void;
}

/**
 * ChatMessageBubble renders an individual chat message, applying distinct styling
 * for host versus AI messages and attaching the anomaly action card when present.
 */
export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onApplyChanges,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[92%] sm:max-w-[85%] rounded-lg p-4 text-sm leading-relaxed border ${
          isUser
            ? 'bg-[#E5A91A] text-[#0A0A0A] border-[#E5A91A] font-semibold'
            : 'bg-[#0A0A0A] text-[#E5A91A] border-[#E5A91A]/40 font-normal'
        }`}
      >
        <MarkdownText content={message.content} isUser={isUser} />

        {!isUser && message.isAnomaly && message.anomalyData && (
          <AnomalyActionCard
            messageId={message.id}
            anomalyData={message.anomalyData}
            applied={message.applied}
            onApplyChanges={onApplyChanges}
          />
        )}
      </div>

      <span className="text-[10px] font-medium text-[#E5A91A]/50 mt-1 px-1">
        {message.timestamp}
      </span>
    </div>
  );
};
