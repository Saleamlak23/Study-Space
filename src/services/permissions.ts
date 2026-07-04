export async function verifyPermission(handle: FileSystemHandle, mode: 'read' | 'readwrite' = 'readwrite') {
  const options = { mode };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
}

export function supportsDirectoryPicker() {
  return typeof window.showDirectoryPicker === 'function';
}
