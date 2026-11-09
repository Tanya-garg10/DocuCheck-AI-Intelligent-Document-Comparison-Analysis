import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown:
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - `code` -> <code>
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  // Regex matches:
  // 1: **bold**
  // 2: *italic* or _italic_
  // 3: `code`
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      nodes.push(
        <strong key={`b_${match.index}`} className="font-bold text-inherit">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      nodes.push(
        <em key={`i_${match.index}`} className="italic text-inherit">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // _italic_
      nodes.push(
        <em key={`u_${match.index}`} className="italic text-inherit">
          {match[6]}
        </em>
      );
    } else if (match[7]) {
      // `code`
      nodes.push(
        <code
          key={`c_${match.index}`}
          className="font-mono text-[0.88em] px-1 py-0.5 rounded bg-black/5 font-medium"
        >
          {match[8]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Trailing text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by paragraphs or lines
  const lines = content.split('\n');

  // Group lines into bullet lists or standard lines
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = (keyPrefix: number) => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul_${keyPrefix}`} className="list-disc list-inside space-y-1 my-1.5 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol_${keyPrefix}`} className="list-decimal list-inside space-y-1 my-1.5 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for bullet list item: "- " or "* "
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList(idx);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(parseInlineFormatting(bulletMatch[1]));
      return;
    }

    // Check for numbered list item: "1. ", "2. "
    const numberMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList(idx);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(parseInlineFormatting(numberMatch[1]));
      return;
    }

    // Not a list item
    flushList(idx);

    if (trimmed === '') {
      // Empty line -> vertical space
      elements.push(<div key={`sp_${idx}`} className="h-1.5" />);
    } else {
      elements.push(
        <div key={`p_${idx}`} className="leading-relaxed">
          {parseInlineFormatting(line)}
        </div>
      );
    }
  });

  flushList(lines.length);

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
