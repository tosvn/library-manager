import { Suspense } from "react";
import { connection } from "next/server";
import { getTrashedBooks, type TrashedBook } from "@/db/queries";
import { EmptyTrashButton, RestoreBookButton } from "../trash-actions";
import DataLoadError from "../data-load-error";
import SiteHeader from "../site-header";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

async function TrashNotice({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { notice } = await searchParams;
  const notices = {
    "book-moved": "Book moved to Trash. It will be permanently deleted after 20 days.",
    "book-restored": "Book restored to the library.",
    "trash-emptied": "Trash permanently emptied.",
    "empty-failed": "Trash could not be emptied. Please try again.",
  };
  const message = typeof notice === "string" ? notices[notice as keyof typeof notices] : undefined;

  if (!message) {
    return null;
  }

  const isError = notice === "empty-failed";
  return (
    <p
      aria-live="polite"
      className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${
        isError
          ? "border-[#d7aaa2] bg-[#fbefed] text-[#9b3d2c]"
          : "border-[#c6d9ca] bg-[#e6f0e8] text-[#2c5a3f]"
      }`}
      role={isError ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

async function TrashList() {
  await connection();
  let books: TrashedBook[];
  try {
    books = await getTrashedBooks();
  } catch (error) {
    console.error("Failed to load Trash.", error);
    return <DataLoadError resource="Trash" />;
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#686b61]">
          Books are permanently deleted 20 days after moving to Trash.
        </p>
        <EmptyTrashButton disabled={books.length === 0} />
      </div>
      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6d3c9] bg-white/70 px-5 py-12 text-center">
          <p className="font-medium text-[#30372f]">Trash is empty</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex flex-col justify-between rounded-2xl border border-[#e5e3db] bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#85877e]">
                  {book.year}
                </p>
                <h2 className="mt-3 text-lg font-semibold leading-snug text-[#252c26]">
                  {book.title}
                </h2>
                <p className="mt-1 text-sm text-[#686b61]">by {book.authorName}</p>
                <p className="mt-4 text-sm text-[#686b61]">
                  Permanently deleted {formatDate(book.expiresAt)}
                </p>
              </div>
              <div className="mt-4 border-t border-[#eeece6] pt-3">
                <RestoreBookButton id={book.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function TrashListFallback() {
  return (
    <div
      aria-label="Loading Trash"
      className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-36 rounded-2xl border border-[#e5e3db] bg-white"
        />
      ))}
    </div>
  );
}

export default function TrashPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  return (
    <main className="min-h-screen bg-[#f6f5ef] px-4 pb-12 text-[#252c26] sm:px-6 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <SiteHeader currentPage="trash" />

        <section className="py-9 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#54715d]">
            Library management
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#233d32] sm:text-5xl">
            Trash
          </h1>
        </section>

        <Suspense fallback={null}>
          <TrashNotice searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<TrashListFallback />}>
          <TrashList />
        </Suspense>
      </div>
    </main>
  );
}