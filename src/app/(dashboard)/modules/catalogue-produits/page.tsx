"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { ModuleHubTemplate } from "@/components/modules/ModuleHubTemplate";
import { getHubByPath } from "@/lib/hub-modules";

const MODULE = getHubByPath("catalogue-produits")!;

export default function CatalogueProduitsPage() {
  const [items,   setItems]   = useState<Record<string, unknown>[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get(MODULE.apiEndpoint)
      .then((d: unknown) => {
        const r = d as { results?: Record<string, unknown>[]; count?: number } | Record<string, unknown>[];
        if (Array.isArray(r)) { setItems(r); setTotal(r.length); }
        else if ("results" in r && r.results) { setItems(r.results); setTotal(r.count ?? r.results.length); }
      })
      .catch(() => { setItems([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <ModuleHubTemplate
      module={MODULE}
      items={items}
      total={total}
      loading={loading}
      onRefresh={load}
      onAdd={() => { /* TODO: formulaire ajout produit */ }}
    />
  );
}