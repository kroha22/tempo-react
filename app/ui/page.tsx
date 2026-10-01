import { AppShell } from "@/features/app-shell/AppShell";
import { parseCatalogState } from "@/features/ui-catalog/catalog-states";
import { UiCatalog } from "@/features/ui-catalog/UiCatalog";

export default async function UiPage({ searchParams }: { searchParams: Promise<{ state?: string | string[] }> }) {
  const query = await searchParams;
  return <AppShell current="learning"><UiCatalog state={parseCatalogState(query.state)} /></AppShell>;
}
