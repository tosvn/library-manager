import { Suspense } from "react";
import { connection } from "next/server";
import AddMemberForm from "../add-member-form";
import DataLoadError from "../data-load-error";
import SiteHeader from "../site-header";
import { getMembers, type LibraryMember } from "@/db/queries";

async function MemberList() {
  await connection();
  let members: LibraryMember[];
  try {
    members = await getMembers();
  } catch (error) {
    console.error("Failed to load library members.", error);
    return <DataLoadError resource="members" />;
  }

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
        <SiteHeader currentPage="members" />

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