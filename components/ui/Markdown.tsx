import { Fragment, ReactNode } from "react";

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(regex)) {
    if (match.index! > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={key}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<strong key={key}>{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={key}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(<code key={key} className="bg-surface-container-high px-1.5 py-0.5 rounded-md text-sm font-mono">{match[5]}</code>);
    } else if (match[6] && match[7]) {
      parts.push(<a key={key} href={match[7]} target="_blank" rel="noopener noreferrer" className="text-primary underline">{match[6]}</a>);
    }

    lastIndex = match.index! + match[0].length;
    key++;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const code = block.slice(3, -3);
          const langMatch = code.match(/^(\w+)\n/);
          const lang = langMatch ? langMatch[1] : '';
          const codeContent = langMatch ? code.slice(langMatch[0].length) : code;

          return (
            <pre key={i} className="bg-surface-container-high rounded-xl p-4 my-2 overflow-x-auto text-sm font-mono leading-relaxed">
              {lang && (
                <div className="text-xs text-on-surface-variant mb-2 font-sans font-semibold uppercase tracking-wide">{lang}</div>
              )}
              <code>{codeContent}</code>
            </pre>
          );
        }

        const lines = block.split('\n');
        return (
          <Fragment key={i}>
            {lines.map((line, j) => {
              if (!line.trim()) {
                return <br key={`${i}-${j}`} className="my-1" />;
              }

              const listMatch = line.match(/^(\s*)[-*]\s+(.*)/);
              if (listMatch) {
                return (
                  <div key={`${i}-${j}`} className="flex gap-2 ml-4">
                    <span className="text-on-surface-variant select-none">•</span>
                    <span>{parseInline(listMatch[2])}</span>
                  </div>
                );
              }

              return <div key={`${i}-${j}`}>{parseInline(line)}</div>;
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
