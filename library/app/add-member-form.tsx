"use client";

import { useActionState } from "react";
import { addMember, type AddMemberState } from "./actions";

const initialState: AddMemberState = { message: "", status: null };

export default function AddMemberForm() {
  const [state, formAction, isPending] = useActionState(addMember, initialState);

  return (
    <form
      action={formAction}
      className="mb-6 rounded-2xl border border-[#e5e3db] bg-white p-4 shadow-sm sm:mb-8 sm:p-5"
    >
      <h3 className="text-base font-semibold text-[#30372f]">Add a member</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm font-medium text-[#50564d]">
          Name
          <input
            autoComplete="name"
            className="mt-1.5 block min-h-11 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-base text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20"
            name="name"
            type="text"
          />
        </label>
        <label className="block text-sm font-medium text-[#50564d]">
          Phone <span className="font-normal text-[#85877e]">(optional)</span>
          <input
            autoComplete="tel"
            className="mt-1.5 block min-h-11 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-base text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20"
            name="phone"
            type="tel"
          />
        </label>
        <button
          className="min-h-11 rounded-lg bg-[#294737] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#20392c] disabled:cursor-wait disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Adding..." : "Add member"}
        </button>
      </div>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${
            state.status === "success" ? "text-[#2c5a3f]" : "text-[#9b3d2c]"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}