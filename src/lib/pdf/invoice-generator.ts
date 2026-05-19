// src/lib/pdf/invoice-generator.ts
// C7 — Génération PDF côté client uniquement (jsPDF + jspdf-autotable)
// Deux exports :
//   generateInvoicePDF()       → facture d'une transaction
//   generateBillingReportPDF() → bilan d'une période

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction }      from "@/types/api/billing.types";
import type { PurchaseMetadata } from "@/types/api/billing.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-CM", {
    style:                 "currency",
    currency:              "XAF",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day:    "2-digit",
    month:  "long",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function header(doc: jsPDF, title: string, entrepriseName: string) {
  // Bandeau titre
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("AGT Platform", 14, 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 17);

  // Infos entreprise
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.text(entrepriseName, 196, 10, { align: "right" });
  doc.text(`Généré le ${fmtDate(new Date().toISOString())}`, 196, 17, { align: "right" });
}

function footer(doc: jsPDF) {
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      "AGT Platform — Document généré automatiquement, non contractuel.",
      14,
      290,
    );
    doc.text(`Page ${i}/${pageCount}`, 196, 290, { align: "right" });
  }
}

// ── Export 1 : Facture par transaction ────────────────────────────────────────

export function generateInvoicePDF(
  transaction: Transaction,
  entrepriseName: string,
): void {
  const doc      = new jsPDF();
  const meta     = transaction.metadata as PurchaseMetadata | Record<string, never> | null;
  const hasDetail = meta && "plan" in meta && meta.plan;

  header(doc, "Facture de transaction", entrepriseName);

  // ── Bloc référence ──────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Détail de la transaction", 14, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Référence :`,        14, 42);
  doc.text(transaction.reference ?? "—", 50, 42);
  doc.text(`Date :`,             14, 48);
  doc.text(fmtDate(transaction.created_at), 50, 48);
  doc.text(`Statut :`,           14, 54);
  doc.text(transaction.status_display ?? transaction.status, 50, 54);
  doc.text(`Description :`,      14, 60);
  doc.text(transaction.label ?? "—", 50, 60);

  // ── Tableau détaillé (si metadata C5 disponible) ───────────────────────────
  if (hasDetail) {
    const pm = meta as PurchaseMetadata;

    // Ligne plan
    const rows: string[][] = [];
    rows.push([
      `Plan ${pm.plan.nom}`,
      "1",
      fmt(parseFloat(pm.plan_prix)),
      fmt(parseFloat(pm.plan_prix)),
    ]);

    // Lignes modules inclus
    for (const m of pm.modules_inclus ?? []) {
      rows.push([
        `${m.nom_fr} (inclus plan)`,
        String(m.quantite),
        "Inclus",
        "Inclus",
      ]);
    }

    // Lignes modules achetés
    for (const m of pm.modules_actives ?? []) {
      rows.push([
        m.nom_fr,
        String(m.quantite),
        fmt(parseFloat(m.prix_ligne) / m.quantite),
        fmt(parseFloat(m.prix_ligne)),
      ]);
    }

    autoTable(doc, {
      startY:     72,
      head:       [["Description", "Qté", "Prix unitaire", "Total"]],
      body:       rows,
      theme:      "striped",
      headStyles: { fillColor: [30, 30, 30], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
      },
    });

    // Totaux
    const finalY =
      ((doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 72) + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total débité :", 140, finalY);
    doc.text(fmt(transaction.montant), 196, finalY, { align: "right" });

    if (transaction.solde_apres != null) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Solde après paiement :", 140, finalY + 7);
      doc.text(fmt(transaction.solde_apres), 196, finalY + 7, { align: "right" });
    }

  } else {
    // ── Fallback simplifié (ancienne transaction sans metadata) ───────────────
    autoTable(doc, {
      startY:     72,
      head:       [["Description", "Type", "Montant"]],
      body:       [[
        transaction.label ?? "—",
        transaction.type_display ?? transaction.type,
        fmt(transaction.montant),
      ]],
      theme:      "striped",
      headStyles: { fillColor: [30, 30, 30], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
    });

    if (transaction.solde_apres != null) {
      const finalY =
        ((doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 72) + 6;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Solde après paiement :", 140, finalY);
      doc.text(fmt(transaction.solde_apres), 196, finalY, { align: "right" });
    }
  }

  footer(doc);
  doc.save(`facture-${transaction.reference ?? transaction.id}.pdf`);
}

// ── Export 2 : Bilan par période ─────────────────────────────────────────────

export function generateBillingReportPDF(
  transactions: Transaction[],
  period:        string,          // ex : "Mai 2026"
  entrepriseName: string,
): void {
  const doc = new jsPDF();

  header(doc, `Bilan financier — ${period}`, entrepriseName);

  if (transactions.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Aucune transaction sur cette période.", 14, 40);
    footer(doc);
    doc.save(`bilan-${period.replace(/\s/g, "-").toLowerCase()}.pdf`);
    return;
  }

  // Tableau transactions
  const rows = transactions.map((tr) => [
    fmtDate(tr.created_at),
    tr.label ?? "—",
    tr.type_display ?? tr.type,
    tr.category_display ?? tr.category,
    tr.status_display ?? tr.status,
    tr.type === "credit"
      ? `+${fmt(tr.montant)}`
      : `-${fmt(tr.montant)}`,
  ]);

  autoTable(doc, {
    startY:     34,
    head:       [["Date", "Description", "Type", "Catégorie", "Statut", "Montant"]],
    body:       rows,
    theme:      "striped",
    headStyles: { fillColor: [30, 30, 30], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 55 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30, halign: "right" },
    },
  });

  // Totaux période
  const credits = transactions
    .filter((tr) => tr.type === "credit")
    .reduce((s, tr) => s + tr.montant, 0);
  const debits = transactions
    .filter((tr) => tr.type !== "credit")
    .reduce((s, tr) => s + tr.montant, 0);

  const finalY =
    ((doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 34) + 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, finalY, 196, finalY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Total crédits :`,  14,  finalY + 7);
  doc.setTextColor(22, 163, 74);
  doc.text(fmt(credits), 196, finalY + 7, { align: "right" });

  doc.setTextColor(60, 60, 60);
  doc.text(`Total débits :`,   14,  finalY + 14);
  doc.setTextColor(220, 38, 38);
  doc.text(fmt(debits), 196, finalY + 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Solde net :`,      14,  finalY + 22);
  doc.text(fmt(credits - debits), 196, finalY + 22, { align: "right" });

  footer(doc);
  doc.save(`bilan-${period.replace(/\s/g, "-").toLowerCase()}.pdf`);
}