"use client";

import { useEffect, useState } from "react";
import type { AddBookState, LoanActionState, TrashActionState } from "./actions";

export default function Toast({
  state,
}: {
  state: AddBookState | LoanActionState | TrashActionState;
}) {
  const [dismissedState, setDismissedState] = useState<
    AddBookState | LoanActionState | TrashActionState | null
  >(null);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    const timer = window.setTimeout(() => setDismissedState(state), 4000);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (!state.message || dismissedState === state) {
    return null;
  }

  const isError = state.status === "error";
  return (
    <div
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
        isError
          ? "border-[#d7aaa2] bg-[#fbefed] text-[#9b3d2c]"
          : "border-[#c6d9ca] bg-[#e6f0e8] text-[#2c5a3f]"
      }`}
      role={isError ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}
