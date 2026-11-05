import Link from "next/link";
import MobileNav from "./mobile-nav";
import { siteLinks, type SitePage } from "./navigation";

export default function SiteHeader({ currentPage }: { currentPage: SitePage }) {
  return (
    <header className="relative flex items-center justify-between border-b border-[#e4e2d9] py-4 sm:py-5">
      <Link href="/" className="flex min-h-11 items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#294737] text-lg text-white">
          L
        </span>
        <span className="text-sm font-semibold tracking-tight text-[#30372f] sm:text-base">
          The Reading Room
        </span>
      </Link>
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
            {label}
          </Link>
        ))}
      </nav>
      <MobileNav currentPage={currentPage} />
    </header>
  );
}
