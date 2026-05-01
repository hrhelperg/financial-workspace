"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  FolderOpen,
  LayoutDashboard,
  ReceiptText,
  Search,
  WalletCards,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: BriefcaseBusiness },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/expenses", label: "Expenses", icon: WalletCards },
  { href: "/cashflow", label: "Cashflow", icon: BarChart3 },
  { href: "/documents", label: "Documents", icon: FolderOpen }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#1f2933]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d8ded8] bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0f766e] text-white">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-normal">Financial</span>
            <span className="block text-sm text-[#647067]">Workspace</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#e1f3ef] text-[#0f5f59]"
                    : "text-[#58645d] hover:bg-[#f0f2ec] hover:text-[#1f2933]"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1f2933]">
            <Zap className="h-4 w-4 text-[#0f766e]" aria-hidden="true" />
            Automation
          </div>
          <p className="mt-2 text-xs leading-5 text-[#647067]">Payment, spend, and document rules ready.</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[#d8ded8] bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-md lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0f766e] text-white">
                <Zap className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">Financial Workspace</span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <label className="hidden min-w-64 items-center gap-2 rounded-md border border-[#d8ded8] bg-[#f8faf7] px-3 py-2 text-sm text-[#647067] md:flex">
                <Search className="h-4 w-4" aria-hidden="true" />
                <input
                  className="w-full bg-transparent text-[#1f2933] outline-none placeholder:text-[#7d887f]"
                  placeholder="Search records"
                />
              </label>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d8ded8] bg-white text-[#58645d] transition-colors hover:bg-[#f0f2ec] hover:text-[#1f2933]"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-[#e1f3ef] text-[#0f5f59]"
                      : "bg-[#f8faf7] text-[#58645d]"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
