// src/app/pme/help/page.tsx
"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui";
import {
  HelpCircle, ChevronDown, MessageCircle, ExternalLink,
  Search, Tag,
} from "lucide-react";

// ── Ouvre le widget chat programmatiquement ────────────────────────────────────
function openSupportChat() {
  window.dispatchEvent(new CustomEvent("agt:open-chat"));
}

// ── FAQ statiques AGT Platform ─────────────────────────────────────────────────
interface PlatformFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const PLATFORM_FAQ_FR: PlatformFAQ[] = [
  {
    id: "1", category: "Compte",
    question: "Comment créer mon compte AGT Platform ?",
    answer: "Rendez-vous sur la page d'accueil et cliquez sur \"Créer mon compte\". Renseignez les informations de votre entreprise, choisissez votre plan et effectuez le paiement via Mobile Money. Votre assistant est prêt en moins de 5 minutes.",
  },
  {
    id: "2", category: "Compte",
    question: "J'ai oublié mon mot de passe, que faire ?",
    answer: "Sur la page de connexion, cliquez sur \"Mot de passe oublié ?\" et saisissez votre adresse email. Vous recevrez un lien de réinitialisation dans votre boîte mail. Vérifiez également vos spams.",
  },
  {
    id: "3", category: "Compte",
    question: "Puis-je changer l'email de mon compte ?",
    answer: "Oui, rendez-vous dans Mon Profil > Modifier le profil. Mettez à jour votre adresse email et sauvegardez. Un email de confirmation vous sera envoyé à la nouvelle adresse.",
  },
  {
    id: "4", category: "Bots",
    question: "Comment créer mon premier bot WhatsApp ?",
    answer: "Dans \"Mes Bots\", cliquez sur \"Nouveau bot\". Donnez-lui un nom, un message d'accueil et choisissez votre fournisseur WhatsApp. Utilisez ensuite \"Tester le bot\" pour vérifier son comportement avant de le publier.",
  },
  {
    id: "5", category: "Bots",
    question: "Quelle est la différence entre WAHA et Meta API ?",
    answer: "WAHA est une solution open-source sans approbation Meta, idéale pour démarrer. Meta API est la solution officielle WhatsApp Business, recommandée pour les volumes élevés et une intégration certifiée.",
  },
  {
    id: "6", category: "Bots",
    question: "Mon bot ne répond pas correctement, que faire ?",
    answer: "Vérifiez que votre base de connaissance est bien remplie (horaires, services, FAQ). Utilisez l'interface de test pour simuler des conversations. Si le bot ne détecte pas une intention, enrichissez vos réponses dans la base de connaissance.",
  },
  {
    id: "7", category: "Facturation",
    question: "Comment recharger mon portefeuille ?",
    answer: "Dans Facturation, cliquez sur \"Recharger\". Choisissez Orange Money ou MTN MoMo, saisissez votre numéro et le montant. La recharge est instantanée. Montant minimum : 1 000 XAF.",
  },
  {
    id: "8", category: "Facturation",
    question: "Que se passe-t-il si mon solde est insuffisant au renouvellement ?",
    answer: "Votre abonnement sera suspendu et votre bot ne répondra plus à vos clients. Rechargez votre portefeuille pour réactiver le service. Aucune donnée n'est perdue.",
  },
  {
    id: "9", category: "Facturation",
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, depuis la section Facturation. Le montant du nouveau plan est débité de votre portefeuille. Le changement est effectif immédiatement.",
  },
  {
    id: "10", category: "Rendez-vous",
    question: "Comment le bot prend-il des rendez-vous automatiquement ?",
    answer: "Le bot analyse les messages pour détecter une intention de RDV. Il consulte votre agenda en temps réel pour proposer les créneaux libres, selon la durée et le tampon configurés dans vos paramètres.",
  },
  {
    id: "11", category: "Rendez-vous",
    question: "Comment configurer mes créneaux de disponibilité ?",
    answer: "Dans Rendez-vous, cliquez sur l'icône de configuration. Définissez la durée d'un RDV et le tampon entre consultations. Vos horaires d'ouverture se configurent dans Base de connaissance > Infos générales.",
  },
  {
    id: "12", category: "Base de connaissance",
    question: "Pourquoi ma base de connaissance est-elle importante ?",
    answer: "C'est le \"cerveau\" de votre bot. Plus elle est complète, plus votre assistant donnera des réponses précises. Renseignez horaires, services, agences, FAQ et contacts pour le meilleur résultat.",
  },
  {
    id: "13", category: "Base de connaissance",
    question: "Mon bot peut-il répondre en plusieurs langues ?",
    answer: "Oui ! Sélectionnez les langues lors de la création du bot. Dans la Base de connaissance, renseignez vos informations dans chaque langue pour que le bot réponde dans la langue du client.",
  },
];

