export default function DataLoadError({ resource }: { resource: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-[#d6d3c9] bg-white/70 px-5 py-10 text-center"
      role="alert"
    >
      <p className="font-medium text-[#30372f]">Could not load {resource}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#686b61]">
        The library database could not be reached. Check the database connection
        settings and make sure the database is available, then try again.
      </p>
      <a
        className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-[#d6d3c9] px-4 text-sm font-semibold text-[#294737] hover:bg-white"
        href=""
      >
        Try again
      </a>
    </div>
  );
}
