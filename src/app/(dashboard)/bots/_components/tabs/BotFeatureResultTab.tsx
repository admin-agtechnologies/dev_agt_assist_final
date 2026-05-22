"use client";
// src/app/(dashboard)/bots/_components/tabs/BotFeatureResultTab.tsx
// Tab résultats dynamique par feature — filtre par bot_id.
// Réutilise ResultListTab + ResultsEmptyState de /results.

import { useMemo }                  from "react";
import { useLanguage }              from "@/contexts/LanguageContext";
import { ResultListTab }            from "@/app/(dashboard)/results/_components/ResultListTab";
import type { FeatureTabDef }       from "../bots.types";

interface Props {
  def:    FeatureTabDef;
  botId:  string;
}

export function BotFeatureResultTab({ def, botId }: Props) {
  const { locale } = useLanguage();

  // Fetcher wrappé avec bot_id
  const fetcher = useMemo(
    () => (params: { page: number; page_size: number }) =>
      def.fetcher({ ...params, bot_id: botId }),
    [def, botId],
  );

  return (
    <ResultListTab
      key={`${def.slug}-${botId}`}
      cacheKey={`${def.slug}:${botId}`}
      fetcher={fetcher}
      renderCard={(item) => <def.ResultCard item={item} />}
      emptyMessage={def.emptyMessage[locale]}
      emptyHint={def.emptyHint[locale]}
    />
  );
}