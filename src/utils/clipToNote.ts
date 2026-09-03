export function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildClipHtml(text: string, sourceName?: string) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const body = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  const source = sourceName
    ? `<p><em>Clipped from ${escapeHtml(sourceName)}</em></p>`
    : '';
  return `<blockquote>${body}${source}</blockquote><p></p>`;
}
