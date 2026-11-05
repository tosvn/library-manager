import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getBooks } from "@/db/queries";
import AddBookForm from "./add-book-form";
import BookActions from "./book-actions";

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

async function DeletionNotice({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { notice } = await searchParams;

  if (notice !== "book-deleted") {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className="mb-4 rounded-lg border border-[#c6d9ca] bg-[#e6f0e8] px-4 py-3 text-sm font-medium text-[#2c5a3f]"
      role="status"
    >
      Book deleted.
    </p>
  );
}

async function BookList() {
  await connection();
  const books = await getBooks();
  const onLoanCount = books.filter((book) => book.memberName !== null).length;
  const availableCount = books.length - onLoanCount;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4">
        <div className="rounded-2xl border border-[#e5e3db] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-[#686b61]">On the shelf</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#233d32]">
            {availableCount}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e5e3db] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-[#686b61]">On loan</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#8b5825]">
            {onLoanCount}
          </p>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6d3c9] bg-white/70 px-5 py-12 text-center">
          <p className="font-medium text-[#30372f]">No books in the library yet</p>
          <p className="mt-2 text-sm text-[#686b61]">
            Books will appear here once they have been added.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {books.map((book) => {
            const isOnLoan = book.memberName !== null;

            return (
              <li
                key={book.id}
                className="flex min-h-44 flex-col justify-between rounded-2xl border border-[#e5e3db] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#85877e]">
                      {book.year}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isOnLoan
                          ? "bg-[#f8ecd9] text-[#80501d]"
                          : "bg-[#e6f0e8] text-[#2c5a3f]"
                      }`}
                    >
                      {isOnLoan ? "On loan" : "Available"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-[#252c26]">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#686b61]">
                    by {book.authorName}
                  </p>
                </div>

                <p className="mt-5 border-t border-[#eeece6] pt-3 text-sm leading-5 text-[#50564d]">
                  {isOnLoan && book.dueOn ? (
                    <>
                      On loan to{" "}
                      <span className="font-medium text-[#30372f]">
                        {book.memberName}
                      </span>
                      , due {formatDueDate(book.dueOn)}
                    </>
                  ) : (
                    "Ready to borrow"
                  )}
                </p>
                <BookActions book={book} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function BookListFallback() {
  return (
    <div
      aria-label="Loading books"
      className="grid animate-pulse gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-44 rounded-2xl border border-[#e5e3db] bg-white"
        />
      ))}
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  return (
    <main className="min-h-screen bg-[#f6f5ef] px-4 pb-12 text-[#252c26] sm:px-6 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[#e4e2d9] py-4 sm:py-5">
          <Link href="/" className="flex min-h-11 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#294737] text-lg text-white">
              L
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#30372f] sm:text-base">
              The Reading Room
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center text-sm font-medium">
            <Link aria-current="page" className="mr-5 text-[#294737]" href="/">
              Books
            </Link>
            <Link className="text-[#73766d] hover:text-[#294737]" href="/members">
              Members
            </Link>
          </nav>
        </header>

        <section className="py-9 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#54715d]">
            A little something for your next chapter
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#233d32] sm:text-5xl">
            Find your next good read.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#686b61] sm:mt-4 sm:text-base">
            Browse the collection and see what is waiting on the shelf.
          </p>
        </section>

        <section aria-labelledby="collection-heading">
          <Suspense fallback={null}>
            <DeletionNotice searchParams={searchParams} />
          </Suspense>
          <div className="mb-4 flex items-end justify-between sm:mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#85877e]">
                The collection
              </p>
              <h2
                id="collection-heading"
                className="mt-1 text-xl font-semibold tracking-tight text-[#30372f] sm:text-2xl"
              >
                Books
              </h2>
            </div>
          </div>
          <AddBookForm />
          <Suspense fallback={<BookListFallback />}>
            <BookList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
