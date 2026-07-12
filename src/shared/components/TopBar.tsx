"use client";

import { Bell, Search, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function TopBar({ title, subtitle, action }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="topbar sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {action && <div className="mr-2">{action}</div>}
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search stocks, markets..."
            className="input-field pl-9 w-[260px]"
          />
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl transition-colors hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun size={18} style={{ color: "var(--text-secondary)" }} />
            ) : (
              <Moon size={18} style={{ color: "var(--text-secondary)" }} />
            )}
          </button>
        )}

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Bell size={18} style={{ color: "var(--text-secondary)" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--negative)" }}
          />
        </button>

        {/* Profile */}
        {session?.user ? (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/[0.1]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                color: "white",
              }}
              title={session.user.email!}
            >
              {session.user.name?.[0].toUpperCase() || "U"}
            </div>
            <button
              onClick={() => signOut()}
              className="text-xs transition-colors hover:text-cyan-400"
              style={{ color: "var(--text-muted)" }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("credentials")}
            className="btn-primary text-xs py-1.5 px-4 ml-2"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
