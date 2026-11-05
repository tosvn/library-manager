import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import AddMemberForm from "../add-member-form";
import { getMembers } from "@/db/queries";

async function MemberList() {
  await connection();
  const members = await getMembers();

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d6d3c9] bg-white/70 px-5 py-12 text-center">
        <p className="font-medium text-[#30372f]">No members yet</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <li
          key={member.id}
          className="rounded-2xl border border-[#e5e3db] bg-white p-5 shadow-sm"
        >
          <h3 className="font-semibold text-[#30372f]">{member.name}</h3>
          <p className="mt-2 text-sm text-[#686b61]">
            {member.phone || "No phone number"}
          </p>
        </li>
      ))}
    </ul>
  );
}

function MemberListFallback() {
  return (
    <div
      aria-label="Loading members"
      className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-24 rounded-2xl border border-[#e5e3db] bg-white"
        />
      ))}
    </div>
  );
}

export default function MembersPage() {
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
            <Link className="mr-5 text-[#73766d] hover:text-[#294737]" href="/">
              Books
            </Link>
            <Link aria-current="page" className="text-[#294737]" href="/members">
              Members
            </Link>
          </nav>
        </header>

        <section className="py-9 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#54715d]">
            Community library
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#233d32] sm:text-5xl">
            Members
          </h1>
        </section>

        <AddMemberForm />
        <Suspense fallback={<MemberListFallback />}>
          <MemberList />
        </Suspense>
      </div>
    </main>
  );
}