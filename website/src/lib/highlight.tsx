import React from "react";

/**
 * Minimal line tokenizer for the code-block specimens — enough to differentiate
 * keywords / JSX tags / strings without pulling in a syntax-highlighting dependency.
 */
const TOKEN_RE = /(\/\/.*$)|('.*?'|".*?")|(<\/?[A-Za-z][\w.]*)|(\b(?:import|from|export|default|function|return|const|useState)\b)/g;

export function highlightLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = TOKEN_RE.exec(line))) {
    if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
    const [full, comment, str, tag, keyword] = match;
    if (comment) parts.push(<span key={key++} className="text-[var(--fg-muted)]">{comment}</span>);
    else if (str) parts.push(<span key={key++} style={{ color: "var(--signal)" }}>{str}</span>);
    else if (tag) parts.push(<span key={key++} style={{ color: "var(--coral)" }}>{tag}</span>);
    else if (keyword) parts.push(<span key={key++} style={{ color: "var(--cobalt)" }}>{keyword}</span>);
    else parts.push(full);
    lastIndex = match.index + full.length;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts.length ? parts : line;
}
