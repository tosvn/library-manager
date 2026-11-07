"use client";

import { useActionState, useEffect, useRef } from "react";
import { addBook, type AddBookState } from "./actions";
import Toast from "./toast";

const initialState: AddBookState = { message: "", status: null };
const inputClassName =
  "mt-1.5 block min-h-11 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-base text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20";

export default function AddBookForm() {
  const [state, formAction, isPending] = useActionState(addBook, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state]);

  return (
    <>
      <button
        className="min-h-11 rounded-lg bg-[#294737] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#20392c]"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Add book
      </button>
      <dialog
        aria-labelledby="add-book-title"
        className="library-dialog fixed left-1/2 top-1/2 m-0 w-[min(100%-2rem,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e5e3db] bg-white p-0 text-[#252c26] shadow-2xl backdrop:bg-black/40"
        ref={dialogRef}
      >
        <form action={formAction} className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#85877e]">Collection</p>
              <h2 id="add-book-title" className="mt-1 text-xl font-semibold text-[#30372f]">Add a book</h2>
            </div>
            <button
              aria-label="Close dialog"
              className="grid size-9 place-items-center rounded-lg text-xl text-[#686b61] hover:bg-[#f3f2ed]"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            <label className="block text-sm font-medium text-[#50564d]">
              Title
              <input
                aria-describedby={state.fieldErrors?.title ? "add-book-title-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors?.title)}
                autoComplete="off"
                className={inputClassName}
                name="title"
                onInput={(event) => event.currentTarget.setCustomValidity("")}
                onInvalid={(event) => event.currentTarget.setCustomValidity("Please enter a book title.")}
                required
                type="text"
              />
              {state.fieldErrors?.title && (
                <span className="mt-1 block text-sm text-[#9b3d2c]" id="add-book-title-error">
                  {state.fieldErrors.title}
                </span>
              )}
            </label>
            <label className="block text-sm font-medium text-[#50564d]">
              Author
              <input
                aria-describedby={state.fieldErrors?.author ? "add-book-author-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors?.author)}
                autoComplete="off"
                className={inputClassName}
                name="author"
                onInput={(event) => event.currentTarget.setCustomValidity("")}
                onInvalid={(event) => event.currentTarget.setCustomValidity("Please enter an author.")}
                required
                type="text"
              />
              {state.fieldErrors?.author && (
                <span className="mt-1 block text-sm text-[#9b3d2c]" id="add-book-author-error">
                  {state.fieldErrors.author}
                </span>
              )}
            </label>
            <label className="block text-sm font-medium text-[#50564d]">
              Year
              <input
                aria-describedby={state.fieldErrors?.year ? "add-book-year-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors?.year)}
                autoComplete="off"
                className={inputClassName}
                max={new Date().getFullYear()}
                min="1"
                name="year"
                onInput={(event) => event.currentTarget.setCustomValidity("")}
                onInvalid={(event) => {
                  const input = event.currentTarget;
                  input.setCustomValidity(
                    input.validity.valueMissing
                      ? "Please enter a publication year."
                      : `Enter a whole year between 1 and ${new Date().getFullYear()}.`,
                  );
                }}
                placeholder="e.g. 1987"
                required
                step="1"
                type="number"
              />
              {state.fieldErrors?.year && (
                <span className="mt-1 block text-sm text-[#9b3d2c]" id="add-book-year-error">
                  {state.fieldErrors.year}
                </span>
              )}
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="min-h-11 rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#50564d] hover:bg-[#f3f2ed]"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-[#294737] px-5 text-sm font-semibold text-white hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Adding..." : "Save book"}
            </button>
          </div>
        </form>
      </dialog>
      <Toast state={state} />
    </>
  );
}
