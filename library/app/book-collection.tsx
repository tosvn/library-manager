"use client";

import { useMemo, useState } from "react";
import type { BookWithLoan, LibraryMember } from "@/db/queries";
import AddBookForm from "./add-book-form";
import BookActions from "./book-actions";

type StatusFilter = "all" | "available" | "on-loan" | "overdue";
type SortOrder = "title" | "author" | "year" | "due-date";

function isOverdue(book: BookWithLoan, today: string) {
  return book.memberName !== null && book.dueOn !== null && book.dueOn < today;
}

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function StatusBadge({ book, today }: { book: BookWithLoan; today: string }) {
  const overdue = isOverdue(book, today);
  const onLoan = book.memberName !== null;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        overdue
          ? "bg-[#f8e2df] text-[#9b3d2c]"
          : onLoan
            ? "bg-[#f8ecd9] text-[#80501d]"
            : "bg-[#e6f0e8] text-[#2c5a3f]"
      }`}
    >
      {overdue ? "Overdue" : onLoan ? "On loan" : "Available"}
    </span>
  );
}

export default function BookCollection({
  books,
  members,
}: {
  books: BookWithLoan[];
  members: LibraryMember[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOrder>("title");
  const [view, setView] = useState<"cards" | "table">("cards");
  const today = new Date().toISOString().slice(0, 10);
  const availableCount = books.filter((book) => book.memberName === null).length;
  const onLoanCount = books.length - availableCount;
  const overdueCount = books.filter((book) => isOverdue(book, today)).length;

  const visibleBooks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...books]
      .filter((book) => {
        const matchesSearch =
          !query ||
          book.title.toLocaleLowerCase().includes(query) ||
          book.authorName.toLocaleLowerCase().includes(query);
        const matchesStatus =
          status === "all" ||
          (status === "available" && book.memberName === null) ||
          (status === "on-loan" && book.memberName !== null) ||
          (status === "overdue" && isOverdue(book, today));
        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        if (sort === "author") {
          return left.authorName.localeCompare(right.authorName) || left.title.localeCompare(right.title);
        }
        if (sort === "year") {
          return right.year - left.year || left.title.localeCompare(right.title);
        }
        if (sort === "due-date") {
          return (left.dueOn ?? "9999-12-31").localeCompare(right.dueOn ?? "9999-12-31");
        }
        return left.title.localeCompare(right.title);
      });
  }, [books, search, sort, status, today]);

  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "on-loan", label: "On loan" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <>
      <section aria-label="Library overview" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total books", value: books.length, tone: "text-[#233d32]" },
          { label: "Available", value: availableCount, tone: "text-[#2c5a3f]" },
          { label: "On loan", value: onLoanCount, tone: "text-[#80501d]" },
          { label: "Overdue", value: overdueCount, tone: "text-[#9b3d2c]" },
          { label: "Active members", value: members.length, tone: "text-[#233d32]" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#e5e3db] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#686b61] sm:text-sm">{item.label}</p>
            <p className={`mt-1 text-2xl font-semibold tracking-tight ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="collection-heading">
        <div className="mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#85877e]">
              The collection
            </p>
            <h2 id="collection-heading" className="mt-1 text-xl font-semibold tracking-tight text-[#30372f] sm:text-2xl">
              Books <span className="text-base font-normal text-[#85877e]">({visibleBooks.length})</span>
            </h2>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-[#e5e3db] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_auto_auto_auto] md:items-center">
            <label className="relative block">
              <span className="sr-only">Search books</span>
              <input
                className="min-h-11 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-sm text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or author"
                type="search"
                value={search}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-[#50564d]">
              Sort
              <select
                className="min-h-11 rounded-lg border border-[#d6d3c9] bg-white px-3 text-sm text-[#252c26]"
                onChange={(event) => setSort(event.target.value as SortOrder)}
                value={sort}
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Year</option>
                <option value="due-date">Due date</option>
              </select>
            </label>
            <div aria-label="Book display" className="flex rounded-lg border border-[#d6d3c9] p-1" role="group">
              {(["cards", "table"] as const).map((option) => (
                <button
                  key={option}
                  aria-pressed={view === option}
                  className={`min-h-9 rounded-md px-3 text-sm font-medium capitalize ${
                    view === option ? "bg-[#294737] text-white" : "text-[#50564d] hover:bg-[#f3f2ed]"
                  }`}
                  onClick={() => setView(option)}
                  type="button"
                >
                  {option === "cards" ? "Cards" : "List"}
                </button>
              ))}
            </div>
            <div className="justify-self-start md:justify-self-end">
              <AddBookForm />
            </div>
          </div>
          <div aria-label="Filter by status" className="mt-3 flex flex-wrap gap-2" role="group">
            {filters.map((filter) => (
              <button
                key={filter.value}
                aria-pressed={status === filter.value}
                className={`min-h-9 rounded-full border px-3 text-sm font-medium ${
                  status === filter.value
                    ? "border-[#294737] bg-[#e6f0e8] text-[#294737]"
                    : "border-[#e5e3db] text-[#686b61] hover:bg-[#f6f5ef]"
                }`}
                onClick={() => setStatus(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6d3c9] bg-white/70 px-5 py-12 text-center">
            <p className="font-medium text-[#30372f]">Your library is ready for its first book</p>
            <p className="mt-2 text-sm text-[#686b61]">Add a book to start building your collection.</p>
            <div className="mt-4"><AddBookForm /></div>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6d3c9] bg-white/70 px-5 py-12 text-center">
            <p className="font-medium text-[#30372f]">No books match your search</p>
            <p className="mt-2 text-sm text-[#686b61]">Try another title or author, or clear the selected filters.</p>
            <button
              className="mt-4 min-h-10 rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#294737] hover:bg-white"
              onClick={() => { setSearch(""); setStatus("all"); }}
              type="button"
            >
              Clear search and filters
            </button>
          </div>
        ) : view === "cards" ? (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {visibleBooks.map((book) => (
              <li key={book.id} className="flex min-h-44 flex-col justify-between rounded-2xl border border-[#e5e3db] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#85877e]">{book.year}</p>
                    <StatusBadge book={book} today={today} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-[#252c26]">{book.title}</h3>
                  <p className="mt-1 text-sm text-[#686b61]">by {book.authorName}</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eeece6] pt-3">
                  <p className="min-w-0 text-sm leading-5 text-[#50564d]">
                    {book.memberName && book.dueOn ? (
                      <>To {book.memberName}, due {formatDueDate(book.dueOn)}</>
                    ) : "On the shelf"}
                  </p>
                  <BookActions book={book} members={members} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#e5e3db] bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="border-b border-[#e5e3db] bg-[#f3f2ed] text-xs uppercase tracking-wide text-[#686b61]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Book</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Loan details</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeece6]">
                {visibleBooks.map((book) => (
                  <tr key={book.id} className="text-[#30372f]">
                    <td className="px-4 py-3 font-semibold">{book.title}</td>
                    <td className="px-4 py-3">{book.authorName}</td>
                    <td className="px-4 py-3">{book.year}</td>
                    <td className="px-4 py-3"><StatusBadge book={book} today={today} /></td>
                    <td className="px-4 py-3 text-[#686b61]">
                      {book.memberName && book.dueOn ? `${book.memberName} · due ${formatDueDate(book.dueOn)}` : "—"}
                    </td>
                    <td className="px-4 py-3"><BookActions book={book} members={members} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
