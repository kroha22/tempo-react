// The static demo lives under /tempo-react/; the main app serves assets at /.
declare const __TEMPO_ASSET_BASE__: string;
export function publicAssetUrl(src: string): string {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  const base = typeof __TEMPO_ASSET_BASE__ === "undefined" ? "/" : __TEMPO_ASSET_BASE__;
  if(base!=="/"&&src.startsWith(base))return src;
  return `${base}${src.slice(1)}`;
}
