"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  Globe,
  ShieldAlert,
  Newspaper,
  TrendingUp,
  ListFilter,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "VRP Calculator", icon: Calculator },
  { href: "/markets", label: "Global Markets", icon: Globe },
  { href: "/risk-analyzer", label: "Risk Analyzer", icon: ShieldAlert },
  { href: "/screener", label: "Options Screener", icon: ListFilter },
  { href: "/advisory", label: "Advisory", icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar fixed left-0 top-0 bottom-0 w-[240px] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}>
          <TrendingUp size={18} color="white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            VRP Global
          </h1>
          <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Analytics
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx("sidebar-link", isActive && "active")}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Markets Live
          </span>
        </div>
      </div>
    </aside>
  );
}
