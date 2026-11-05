import { connection } from "next/server";
import { Suspense } from "react";
import {
  getBooks,
  getMembers,
  type BookWithLoan,
  type LibraryMember,
} from "@/db/queries";
import BookCollection from "./book-collection";
import DataLoadError from "./data-load-error";
import SiteHeader from "./site-header";

async function Collection() {
  await connection();
  let books: BookWithLoan[] | undefined;
  let members: LibraryMember[] | undefined;
  try {
    [books, members] = await Promise.all([getBooks(), getMembers()]);
  } catch (error) {
    console.error("Failed to load the book collection.", error);
  }
  if (!books || !members) {
    return <DataLoadError resource="the book collection" />;
  }
  return <BookCollection books={books} members={members} />;
}

function CollectionFallback() {
  return (
    <div aria-label="Loading collection" className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-44 rounded-2xl border border-[#e5e3db] bg-white" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f5ef] px-4 pb-12 text-[#252c26] sm:px-6 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <SiteHeader currentPage="books" />
        <section className="py-9 sm:py-12">
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
        <Suspense fallback={<CollectionFallback />}>
          <Collection />
        </Suspense>
      </div>
    </main>
  );
}
