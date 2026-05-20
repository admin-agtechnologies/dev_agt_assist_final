// src/app/(dashboard)/results/page.tsx
"use client";

import { useMemo, useState, useCallback }    from "react";
import {
  MessageSquare, HelpCircle, Calendar, UtensilsCrossed,
  Package, Ticket, Stethoscope, ShoppingBag, Layers,
  Bell, GraduationCap, Landmark, FolderOpen, FileText,
  Users, Target, ArrowLeftRight, Mail, LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { PageHeader }           from "@/components/ui/PageHeader";
import { useLanguage }          from "@/contexts/LanguageContext";
import { useActiveFeatures }    from "@/hooks/useFeatures";
import { KnowledgeTabs, type KnowledgeTab } from "@/app/(dashboard)/knowledge/_components/KnowledgeTabs";

// ── Repositories ──────────────────────────────────────────────────────────────
import {
  reservationsResultRepository,
  commandesResultRepository,
  inscriptionsResultRepository,
  dossiersResultRepository,
  contactsResultRepository,
  transfertsResultRepository,
  conciergerieResultRepository,
  emailLogsResultRepository,
  consultationsFAQResultRepository,
} from "@/repositories/results.repository";
import { conversationsRepository } from "@/repositories/conversations.repository";

// ── Components ────────────────────────────────────────────────────────────────
import { ResultListTab }                  from "./_components/ResultListTab";
import { ChatbotResultTab }               from "@/app/(dashboard)/knowledge/_components/tabs/ChatbotResultTab";
import { ReservationResultCard }          from "./_components/ReservationResultCard";
import { CommandeResultCard }             from "./_components/CommandeResultCard";
import { InscriptionResultCard }          from "./_components/InscriptionResultCard";
import { DossierResultCard }              from "./_components/DossierResultCard";
import { ContactResultCard }              from "./_components/ContactResultCard";
import { TransfertHumainResultCard }      from "./_components/TransfertHumainResultCard";
import { EmailResultCard }                from "./_components/EmailResultCard";
import { ConsultationFAQResultCard }      from "./_components/ConsultationFAQResultCard";
import { DemandeConciergericResultCard }  from "./_components/DemandeConciergericResultCard";

// ── Tab IDs ───────────────────────────────────────────────────────────────────
type TabId =
  | "chatbot_whatsapp" | "faq"
  | "prise_rdv" | "reservation_table" | "reservation_chambre"
  | "reservation_billet" | "orientation_patient"
  | "menu_digital" | "catalogue_produits" | "suivi_commande"
  | "conciergerie" | "inscription_admission"
  | "orientation_citoyens" | "suivi_dossier" | "collecte_documents"
  | "gestion_crm" | "capture_prospect"
  | "transfert_humain" | "emails_envoyes";

interface TabDef {
  id:       TabId;
  icon:     LucideIcon;
  feature?: string;   // undefined = toujours visible
}

const ALL_TABS: TabDef[] = [
  { id: "chatbot_whatsapp",    icon: MessageSquare },
  { id: "faq",                 icon: HelpCircle,      feature: "faq" },
  { id: "prise_rdv",           icon: Calendar,        feature: "prise_rdv" },
  { id: "reservation_table",   icon: LayoutGrid,      feature: "reservation_table" },
  { id: "reservation_chambre", icon: Calendar,        feature: "reservation_chambre" },
  { id: "reservation_billet",  icon: Ticket,          feature: "reservation_billet" },
  { id: "orientation_patient", icon: Stethoscope,     feature: "orientation_patient" },
  { id: "menu_digital",        icon: UtensilsCrossed, feature: "menu_digital" },
  { id: "catalogue_produits",  icon: Package,         feature: "catalogue_produits" },
  { id: "suivi_commande",      icon: ShoppingBag,     feature: "suivi_commande" },
  { id: "conciergerie",        icon: Bell,            feature: "conciergerie" },
  { id: "inscription_admission",icon: GraduationCap,  feature: "inscription_admission" },
  { id: "orientation_citoyens",icon: Landmark,        feature: "orientation_citoyens" },
  { id: "suivi_dossier",       icon: FolderOpen,      feature: "suivi_dossier" },
  { id: "collecte_documents",  icon: FileText,        feature: "collecte_documents" },
  { id: "gestion_crm",         icon: Users,           feature: "gestion_crm" },
  { id: "capture_prospect",    icon: Target,          feature: "capture_prospect" },
  { id: "transfert_humain",    icon: ArrowLeftRight },
  { id: "emails_envoyes",      icon: Mail },
];

const TAB_LABELS: Record<TabId, { fr: string; en: string }> = {
  chatbot_whatsapp:    { fr: "Chatbot WhatsApp",    en: "WhatsApp Chatbot" },
  faq:                 { fr: "FAQ",                 en: "FAQ" },
  prise_rdv:           { fr: "Prise de RDV",        en: "Appointments" },
  reservation_table:   { fr: "Réservation table",   en: "Table booking" },
  reservation_chambre: { fr: "Réservation chambre", en: "Room booking" },
  reservation_billet:  { fr: "Réservation billet",  en: "Ticket booking" },
  orientation_patient: { fr: "Orientation patient", en: "Patient routing" },
  menu_digital:        { fr: "Menu digital",        en: "Digital menu" },
  catalogue_produits:  { fr: "Catalogue produits",  en: "Products" },
  suivi_commande:      { fr: "Suivi commande",      en: "Order tracking" },
  conciergerie:        { fr: "Conciergerie",        en: "Concierge" },
  inscription_admission:{ fr: "Inscriptions",       en: "Admissions" },
  orientation_citoyens:{ fr: "Orientation citoyens",en: "Citizens" },
  suivi_dossier:       { fr: "Suivi dossier",       en: "Case tracking" },
  collecte_documents:  { fr: "Collecte documents",  en: "Documents" },
  gestion_crm:         { fr: "Gestion CRM",         en: "CRM" },
  capture_prospect:    { fr: "Capture prospect",    en: "Lead capture" },
  transfert_humain:    { fr: "Transferts humains",  en: "Human handoff" },
  emails_envoyes:      { fr: "Emails envoyés",      en: "Sent emails" },
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { locale }   = useLanguage();
  const { features } = useActiveFeatures();
  const [activeTab, setActiveTab] = useState<TabId>("chatbot_whatsapp");

  const isFeatureActive = useCallback(
    (slug: string) => features.some((f) => f.slug === slug && f.is_active),
    [features],
  );

  const visibleTabs = useMemo<KnowledgeTab[]>(() =>
    ALL_TABS
      .filter((t) => !t.feature || isFeatureActive(t.feature))
      .map(({ id, icon }) => ({
        id,
        label: TAB_LABELS[id][locale],
        icon,
      })),
    [isFeatureActive, locale],
  );

  const safeTab = (
    visibleTabs.find((t) => t.id === activeTab)
      ? activeTab
      : (visibleTabs[0]?.id ?? "chatbot_whatsapp")
  ) as TabId;

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "fr" ? "Résultats du bot" : "Bot results"}
        subtitle={locale === "fr"
          ? "Tout ce que votre bot a créé pour vous"
          : "Everything your bot has created for you"}
      />

      <KnowledgeTabs
        tabs={visibleTabs}
        activeTab={safeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      <div>
        {/* ── Chatbot WhatsApp — cas spécial (composant dédié) ── */}
        {safeTab === "chatbot_whatsapp" && <ChatbotResultTab />}

        {/* ── FAQ ── */}
        {safeTab === "faq" && (
          <ResultListTab
            cacheKey="faq"
            fetcher={(p) => consultationsFAQResultRepository.getList(p)}
            renderCard={(item) => <ConsultationFAQResultCard item={item} />}
            emptyIcon={HelpCircle}
            emptyMessage="Aucune consultation FAQ"
            emptyHint="Les questions posées au bot apparaîtront ici."
          />
        )}

        {/* ── Réservations (5 features) ── */}
        {(["prise_rdv","reservation_table","reservation_chambre",
           "reservation_billet","orientation_patient"] as TabId[]).map((tab) =>
          safeTab === tab && (
            <ResultListTab
              key={tab}
              cacheKey={tab}
              fetcher={(p) => reservationsResultRepository.getList({
                ...p,
                ...(tab !== "suivi_commande" ? { feature_slug: tab } : {}),
              })}
              renderCard={(item) => <ReservationResultCard item={item} />}
              emptyIcon={Calendar}
              emptyMessage="Aucune réservation"
              emptyHint="Les réservations prises par le bot apparaîtront ici."
            />
          )
        )}

        {/* ── Commandes (menu_digital + catalogue_produits) ── */}
        {safeTab === "menu_digital" && (
          <ResultListTab
            cacheKey="menu_digital"
            fetcher={(p) => commandesResultRepository.getList({ ...p, feature_slug: "menu_digital" })}
            renderCard={(item) => <CommandeResultCard item={item} />}
            emptyIcon={UtensilsCrossed}
            emptyMessage="Aucune commande menu"
          />
        )}
        {safeTab === "catalogue_produits" && (
          <ResultListTab
            cacheKey="catalogue_produits"
            fetcher={(p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_produits" })}
            renderCard={(item) => <CommandeResultCard item={item} />}
            emptyIcon={Package}
            emptyMessage="Aucune commande produit"
          />
        )}
        {safeTab === "suivi_commande" && (
          <ResultListTab
            cacheKey="suivi_commande"
            fetcher={(p) => commandesResultRepository.getList(p)}
            renderCard={(item) => <CommandeResultCard item={item} />}
            emptyIcon={ShoppingBag}
            emptyMessage="Aucune commande"
          />
        )}

        {/* ── Conciergerie ── */}
        {safeTab === "conciergerie" && (
          <ResultListTab
            cacheKey="conciergerie"
            fetcher={(p) => conciergerieResultRepository.getList(p)}
            renderCard={(item) => <DemandeConciergericResultCard item={item} />}
            emptyIcon={Bell}
            emptyMessage="Aucune demande conciergerie"
          />
        )}

        {/* ── Inscriptions ── */}
        {safeTab === "inscription_admission" && (
          <ResultListTab
            cacheKey="inscription_admission"
            fetcher={(p) => inscriptionsResultRepository.getList(p)}
            renderCard={(item) => <InscriptionResultCard item={item} />}
            emptyIcon={GraduationCap}
            emptyMessage="Aucune inscription"
          />
        )}

        {/* ── Dossiers (3 features) ── */}
        {(["orientation_citoyens","suivi_dossier","collecte_documents"] as TabId[]).map((tab) =>
          safeTab === tab && (
            <ResultListTab
              key={tab}
              cacheKey={tab}
              fetcher={(p) => dossiersResultRepository.getList(p)}
              renderCard={(item) => <DossierResultCard item={item} />}
              emptyIcon={FolderOpen}
              emptyMessage="Aucun dossier"
            />
          )
        )}

        {/* ── Contacts (gestion_crm + capture_prospect) ── */}
        {safeTab === "gestion_crm" && (
          <ResultListTab
            cacheKey="gestion_crm"
            fetcher={(p) => contactsResultRepository.getList(p)}
            renderCard={(item) => <ContactResultCard item={item} />}
            emptyIcon={Users}
            emptyMessage="Aucun contact"
          />
        )}
        {safeTab === "capture_prospect" && (
          <ResultListTab
            cacheKey="capture_prospect"
            fetcher={(p) => contactsResultRepository.getList({ ...p, statut: "prospect" })}
            renderCard={(item) => <ContactResultCard item={item} />}
            emptyIcon={Target}
            emptyMessage="Aucun prospect"
          />
        )}

        {/* ── Transferts humains ── */}
        {safeTab === "transfert_humain" && (
          <ResultListTab
            cacheKey="transfert_humain"
            fetcher={(p) => transfertsResultRepository.getList(p)}
            renderCard={(item) => <TransfertHumainResultCard item={item} />}
            emptyIcon={ArrowLeftRight}
            emptyMessage="Aucun transfert"
          />
        )}

        {/* ── Emails ── */}
        {safeTab === "emails_envoyes" && (
          <ResultListTab
            cacheKey="emails_envoyes"
            fetcher={(p) => emailLogsResultRepository.getList(p)}
            renderCard={(item) => <EmailResultCard item={item} />}
            emptyIcon={Mail}
            emptyMessage="Aucun email envoyé"
          />
        )}
      </div>
    </div>
  );
}