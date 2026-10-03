export function publicAssetPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = typeof window !== "undefined" && window.location.pathname.startsWith("/tempo-react") ? "/tempo-react" : "";
  return `${base}${normalized}`;
}
