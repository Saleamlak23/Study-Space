export function TextPreview({ text }: { text: string }) {
  return (
    <pre className="h-full overflow-auto whitespace-pre-wrap bg-white p-5 font-mono text-sm leading-6 text-slate-800">
      {text}
    </pre>
  );
}