const PLATFORM_FAQ_EN: PlatformFAQ[] = [
  {
    id: "1", category: "Account",
    question: "How do I create my AGT Platform account?",
    answer: "Go to the homepage and click \"Create my account\". Fill in your business information, choose your plan and pay via Mobile Money. Your assistant is ready in less than 5 minutes.",
  },
  {
    id: "2", category: "Account",
    question: "I forgot my password, what should I do?",
    answer: "On the login page, click \"Forgot password?\" and enter your email. You will receive a reset link in your inbox. Also check your spam folder.",
  },
  {
    id: "3", category: "Account",
    question: "Can I change my account email?",
    answer: "Yes, go to My Profile > Edit profile. Update your email address and save. A confirmation email will be sent to the new address.",
  },
  {
    id: "4", category: "Bots",
    question: "How do I create my first WhatsApp bot?",
    answer: "In \"My Bots\", click \"New bot\". Give it a name, a welcome message and choose your WhatsApp provider. Then use \"Test bot\" to verify its behavior before publishing.",
  },
  {
    id: "5", category: "Bots",
    question: "What is the difference between WAHA and Meta API?",
    answer: "WAHA is an open-source solution without Meta approval, ideal for getting started. Meta API is WhatsApp Business's official solution, recommended for high volumes and certified integration.",
  },
  {
    id: "6", category: "Bots",
    question: "My bot isn't responding correctly, what should I do?",
    answer: "Check that your knowledge base is properly filled in (hours, services, FAQ). Use the test interface to simulate conversations and identify issues.",
  },
  {
    id: "7", category: "Billing",
    question: "How do I top up my wallet?",
    answer: "In Billing, click \"Top up\". Choose Orange Money or MTN MoMo, enter your number and amount. Top-up is instant. Minimum: 1,000 XAF.",
  },
  {
    id: "8", category: "Billing",
    question: "What happens if my balance is insufficient at renewal?",
    answer: "Your subscription will be suspended and your bot will stop responding. Top up your wallet to reactivate the service. No data is lost.",
  },
  {
    id: "9", category: "Billing",
    question: "Can I change plans at any time?",
    answer: "Yes, from the Billing section. The new plan amount is debited from your wallet. The change takes effect immediately.",
  },
  {
    id: "10", category: "Appointments",
    question: "How does the bot take appointments automatically?",
    answer: "The bot detects appointment intent in messages, then checks your agenda in real time to suggest available slots based on your configured duration and buffer.",
  },
  {
    id: "11", category: "Appointments",
    question: "How do I configure my availability slots?",
    answer: "In Appointments, click the configuration icon. Set the appointment duration and buffer. Opening hours are configured in Knowledge base > General info.",
  },
  {
    id: "12", category: "Knowledge base",
    question: "Why is my knowledge base important?",
    answer: "It's your bot's \"brain\". The more complete it is, the more precise your assistant's responses will be. Fill in hours, services, locations, FAQ and contacts for the best results.",
  },
  {
    id: "13", category: "Knowledge base",
    question: "Can my bot respond in multiple languages?",
    answer: "Yes! Select languages when creating the bot. In the Knowledge base, fill in your information in each language so the bot can respond in the customer's language.",
  },
];

export default function PmeHelpPage() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.help;
  const faqs = locale === "fr" ? PLATFORM_FAQ_FR : PLATFORM_FAQ_EN;

  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(faqs.map(f => f.category)))];

  const filtered = faqs.filter(faq => {
    const matchCat = activeCategory === "all" || faq.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q
      || faq.question.toLowerCase().includes(q)
      || faq.answer.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const whatsappUrl = "https://wa.me/237600000000?text=Bonjour%20AGT%20Technologies%20!";

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">

      <SectionHeader title={t.title} subtitle={t.subtitle} />

      {/* ── Boutons contact ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={openSupportChat}
          className="group flex items-center gap-4 p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] hover:border-[#075E54] hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#075E54]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#075E54]/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-[#075E54]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)]">{t.chatBtn}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.contactSubtitle}</p>
          </div>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] hover:border-[#25D366] hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
            <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text)]">{t.whatsappBtn}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">+237 600 000 000</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 group-hover:text-[#25D366] transition-colors" />
        </a>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <p className="text-base font-bold text-[var(--text)]">{t.faqSection}</p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{t.faqSubtitle}</p>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            className="input-base pl-9 text-sm"
            placeholder={locale === "fr" ? "Rechercher dans la FAQ…" : "Search FAQ…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filtres catégories */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                activeCategory === cat
                  ? "bg-[#075E54] text-white border-[#075E54]"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[#075E54]"
              )}
            >
              {cat === "all"
                ? (t.categories?.all ?? "Toutes")
                : <><Tag className="w-3 h-3" />{cat}</>
              }
            </button>
          ))}
        </div>

        {search && (
          <p className="text-xs text-[var(--text-muted)]">
            {filtered.length} {locale === "fr" ? "résultat(s)" : "result(s)"}
          </p>
        )}

        {/* Liste FAQ */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--text-muted)]">{t.faqEmpty}</p>
            </div>
          ) : filtered.map(faq => (
            <div key={faq.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg)] transition-colors text-left"
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#075E54]/10 flex items-center justify-center">
                    <HelpCircle className="w-3.5 h-3.5 text-[#075E54]" />
                  </span>
                  <span className="text-sm font-semibold text-[var(--text)] truncate">
                    {faq.question}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] font-medium flex-shrink-0 hidden sm:inline-flex">
                    {faq.category}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-[var(--text-muted)] transition-transform flex-shrink-0 ml-3",
                  expanded === faq.id && "rotate-180"
                )} />
              </button>

              {expanded === faq.id && (
                <div className="px-6 pb-5 pt-3 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}