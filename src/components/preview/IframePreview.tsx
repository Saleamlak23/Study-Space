export function IframePreview({ url, title }: { url: string; title: string }) {
  return <iframe src={url} title={title} className="h-full w-full border-0 bg-white" />;
}
