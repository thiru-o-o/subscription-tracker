"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldOff, Compass } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/cancel",
    label: "Cancel",
    icon: ShieldOff,
  },
  {
    href: "/discover",
    label: "Discover",
    icon: Compass,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white border-t border-gray-200 z-50">
      <ul className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all"
                />
                <span
                  className={`text-[10px] font-medium tracking-wide ${
                    isActive ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
