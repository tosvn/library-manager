"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateMember, type AddMemberState } from "./actions";
import type { LibraryMember } from "@/db/queries";
import Toast from "./toast";

const initialState: AddMemberState = { message: "", status: null };
const inputClassName =
  "mt-1.5 block min-h-11 w-full rounded-lg border border-[#d6d3c9] bg-white px-3 text-base text-[#252c26] outline-none focus:border-[#54715d] focus:ring-2 focus:ring-[#54715d]/20";

export default function MemberActions({ member }: { member: LibraryMember }) {
  const [state, formAction, isPending] = useActionState(updateMember, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state]);

  return (
    <>
      <button
        className="mt-4 min-h-10 rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#50564d] hover:bg-[#f3f2ed]"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Edit member
      </button>
      <dialog
        aria-labelledby={`edit-member-title-${member.id}`}
        className="library-dialog fixed left-1/2 top-1/2 m-0 w-[min(100%-2rem,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e5e3db] bg-white p-0 text-[#252c26] shadow-2xl backdrop:bg-black/40"
        ref={dialogRef}
      >
        <form action={formAction} className="p-5 sm:p-6">
          <input name="id" type="hidden" value={member.id} />
          <div className="flex items-start justify-between gap-4">
            <h2
              className="text-xl font-semibold text-[#30372f]"
              id={`edit-member-title-${member.id}`}
            >
              Edit member
            </h2>
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
              Name
              <input
                autoComplete="name"
                className={inputClassName}
                defaultValue={member.name}
                name="name"
                required
                type="text"
              />
            </label>
            <label className="block text-sm font-medium text-[#50564d]">
              Phone <span className="font-normal text-[#85877e]">(optional)</span>
              <input
                autoComplete="tel"
                className={inputClassName}
                defaultValue={member.phone ?? ""}
                name="phone"
                type="tel"
              />
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
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
      <Toast state={state} />
    </>
  );
}
