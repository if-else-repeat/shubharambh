import React from 'react';

interface MarkdownTextProps {
  content: string;
  isUser?: boolean;
}

/**
 * MarkdownText provides pure React formatting for markdown strings, supporting:
 * - Bold (**text**)
 * - Italics (*text*)
 * - Section headers (###, ##)
 * - Bullet lists (*, -, •)
 * - Numbered items (1., 2.)
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, isUser = false }) => {
  const lines = content.split('\n');

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

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className={`font-heading font-bold text-sm mt-2 mb-0.5 ${
                isUser ? 'text-[#0A0A0A]' : 'text-[#E5A91A]'
              }`}
            >
              {parseInline(trimmed.slice(4), idx)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className={`font-heading font-extrabold text-base mt-2.5 mb-1 ${
                isUser ? 'text-[#0A0A0A]' : 'text-[#E5A91A]'
              }`}
            >
              {parseInline(trimmed.slice(3), idx)}
            </h3>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletContent = trimmed.replace(/^(\*|-|•)\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5">
              <span
                className={
                  isUser
                    ? 'text-[#0A0A0A] shrink-0 font-bold mt-0.5'
                    : 'text-[#C41E3A] shrink-0 font-bold mt-0.5'
                }
              >
                •
              </span>
              <div className="flex-1 min-w-0">{parseInline(bulletContent, idx)}</div>
            </div>
          );
        }

        const numberMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5">
              <span
                className={
                  isUser
                    ? 'font-bold text-[#0A0A0A] shrink-0'
                    : 'font-bold text-[#E5A91A] shrink-0'
                }
              >
                {numberMatch[1]}
              </span>
              <div className="flex-1 min-w-0">{parseInline(numberMatch[2], idx)}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="my-0.5 leading-relaxed">
            {parseInline(trimmed, idx)}
          </p>
        );
      })}
    </div>
  );
};
