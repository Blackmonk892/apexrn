export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`rule ${className}`.trim()} />;
}
