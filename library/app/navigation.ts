export type SitePage = "books" | "members" | "trash";

export const siteLinks: { href: string; label: string; page: SitePage }[] = [
  { href: "/", label: "Books", page: "books" },
  { href: "/members", label: "Members", page: "members" },
  { href: "/trash", label: "Trash", page: "trash" },
];
