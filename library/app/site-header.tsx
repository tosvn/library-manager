import Link from "next/link";
import MobileNav from "./mobile-nav";
import { siteLinks, type SitePage } from "./navigation";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader({ currentPage }: { currentPage: SitePage }) {
  return (
    <header className="library-site-header relative flex items-center justify-between border-b border-[#e4e2d9] py-4 sm:py-5">
      <Link href="/" className="flex min-h-11 items-center gap-3">
        <span className="library-logo flex size-10 items-center justify-center rounded-xl bg-[#294737] text-lg text-white">
          L
        </span>
        <span className="text-sm font-semibold tracking-tight text-[#30372f] sm:text-base">
          The Reading Room
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-6">
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-4 text-sm font-medium sm:flex sm:gap-6"
        >
          {siteLinks.map(({ href, label, page }) => (
            <Link
              key={page}
              aria-current={page === currentPage ? "page" : undefined}
              className={
                page === currentPage
                  ? "text-[#294737]"
                  : "text-[#73766d] hover:text-[#294737]"
              }
              href={href}
            >
              {page === "trash" && (
                <svg
                  aria-hidden="true"
                  className="mr-1.5 inline size-4 align-[-2px]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                </svg>
              )}
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <MobileNav currentPage={currentPage} />
      </div>
    </header>
  );
}
