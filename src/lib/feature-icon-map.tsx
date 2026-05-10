// ============================================================
// FICHIER : src/lib/feature-icon-map.tsx
// Resolver : slug backend → composant Lucide
// ============================================================

import {
  PhoneCall, MessageCircle, BarChart2, ShoppingCart,
  BookOpen, Utensils, Mail, HelpCircle, Calendar,
  Users, Building2, MapPin, Star, Shield, Truck,
  ClipboardList, GraduationCap, Landmark, Settings,
  Briefcase, Home, CreditCard, Zap, BedDouble,
  ConciergeBell, UserCheck, Ticket, Route, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  // Noms exacts stockés en base
  "phone-call":       PhoneCall,
  "message-circle":   MessageCircle,
  "bar-chart-2":      BarChart2,
  "shopping-cart":    ShoppingCart,
  "book-open":        BookOpen,
  "utensils":         Utensils,
  "mail":             Mail,
  "help-circle":      HelpCircle,
  "calendar":         Calendar,
  "users":            Users,
  "building-2":       Building2,
  "building":         Building2,
  "map-pin":          MapPin,
  "star":             Star,
  "shield":           Shield,
  "truck":            Truck,
  "clipboard-list":   ClipboardList,
  "graduation-cap":   GraduationCap,
  "landmark":         Landmark,
  "settings":         Settings,
  "briefcase":        Briefcase,
  "home":             Home,
  "credit-card":      CreditCard,
  "zap":              Zap,
  "bed-double":       BedDouble,
  "concierge-bell":   ConciergeBell,
  "user-check":       UserCheck,
  "ticket":           Ticket,
  "route":            Route,
};

/** Retourne le composant Lucide correspondant au slug, ou Zap par défaut. */
export function getFeatureIcon(slug: string): LucideIcon {
  return ICON_MAP[slug] ?? Zap;
}