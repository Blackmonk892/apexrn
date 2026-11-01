import React from "react";

/**
 * Minimal line tokenizer. Ink-only: keywords are bold, comments muted, strings underlined,
 * so the page stays one colour and code never competes with the accent.
 */
const TOKEN_RE = /(\/\/.*$)|('.*?'|".*?")|(<\/?[A-Za-z][\w.]*)|(\b(?:import|from|export|default|function|return|const|useState)\b)/g;

export function highlightLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(line))) {
    if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
    const [full, comment, str, tag, keyword] = match;
    if (comment) parts.push(<span key={key++} className="tok-com">{comment}</span>);
    else if (str) parts.push(<span key={key++} className="tok-str">{str}</span>);
    else if (tag || keyword) parts.push(<span key={key++} className="tok-kw">{full}</span>);
    else parts.push(full);
    lastIndex = match.index + full.length;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts.length ? parts : line;
}
