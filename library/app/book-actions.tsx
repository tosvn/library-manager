"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  deleteBook,
  lendBook,
  returnBook,
  updateBook,
  type AddBookState,
  type LoanActionState,
} from "./actions";
import type { BookWithLoan, LibraryMember } from "@/db/queries";

const initialState: AddBookState = { message: "", status: null };
const initialLoanState: LoanActionState = { message: "", status: null };
const inputClassName =
  "mt-1 block min-h-10 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-sm text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20";

function ActionMessage({
  state,
}: {
  state: AddBookState | LoanActionState;
}) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`mt-3 text-sm ${
        state.status === "success" ? "text-[#2c5a3f]" : "text-[#9b3d2c]"
      }`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export default function BookActions({
  book,
  members,
}: {
  book: BookWithLoan;
  members: LibraryMember[];
}) {
  const [editState, editAction, editPending] = useActionState(
    updateBook,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBook,
    initialState,
  );
  const [lendState, lendAction, lendPending] = useActionState(
    lendBook,
    initialLoanState,
  );
  const [returnState, returnAction, returnPending] = useActionState(
    returnBook,
    initialLoanState,
  );
  const isOnLoan = book.memberName !== null;

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <div className="mt-4 border-t border-[#eeece6] pt-3">
      {isOnLoan ? (
        <form action={returnAction} className="mb-4">
          <input name="bookId" type="hidden" value={book.id} />
          <button
            className="min-h-10 rounded-lg bg-[#294737] px-4 text-sm font-semibold text-white hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
            disabled={returnPending}
            type="submit"
          >
            {returnPending ? "Recording return..." : "Record return"}
          </button>
          <ActionMessage state={returnState} />
        </form>
      ) : members.length > 0 ? (
        <form action={lendAction} className="mb-4 grid gap-3">
          <input name="bookId" type="hidden" value={book.id} />
          <label className="block text-xs font-medium text-[#50564d]">
            Lend to
            <select
              className={inputClassName}
              defaultValue=""
              name="memberId"
              required
            >
              <option disabled value="">
                Choose a member
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="min-h-10 rounded-lg bg-[#294737] px-4 text-sm font-semibold text-white hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
            disabled={lendPending}
            type="submit"
          >
            {lendPending ? "Lending..." : "Lend book"}
          </button>
          <ActionMessage state={lendState} />
        </form>
      ) : (
        <p className="mb-4 text-sm text-[#686b61]">
          Add a member before lending. <Link className="font-medium text-[#294737] underline" href="/members">Go to Members</Link>
        </p>
      )}

      <details>
        <summary className="w-fit cursor-pointer text-sm font-semibold text-[#294737] underline-offset-2 hover:underline">
          Edit book
        </summary>
        <form action={editAction} className="mt-3 grid gap-3">
          <input name="id" type="hidden" value={book.id} />
          <label className="block text-xs font-medium text-[#50564d]">
            Title
            <input
              className={inputClassName}
              defaultValue={book.title}
              name="title"
              required
              type="text"
            />
          </label>
          <label className="block text-xs font-medium text-[#50564d]">
            Author
            <input
              className={inputClassName}
              defaultValue={book.authorName}
              name="author"
              required
              type="text"
            />
          </label>
          <label className="block text-xs font-medium text-[#50564d]">
            Year
            <input
              className={inputClassName}
              defaultValue={book.year}
              inputMode="numeric"
              name="year"
              required
              type="text"
            />
          </label>
          <button
            className="min-h-10 rounded-lg bg-[#294737] px-4 text-sm font-semibold text-white hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
            disabled={editPending}
            type="submit"
          >
            {editPending ? "Saving..." : "Save changes"}
          </button>
          <ActionMessage state={editState} />
        </form>
      </details>

      <form action={deleteAction} className="mt-3" onSubmit={confirmDelete}>
        <input name="id" type="hidden" value={book.id} />
        <button
          className="min-h-10 rounded-lg border border-[#d7aaa2] px-4 text-sm font-semibold text-[#9b3d2c] hover:bg-[#fbefed] disabled:cursor-wait disabled:opacity-60"
          disabled={deletePending}
          type="submit"
        >
          {deletePending ? "Deleting..." : "Delete book"}
        </button>
        {isOnLoan && (
          <p className="mt-2 text-xs text-[#686b61]">
            This book must be returned before it can be deleted.
          </p>
        )}
        <ActionMessage state={deleteState} />
      </form>
    </div>
  );
}
