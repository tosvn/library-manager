"use client";

import Link from "next/link";
import { siteLinks, type SitePage } from "./navigation";

export default function MobileNav({ currentPage }: { currentPage: SitePage }) {
  return (
    <details className="relative sm:hidden">
      <summary
        aria-label="Open navigation menu"
        className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-[#d6d3c9] text-[#30372f] hover:bg-[#eeece6] [&::-webkit-details-marker]:hidden"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </summary>
      <nav
        aria-label="Mobile navigation"
        className="absolute right-0 top-full z-30 mt-2 flex min-w-44 flex-col rounded-xl border border-[#e5e3db] bg-white p-2 text-sm font-medium shadow-lg"
      >
        {siteLinks.map(({ href, label, page }) => (
          <Link
            key={page}
            aria-current={page === currentPage ? "page" : undefined}
            className={`min-h-11 rounded-lg px-3 py-3 ${
              page === currentPage
                ? "bg-[#e6f0e8] text-[#294737]"
                : "text-[#73766d] hover:bg-[#f6f5ef] hover:text-[#294737]"
            }`}
            onClick={(event) => {
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            href={href}
          >
            {label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
