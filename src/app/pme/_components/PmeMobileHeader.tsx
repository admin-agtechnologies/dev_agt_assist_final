    "use client";
import { Menu, X } from "lucide-react";
import type { SectorTheme } from "@/lib/sector-theme";

interface Props {
  isOpen: boolean;
  sectorTheme: SectorTheme;
  onToggle: () => void;
}

export function PmeMobileHeader({ isOpen, sectorTheme, onToggle }: Props) {
  return (
    <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
      <button onClick={onToggle} className="p-2 rounded-xl hover:bg-[var(--bg)] transition-colors">
        {isOpen
          ? <X className="w-5 h-5 text-[var(--text)]" />
          : <Menu className="w-5 h-5 text-[var(--text)]" />}
      </button>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-xs"
          style={{ backgroundColor: sectorTheme.primary }}>A</div>
        <span className="font-bold text-sm text-[var(--text)]">AGT Platform</span>
      </div>
    </header>
  );
}