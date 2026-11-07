"use client";

import { useRouter } from "next/navigation";

export default function RetryButton() {
  const router = useRouter();

  return (
    <button
      className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#294737] hover:bg-white"
      onClick={() => router.refresh()}
      type="button"
    >
      Try again
    </button>
  );
}
