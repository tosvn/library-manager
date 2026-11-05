"use client";

import { useActionState, useEffect, useRef } from "react";
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
import Toast from "./toast";

const initialState: AddBookState = { message: "", status: null };
const initialLoanState: LoanActionState = { message: "", status: null };
const inputClassName =
  "mt-1 block min-h-10 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-sm text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20";

export default function BookActions({
  book,
  members,
}: {
  book: BookWithLoan;
  members: LibraryMember[];
}) {
  const [editState, editAction, editPending] = useActionState(updateBook, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteBook, initialState);
  const [lendState, lendAction, lendPending] = useActionState(lendBook, initialLoanState);
  const [returnState, returnAction, returnPending] = useActionState(returnBook, initialLoanState);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const lendDialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const isOnLoan = book.memberName !== null;

  useEffect(() => {
    if (editState.status === "success") {
      editDialogRef.current?.close();
    }
  }, [editState]);

  useEffect(() => {
    if (lendState.status === "success") {
      lendDialogRef.current?.close();
    }
  }, [lendState]);

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Move “${book.title}” to Trash? You can restore it within 20 days.`)) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {isOnLoan ? (
        <form action={returnAction}>
          <input name="bookId" type="hidden" value={book.id} />
          <button
            className="min-h-10 rounded-lg bg-[#294737] px-4 text-sm font-semibold text-white hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
            disabled={returnPending}
            type="submit"
          >
            {returnPending ? "Returning..." : "Return"}
          </button>
        </form>
      ) : (
        <button
          className="min-h-10 rounded-lg bg-[#294737] px-4 text-sm font-semibold text-white hover:bg-[#20392c]"
          onClick={() => lendDialogRef.current?.showModal()}
          type="button"
        >
          Lend
        </button>
      )}

      <details className="relative" ref={menuRef}>
        <summary
          aria-label={`More actions for ${book.title}`}
          className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-[#d6d3c9] text-xl leading-none text-[#50564d] hover:bg-[#f3f2ed] [&::-webkit-details-marker]:hidden"
        >
          ⋯
        </summary>
        <div className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-xl border border-[#e5e3db] bg-white p-1 shadow-lg">
          <button
            className="block min-h-10 w-full rounded-lg px-3 text-left text-sm text-[#30372f] hover:bg-[#f3f2ed]"
            onClick={() => {
              menuRef.current?.removeAttribute("open");
              editDialogRef.current?.showModal();
            }}
            type="button"
          >
            Edit details
          </button>
          <form action={deleteAction} onSubmit={confirmDelete}>
            <input name="id" type="hidden" value={book.id} />
            <button
              className="block min-h-10 w-full rounded-lg px-3 text-left text-sm text-[#9b3d2c] hover:bg-[#fbefed] disabled:opacity-60"
              disabled={deletePending || isOnLoan}
              title={isOnLoan ? "Return this book before moving it to Trash" : undefined}
              type="submit"
            >
              {deletePending ? "Moving..." : "Move to Trash"}
            </button>
          </form>
        </div>
      </details>

      <dialog
        aria-labelledby={`lend-title-${book.id}`}
        className="w-[min(100%-2rem,30rem)] rounded-2xl border border-[#e5e3db] bg-white p-0 text-[#252c26] shadow-2xl backdrop:bg-black/40"
        ref={lendDialogRef}
      >
        <form action={lendAction} className="p-5 sm:p-6">
          <input name="bookId" type="hidden" value={book.id} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#85877e]">Lend book</p>
              <h2 id={`lend-title-${book.id}`} className="mt-1 text-xl font-semibold text-[#30372f]">{book.title}</h2>
            </div>
            <button
              aria-label="Close dialog"
              className="grid size-9 place-items-center rounded-lg text-xl text-[#686b61] hover:bg-[#f3f2ed]"
              onClick={() => lendDialogRef.current?.close()}
              type="button"
            >
              ×
            </button>
          </div>
          {members.length > 0 ? (
            <label className="mt-5 block text-sm font-medium text-[#50564d]">
              Lend to
              <select className={inputClassName} defaultValue="" name="memberId" required>
                <option disabled value="">Choose a member</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </label>
          ) : (
            <p className="mt-5 text-sm text-[#686b61]">
              Add a member before lending. <Link className="font-medium text-[#294737] underline" href="/members">Go to Members</Link>
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="min-h-11 rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#50564d] hover:bg-[#f3f2ed]"
              onClick={() => lendDialogRef.current?.close()}
              type="button"
            >
              Cancel
            </button>
            {members.length > 0 && (
              <button
                className="min-h-11 rounded-lg bg-[#294737] px-5 text-sm font-semibold text-white hover:bg-[#20392c] disabled:opacity-60"
                disabled={lendPending}
                type="submit"
              >
                {lendPending ? "Lending..." : "Confirm loan"}
              </button>
            )}
          </div>
        </form>
      </dialog>

      <dialog
        aria-labelledby={`edit-title-${book.id}`}
        className="w-[min(100%-2rem,34rem)] rounded-2xl border border-[#e5e3db] bg-white p-0 text-[#252c26] shadow-2xl backdrop:bg-black/40"
        ref={editDialogRef}
      >
        <form action={editAction} className="p-5 sm:p-6">
          <input name="id" type="hidden" value={book.id} />
          <div className="flex items-start justify-between gap-4">
            <h2 id={`edit-title-${book.id}`} className="text-xl font-semibold text-[#30372f]">Edit book</h2>
            <button
              aria-label="Close dialog"
              className="grid size-9 place-items-center rounded-lg text-xl text-[#686b61] hover:bg-[#f3f2ed]"
              onClick={() => editDialogRef.current?.close()}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            <label className="block text-sm font-medium text-[#50564d]">
              Title
              <input className={inputClassName} defaultValue={book.title} name="title" required type="text" />
            </label>
            <label className="block text-sm font-medium text-[#50564d]">
              Author
              <input className={inputClassName} defaultValue={book.authorName} name="author" required type="text" />
            </label>
            <label className="block text-sm font-medium text-[#50564d]">
              Year
              <input className={inputClassName} defaultValue={book.year} inputMode="numeric" name="year" required type="text" />
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="min-h-11 rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#50564d] hover:bg-[#f3f2ed]"
              onClick={() => editDialogRef.current?.close()}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-[#294737] px-5 text-sm font-semibold text-white hover:bg-[#20392c] disabled:opacity-60"
              disabled={editPending}
              type="submit"
            >
              {editPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
      <Toast state={editState} />
      <Toast state={deleteState} />
      <Toast state={lendState} />
      <Toast state={returnState} />
    </div>
  );
}
