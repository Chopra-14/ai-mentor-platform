"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quiz", label: "Quiz" },
  { href: "/analytics", label: "Analytics" },
  { href: "/study-plan", label: "Study Plan" },
  { href: "/challenges", label: "Coding Challenges" },
  { href: "/resume", label: "Resume Analyzer" },
  { href: "/profile", label: "Profile" }
];

export default function AppSidebar({ showAdmin = false }) {
  const router = useRouter();
  const pathname = usePathname();

  const linkClass = (href) =>
    `block transition ${
      pathname === href ? "text-cyan-400" : "hover:text-cyan-400"
    }`;

  return (
    <div className="w-full md:w-64 bg-white/10 backdrop-blur-lg border-b md:border-b-0 md:border-r border-white/10 p-6 shrink-0">
      <h1 className="text-3xl font-bold mb-10 text-cyan-400">AI Mentor</h1>
      <div className="space-y-5 text-lg">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            {item.label}
          </Link>
        ))}
        {showAdmin && (
          <Link href="/admin" className={linkClass("/admin")}>
            Admin Panel
          </Link>
        )}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="block w-full text-left text-red-400 hover:text-red-300 transition mt-10"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
