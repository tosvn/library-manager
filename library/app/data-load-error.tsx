import RetryButton from "./retry-button";

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
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#686b61]">
        If the problem continues, contact your library administrator and include
        the page you were opening and when the error occurred. Never send
        passwords or database connection URLs.
      </p>
      <RetryButton />
    </div>
  );
}
