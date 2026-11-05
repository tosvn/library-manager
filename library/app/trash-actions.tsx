"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";
import { emptyTrash, restoreBook, type TrashActionState } from "./actions";

const initialState: TrashActionState = { message: "", status: null };

export function RestoreBookButton({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(
    restoreBook,
    initialState,
  );

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={id} />
      <button
        className="min-h-10 rounded-lg bg-[#294737] px-4 text-sm font-semibold text-white hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className="mt-2 text-sm text-[#9b3d2c]"
          role="alert"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export function EmptyTrashButton({ disabled }: { disabled: boolean }) {
  function confirmEmpty(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Permanently delete every book in Trash? This cannot be undone.")) {
      event.preventDefault();
    }
  }

  return (
    <form action={emptyTrash} onSubmit={confirmEmpty}>
      <button
        className="min-h-10 rounded-lg border border-[#d7aaa2] px-4 text-sm font-semibold text-[#9b3d2c] hover:bg-[#fbefed] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        type="submit"
      >
        Empty Trash
      </button>
    </form>
  );
}